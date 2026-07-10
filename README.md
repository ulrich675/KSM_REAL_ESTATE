# KSM Real Estate

Plateforme immobilière full-stack composée d'un frontend **Next.js** et d'un backend **Spring Boot (réactif, architecture hexagonale)**, intégré au **kernel-core** (Yowyob) pour l'authentification et les paiements.

## Structure du dépôt

```
KSM_REAL_ESTATE/
├── KSM_REAL_ESTATE_V/         # Frontend Next.js (App Router)
└── KSM_REAL_ESTATE_backend/   # Backend Spring Boot (hexagonal)
```

---

## 1. Frontend — `KSM_REAL_ESTATE_V`

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Leaflet / React-Leaflet (carte) · Lucide React (icônes)

### Pages principales

| Route | Description |
|---|---|
| `/` | Accueil — liste/recherche de biens |
| `/properties/[id]` | Détail d'un bien |
| `/compare` | Comparateur de biens |
| `/dashboard` | Tableau de bord utilisateur |
| `/connexion` | Authentification |

### Composants clés

- `PropertyMap.tsx` — carte interactive (Leaflet) des biens
- `AuthGate.tsx` / `ProtectedRoute.tsx` — protection des routes authentifiées
- `HeartButton.tsx` — favoris
- `DateValidator.tsx`, `Header.tsx`, `Footer.tsx`

### Installation et lancement

```bash
cd KSM_REAL_ESTATE_V
npm install
npm run dev       # démarre sur http://localhost:3000
```

Autres scripts :
```bash
npm run build      # build de production
npm run start      # lancement en production
npm run lint       # analyse ESLint
```

> ⚠️ **Remarque** : ce projet utilise une version de Next.js (16.2.10) potentiellement plus récente que les conventions habituelles — se référer à `AGENTS.md` et à la documentation locale (`node_modules/next/dist/docs/`) avant toute modification structurelle.

---

## 2. Backend — `KSM_REAL_ESTATE_backend`

**Stack** : Java 21 · Spring Boot 3.2 (WebFlux, réactif) · R2DBC PostgreSQL (+ Hibernate Spatial/PostGIS) · Redis réactif · Elasticsearch réactif · Kafka · Liquibase · JWT (JJWT) · MapStruct · Lombok · OpenAPI/Swagger · OpenHTMLtoPDF (génération de reçus)

### Architecture hexagonale

```
domain/            # Modèles métier, exceptions, spécifications
application/
  ├── port/in/      # Cas d'usage (use cases)
  ├── port/out/     # Ports sortants (persistance, cache, recherche, kernel-core, etc.)
  ├── service/      # Implémentation des use cases
  └── dto/          # Requêtes / réponses
infrastructure/
  ├── adapter/in/   # Contrôleurs REST
  ├── adapter/out/  # Adaptateurs (JPA/R2DBC, Redis, Elasticsearch, Kafka, kernel-core, PDF)
  ├── entity/       # Entités persistées
  ├── mapper/       # Mappers MapStruct
  ├── security/     # JWT, filtres, UserDetailsService
  └── config/       # Configuration Spring (sécurité, CORS, WebClient, Jackson…)
```

### Domaines fonctionnels (contrôleurs REST)

| Ressource | Base path | Endpoints |
|---|---|---|
| Authentification | `/api/auth` | `POST /register`, `POST /login`, `POST /login/mfa/confirm` |
| Utilisateurs | `/api/users` | `GET /{id}`, `POST /{id}/request-proprietor`, `POST /{id}/handle-proprietor-request` |
| Biens immobiliers | `/api/properties` | `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `GET /` (recherche) |
| Demandes de visite | `/api/visits` | `POST /` |
| Paiements | `/api/payments` | `POST /` |
| Commentaires | `/api/comments` | `POST /`, `GET /property/{propertyId}`, `GET /user/{userId}`, `DELETE /{commentId}` |

Documentation interactive une fois l'application démarrée :
- Swagger UI : `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON : `http://localhost:8080/v3/api-docs`

### Intégration kernel-core

Le backend délègue l'**authentification** (`auth-core`) et le **paiement** (`billing-core`) à un kernel-core externe multi-tenant. Chaque appel sortant transporte les en-têtes `X-Client-Id`, `X-Api-Key`, `X-Tenant-Id`, `X-Organization-Id` et propage le token utilisateur (`Authorization: Bearer`). Ces credentials restent strictement côté backend.

