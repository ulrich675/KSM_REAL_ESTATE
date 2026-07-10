# KSM Real Estate — Documentation Projet

> Plateforme immobilière full-stack construite sur une architecture hexagonale (Ports & Adapters).
> **Backend** : Spring Boot 3.2 + R2DBC (WebFlux) · **Frontend** : Next.js 14

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Architecture](#2-architecture)
3. [Intégration kernel-core](#3-intégration-kernel-core)
4. [Démarrage rapide](#4-démarrage-rapide)
5. [Comptes de démonstration](#5-comptes-de-démonstration)
6. [Structure du projet](#6-structure-du-projet)
7. [Endpoints API principaux](#7-endpoints-api-principaux)

---

## 1. Présentation

KSM Real Estate est une application de gestion et d'achat de biens immobiliers proposant :

- Catalogue de biens (villas, appartements, studios)
- Authentification multi-rôles (Admin · Propriétaire · Client)
- Achat de bien et visite virtuelle payante (facturation via kernel-core)
- Avis et système de likes par propriété
- Demandes de visite physique avec validation propriétaire
- Upload de photos de biens via le service de documents kernel-core

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend :3000             │
│  Pages : /, /properties/[id], /dashboard, /connexion│
│  Proxy /api/* → :8080/api/*                         │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / JSON
┌───────────────────────▼─────────────────────────────┐
│            Spring Boot Backend :8080                │
│  Hexagonal Architecture (Ports & Adapters)           │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Domain   │  │ App      │  │ Infrastructure    │  │
│  │ Models   │  │ Services │  │ Controllers/Repos │  │
│  └──────────┘  └──────────┘  └───────────┬───────┘  │
└───────────────────────────────────────────┼─────────┘
                                            │ WebClient
┌───────────────────────────────────────────▼─────────┐
│                  kernel-core (Yowyob)               │
│  auth-core · billing-core · ratings-core · tiers-docs│
└─────────────────────────────────────────────────────┘
```

---

## 3. Intégration kernel-core

Les 4 services kernel-core sont entièrement intégrés côté backend et accessibles depuis le frontend :

### 🔐 auth-core — Authentification
- **Backend** : `KernelCoreAuthAdapter` → `POST /api/auth/login`, `POST /api/auth/register`
- **Frontend** : Page `/connexion` → appels `loginApi()` / `registerApi()` → JWT stocké (`ksm_token`)
- **Fallback** : si kernel-core est hors ligne, le backend lève une exception → page login affiche le message d'erreur

### 💳 billing-core — Facturation / Paiements
- **Backend** : `PaymentService` → `KernelCorePaymentAdapter` → crée une facture kernel puis la poste (POSTED)
- **Frontend** : boutons "Acheter ce bien" et "Visite virtuelle" → `AppContext.acheterBien()` / `acheterVisiteVirtuelle()` → `POST /api/payments`
- **Fallback** : si le paiement échoue, l'utilisateur reçoit une alerte explicite ; aucune donnée corrompue n'est enregistrée

### ⭐ ratings-core — Commentaires & Likes
- **Backend** : `CommentService` — stratégie dual-write : persistance locale (PostgreSQL) + sync asynchrone vers ratings-core
- **Frontend** : fiche bien `/properties/[id]` → formulaire d'avis → `AppContext.addCommentaire()` → `POST /api/comments` ; bouton ♥ → `AppContext.toggleLike()` → `POST /api/comments/property/{id}/like`
- **Chargement initial** : `AppContext` charge au montage les commentaires et le total de likes de chaque bien via `Promise.all()`
- **Fallback** : si kernel-core est hors ligne, le commentaire/like est sauvegardé localement

### 📁 tiers-documents — Gestion des fichiers
- **Backend** : `FileController` expose `POST /api/files/upload` (multipart), `GET /api/files/tiers/{tierId}`, `DELETE /api/files/tiers/{tierId}/{docId}` → délègue à `KernelCoreFileAdapter`
- **Frontend** : dashboard propriétaire → formulaire de création/modification de bien → `uploadOrBase64()` → tente `apiService.uploadFile()` sur le backend ; l'URL retournée est utilisée si disponible
- **Fallback** : si le backend est hors ligne, l'image est convertie en base64 et stockée localement

---

## 4. Démarrage rapide

### Prérequis
- Java 21 · Maven 3.9+
- Node.js 18+ · npm
- PostgreSQL (ou Docker)

### Backend

```bash
# Se placer dans le sous-dossier backend (obligatoire)
cd KSM_REAL_ESTATE_backend

# Configurer la base dans src/main/resources/application.yml
# puis lancer :
mvn spring-boot:run
# Le serveur démarre sur http://localhost:8080
```

### Frontend

```bash
cd KSM_REAL_ESTATE_V
npm install
npm run dev
# L'application est disponible sur http://localhost:3000
```

> **Note** : Le proxy Next.js (`next.config.ts`) redirige automatiquement `/api/*` → `http://localhost:8080/api/*`. Le frontend fonctionne également en mode offline-first (localStorage) si le backend est arrêté.

---

## 5. Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@ksm.cm` | `Admin@2025!` |
| Propriétaire | `prop1@ksm.cm` | `Prop@2025!` |
| Client | `client1@ksm.cm` | `Client@2025!` |

---

## 6. Structure du projet

```
KSM_REAL_ESTATE/
├── KSM_REAL_ESTATE_backend/          # Spring Boot 3.2 — WebFlux + R2DBC
│   └── src/main/java/com/ksm/realestate/
│       ├── domain/model/             # Entités métier (POJO purs)
│       ├── application/
│       │   ├── port/in/              # Use-cases (interfaces)
│       │   ├── port/out/             # Ports sortants (repos, kernel-core)
│       │   └── service/             # Implémentations des use-cases
│       └── infrastructure/
│           ├── adapter/in/           # Controllers REST réactifs
│           ├── adapter/out/
│           │   ├── persistence/      # Repositories R2DBC
│           │   └── kernelcore/       # KernelCore*Adapter (WebClient)
│           ├── config/               # SecurityConfig, WebClientConfig…
│           ├── entity/               # Entités R2DBC (@Table)
│           └── mapper/               # MapStruct mappers
│
└── KSM_REAL_ESTATE_V/                # Next.js 14 — App Router
    └── src/
        ├── app/                      # Pages (/, /properties/[id], /dashboard…)
        ├── components/               # Header, ProtectedRoute…
        ├── context/AppContext.tsx    # Store global (React Context)
        ├── data/properties.ts        # Modèles TypeScript + données mock
        └── services/
            ├── api.ts                # Interface KsmApiService + LocalStorage adapter
            └── httpApi.ts            # HttpApiAdapter (appels HTTP réels)
```

---

## 7. Endpoints API principaux

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion → JWT |
| `GET` | `/api/properties` | Liste des biens |
| `POST` | `/api/properties` | Créer un bien |
| `POST` | `/api/payments` | Traiter un paiement (billing-core) |
| `POST` | `/api/comments` | Ajouter un commentaire |
| `GET` | `/api/comments/property/{id}` | Commentaires d'un bien |
| `POST` | `/api/comments/property/{id}/like` | Liker/unliker un bien |
| `GET` | `/api/comments/property/{id}/likes/total` | Nombre de likes |
| `POST` | `/api/files/upload` | Upload fichier (multipart) |
| `GET` | `/api/files/tiers/{tierId}` | Documents d'un tiers |
| `DELETE` | `/api/files/tiers/{tierId}/{docId}` | Supprimer un document |
