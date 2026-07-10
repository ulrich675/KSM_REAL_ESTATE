# Kernel-Core Integration — KSM Real Estate Backend

> **Date :** 2026-07-09 | **Auteur :** Antigravity  
> **Version kernel-core :** RT-Comops / Yowyob (multi-tenant hexagonal)

---

## 1. Endpoints utilisés

| Phase | Service kernel | Endpoint | Méthode |
|-------|---------------|----------|---------|
| Auth | auth-core | `/api/auth/sign-up` | POST |
| Auth | auth-core | `/api/auth/login` | POST |
| Auth | auth-core | `/api/auth/login/mfa/confirm` | POST |
| Paiement | billing-core | `/api/paiement` | POST |
| Fichiers | file-core | **BLOQUÉ** — voir §4 | - |

---

## 2. Architecture des appels sortants

Chaque appel vers le kernel-core porte obligatoirement :

```
X-Client-Id:       dev-platform-backend  (via KERNEL_CORE_CLIENT_ID)
X-Api-Key:         dev-api-key           (via KERNEL_CORE_API_KEY)
X-Tenant-Id:       11111111-...          (via KERNEL_CORE_TENANT_ID)
X-Organization-Id: 22222222-...          (via KERNEL_CORE_ORGANIZATION_ID, services scopés org)
Authorization:     Bearer <user-token>   (propagé depuis le contexte réactif)
```

> **IMPORTANT :** Ces credentials ne sont jamais exposés au frontend —  
> ils restent exclusivement côté backend dans les variables d'environnement.

---

## 3. Décisions architecturales prises

### 3.1 Gestion des utilisateurs — Option A (cache local)
La table `users` locale est maintenue en **lecture/cache** après chaque sign-up ou login  
réussi côté kernel-core.  
- `userId` reste un `Long` local (pas de rupture de FK avec `properties`, `visit_requests`, `payments`)
- `passwordHash` est vide (`""`) — l'auth est externalisée
- **Validation humaine requise** si l'option B (userId = UUID kernel) est préférée en production

### 3.2 Paiement — billing-core (pas cashier-core)
`cashier-core` exige une session de caisse (DS-CA-01 à DS-CA-06), inadaptée à un paiement  
web self-service. `billing-core` est utilisé via `POST /api/paiement`.

> **Validation humaine requise :** Le schéma JSON exact du body attendu par `POST /api/paiement`  
> est une **hypothèse** basée sur le modèle du domaine (clientId, montant, devise). À vérifier  
> contre une instance kernel-core réelle avant mise en production.

> **Point d'attention CASHIER/BILLING :** Si `cashier-core` est finalement utilisé,  
> vérifier que l'organisation KSM est abonnée à **ACCOUNTING** ET **CASHIER** (dépendance documentée).

### 3.3 Commentaires — Option A (local, pas de kernel-core)
Aucun module `comment-core` n'existe parmi les 20 cores documentés. Les commentaires  
sont gérés entièrement en local via la table `comments` (nouveauté, migration `02-add-comments-table.yaml`).

### 3.4 MFA
Le backend détecte `nextStep = "CONFIRM_MFA"` dans la réponse kernel et expose :
- `POST /api/auth/login` → retourne `mfaToken` + `nextStep` si MFA requise  
- `POST /api/auth/login/mfa/confirm` → confirme avec `{mfaToken, code}`

---

## 4. Phase 4 — file-core : BLOQUÉ

**Raison :** Aucun endpoint REST file-core n'est documenté dans les 3 rapports fournis.  
`KernelCoreFileAdapter` lève une `UnsupportedOperationException` explicite.

**Pour débloquer :**
- Fournir une collection Postman, une spec OpenAPI, ou du code source du file-core
- Question exacte : *"Quel endpoint REST expose file-core pour l'upload d'un fichier  
  et son association à une entité métier (targetType, targetId) ?"*

---

## 5. Codes d'erreur kernel gérés

| Code kernel | HTTP KSM | Signification |
|------------|---------|--------------|
| `TENANT_REQUEST_QUOTA_EXCEEDED` | 429 | Quota tenant atteint |
| `ORGANIZATION_SERVICE_QUOTA_EXCEEDED` | 429 | Quota organisation atteint |
| `ORGANIZATION_SERVICE_NOT_SUBSCRIBED` | 403 | Service non activé pour cette org |
| `CLIENT_APPLICATION_SERVICE_NOT_ALLOWED` | 500 (log ERROR) | Mauvaise config — ne devrait pas arriver en prod |
| `ORGANIZATION_CONTEXT_REQUIRED` | 500 (bug interne) | Header X-Organization-Id manquant |
| Refus RBAC | 403 | Permissions insuffisantes du token |

---

## 6. Variables d'environnement requises en production

```bash
KERNEL_CORE_BASE_URL=https://kernel.production.example.com
KERNEL_CORE_CLIENT_ID=<client-id-production>
KERNEL_CORE_API_KEY=<api-key-production>
KERNEL_CORE_TENANT_ID=<uuid-tenant-production>
KERNEL_CORE_ORGANIZATION_ID=<uuid-org-production>
```

> **En prod, les identifiants `dev-*` sont rejetés (401).**  
> S'assurer que l'organisation de production est abonnée aux services  
> BILLING (POST /api/organizations/{id}/services).

---

## 7. Questions ouvertes — validation humaine requise

| # | Question | Statut final |
|---|----------|-------------|
| Q1 | Option A (cache local userId Long) vs Option B (UUID kernel) pour les utilisateurs ? | ✅ **CONFIRMÉ — Option A** (validé session 2026-07-09) |
| Q2 | Schéma JSON exact de POST /api/paiement (billing-core) ? | ⏳ **EN ATTENTE DE DOC** — hypothèse (userId, propertyId, amount, currency) en place, TODO dans `KernelCorePaymentAdapter.java` L55 |
| Q3 | Endpoints REST de file-core pour l'upload ? | ⛔ **EN ATTENTE DE DOC** — `KernelCoreFileAdapter` lève `UnsupportedOperationException` |
| Q4 | billing-core ou cashier-core pour les paiements en production ? | ✅ **CONFIRMÉ — billing-core** (validé session 2026-07-09) |
| Q5 | Module commentaires : attendre un comment-core kernel ou valider Option A locale ? | ✅ **CONFIRMÉ — Option A locale** (chaîne hexagonale complète : domain/port/service/adapter/controller/migration) |

> **Q2 / Q3 — Prochaine étape :** fournir une spec OpenAPI, une collection Postman,
> ou du code source du service concerné. Les points d'extension sont :
> - `KernelCorePaymentAdapter.java` L55 — payload `POST /api/paiement`
> - `KernelCoreFileAdapter.java` — méthode `uploadFile()` à implémenter entièrement