Détails complets, décisions d'architecture et points bloquants : voir [`kernel-core-integration.md`](./KSM_REAL_ESTATE_backend/kernel-core-integration.md).

**Points d'attention actuels :**
- Le module `file-core` est **bloqué** (aucun endpoint documenté) — `KernelCoreFileAdapter` lève une `UnsupportedOperationException`.
- Le schéma exact attendu par `POST /api/paiement` (billing-core) est une hypothèse à valider contre une instance réelle.
- Les commentaires sont gérés **localement** (pas de `comment-core` côté kernel).

### Variables d'environnement

| Variable | Défaut (dev) | Description |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `postgres` | Accès PostgreSQL |
| `JWT_SECRET` | clé de dev fournie | Secret de signature JWT |
| `JWT_EXPIRATION_MS` | `86400000` | Durée de validité du JWT |
| `KERNEL_CORE_BASE_URL` | `http://localhost:8080` | URL du kernel-core |
| `KERNEL_CORE_CLIENT_ID` | `dev-platform-backend` | Identifiant client kernel-core |
| `KERNEL_CORE_API_KEY` | `dev-api-key` | Clé API kernel-core |
| `KERNEL_CORE_TENANT_ID` | UUID de dev | Tenant kernel-core |
| `KERNEL_CORE_ORGANIZATION_ID` | UUID de dev | Organisation kernel-core |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Origines autorisées (CORS) |

En production, ces valeurs doivent être fournies explicitement (voir le profil `prod` dans `application.yml`).

### Infrastructures nécessaires (dev)

- **PostgreSQL** (avec extension PostGIS) — `localhost:5432`
- **Redis** — `localhost:6379`
- **Elasticsearch** — `localhost:9200`
- **Kafka** — `localhost:9092`

### Migrations de base de données

Gérées par **Liquibase** (`src/main/resources/db/changelog/`) :
- `01-create-schema.yaml` — schéma initial
- `02-add-comments-table.yaml` — ajout de la table des commentaires

### Installation et lancement

```bash
cd KSM_REAL_ESTATE_backend
# Démarrer les dépendances (Postgres, Redis, Elasticsearch, Kafka) via Docker ou installation locale
mvn spring-boot:run                 # profil par défaut
mvn spring-boot:run -Dspring-boot.run.profiles=dev
mvn test                            # exécuter les tests
mvn clean package                   # build du jar
```

L'application démarre par défaut sur `http://localhost:8080`.

---

## 3. Flux d'intégration frontend ↔ backend

Le frontend (`http://localhost:3000`) consomme l'API REST du backend (`http://localhost:8080/api/...`) via `src/services/api.ts`. Le CORS est configuré côté backend pour autoriser cette origine (`CORS_ALLOWED_ORIGINS`).

## 4. Prérequis généraux

- Node.js (compatible Next.js 16 / React 19)
- Java 21
- Maven
- PostgreSQL + PostGIS, Redis, Elasticsearch, Kafka (backend)

## 5. Licence

Projet interne — à compléter selon les besoins.


##  Intégration de la Plateforme Kernel-Core (Yowyob)
Le backend de **KSM Real Estate** délègue 4 services critiques à la plateforme externe **kernel-core** via une architecture hexagonale (Ports & Adapteurs). Cette approche garantit la découplabilité totale du code métier local face aux API REST externes de la plateforme.
### Architecture Globale & Flot de Données
Les communications se font en mode **Serveur à Serveur (S2S)** hautement réactif (via WebFlux/WebClient) selon la structure suivante :
```mermaid
graph TD
    subgraph KSM Backend (Hexagone)
        Service[Services Applicatifs] -->|Appel Port| Port[Ports Sortants / Ports Interfaces]
        Adapter[Adaptateurs Kernel-Core] -->|Implémente| Port
    end
    subgraph Yowyob Platform (kernel-core)
        Adapter -->|S2S WebClient| AuthAPI[auth-core : /api/auth/*]
        Adapter -->|S2S WebClient| BillAPI[billing-core : /api/accounting/*]
        Adapter -->|S2S WebClient| FileAPI[file-core : /api/v1/tiers/*]
        Adapter -->|S2S WebClient| RateAPI[ratings-core : /api/v1/ratings/*]
    end
