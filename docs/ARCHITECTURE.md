# Architecture

## 1. Overview

A multi-category e-commerce marketplace (inspired by tunisianet.com.tn and mytek.tn)
with a public storefront and an administration dashboard that controls the whole store.

```
                 ┌──────────────────────────────┐
                 │   Angular app (frontend/)    │
                 │  storefront  +  /admin area  │
                 └──────────────┬───────────────┘
                                │ HTTPS + JWT (from Keycloak)
                 ┌──────────────▼───────────────┐        ┌─────────────┐
                 │  api-gateway (Spring Cloud   │◄──────►│  Keycloak   │
                 │  Gateway) – routing, JWT     │        │  (IAM/JWT)  │
                 └──────────────┬───────────────┘        └─────────────┘
                                │ lb://service-name
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
  │catalog-service│     │ order-service │     │content-service│
  └───────┬───────┘     └───────┬───────┘     └───────┬───────┘
          │                     │                     │
          └──────────┬──────────┴──────────┬──────────┘
                     ▼                     ▼
             ┌──────────────┐      ┌───────────────┐
             │ PostgreSQL   │      │ discovery-    │
             │ (1 DB/service)│     │ server(Eureka)│
             └──────────────┘      └───────────────┘
```

## 2. Technology choices

| Concern            | Choice                                         |
|--------------------|------------------------------------------------|
| Frontend           | Angular 22 (standalone components, signals), TypeScript, Bootstrap 5 + Angular Material, keycloak-angular |
| Backend runtime    | Java 21 (LTS)                                  |
| Backend framework  | Spring Boot 4.1.1, Spring Cloud 2025.1.3 (Gateway 5 – WebFlux, Eureka 5) |
| Persistence        | PostgreSQL 16, Spring Data JPA, Hibernate       |
| Security           | Keycloak (OIDC/JWT), Spring Security 6 OAuth2 Resource Server |
| API docs           | springdoc-openapi (Swagger UI / OpenAPI 3)      |
| Build              | Maven (via Maven Wrapper `mvnw`, multi-module)  |
| Containers         | Docker, Docker Compose (local), Kubernetes (deploy) |
| CI/CD              | GitHub Actions → Docker Hub                     |
| Quality / Security | SonarQube, Trivy, OWASP Dependency-Check, GitLeaks |
| Secrets            | GitHub Actions secrets (CI) + HashiCorp Vault (runtime) |
| Observability      | Prometheus + Grafana (metrics), ELK (logs)      |

**Why PostgreSQL over MySQL:** Keycloak also needs a database; one engine for both
keeps the infrastructure simpler. PostgreSQL also has strong JSON support, which is
handy for variable product specifications (RAM, screen size, etc.).

**Why Spring Boot 4.1:** the requirement is "3.2 or later"; Spring Initializr no longer offers
3.x, and 4.1.1 is the current stable release with a compatible Spring Cloud train (2025.1.x).

**Why Maven over Gradle:** the most common choice for Spring Boot projects. The wrapper
means no global installation is required.

## 3. Services

| Service            | Port | Responsibility |
|--------------------|------|----------------|
| `discovery-server` | 8761 | Eureka service registry |
| `api-gateway`      | 8080 | Single entry point, routing, JWT validation, CORS |
| `catalog-service`  | 8081 | Categories (tree), brands, products, specs, images, stock, search/filter |
| `order-service`    | 8082 | Cart, checkout, orders, order status workflow |
| `content-service`  | 8083 | Special offers/promotions, homepage banners, store settings |
| Keycloak           | 8180 | Users, login/registration, roles (`ADMIN`, `CUSTOMER`) |
| PostgreSQL         | 5432 | Databases: `catalog_db`, `order_db`, `content_db`, `keycloak_db` |
| Angular dev server | 4200 | Frontend |

Each business service owns its own database (no cross-service table access).

## 4. Security

- **Keycloak 26** realm `la3bakbira` (imported from `infra/docker/keycloak/realm-la3bakbira.json`).
  Realm roles `ADMIN` and `CUSTOMER`; `CUSTOMER` is part of the default role, so self-registered
  users get it automatically.
- Browser clients (Angular, Swagger UI) use the **authorization code flow with PKCE** as public clients.
- Every access token carries the audience `la3bakbira-api` (audience mapper on each client).
- The **gateway and every service** are OAuth2 resource servers: they verify the JWT signature
  (Keycloak JWKS), issuer and audience, and map `realm_access.roles` to Spring roles (`ROLE_ADMIN`...).
  Rules are enforced at the gateway *and* repeated in each service (defence in depth).
- Catalog: `GET` is public, writes need `ADMIN`.

## 5. Frontend

A single Angular 22 application (standalone components, signals, French UI) with two areas:

- **Storefront** (public): home, category browsing, product details, search, cart, checkout, account.
- **Admin dashboard** (`/admin`, lazy-loaded, `ADMIN` role required): manage categories,
  products, offers, banners, orders, store settings.

Styling: Bootstrap 5 (grid, utilities) + Angular Material (menus, icons, form controls, tables).

Authentication: `keycloak-angular` / `keycloak-js` with the `la3bakbira-frontend` public client
(authorization code + PKCE). `check-sso` restores an existing session silently, so visitors can browse
anonymously. The access token is attached only to requests to `/api/**`, and refreshed automatically
while the user is active (logout after 30 minutes of inactivity). `adminGuard` sends visitors to the
Keycloak login page and users without `ADMIN` to `/acces-refuse`.

API access: the app calls relative `/api/**` URLs. In development the Angular dev server proxies them
to the gateway; in production a web server (nginx) in front of the app will do the same. The browser
therefore stays on a single origin and the gateway needs no CORS configuration.

## 6. Repository layout

```
la3bakbira/
├── backend/              Maven multi-module project (all Spring services)
├── frontend/             Angular application
├── infra/
│   ├── docker/           docker-compose files
│   ├── k8s/              Kubernetes manifests
│   ├── monitoring/       Prometheus / Grafana config
│   ├── logging/          ELK config
│   └── iac/              Ansible / Terraform (if needed)
├── .github/workflows/    GitHub Actions pipelines
└── docs/                 Architecture and project documentation
```

Folders are created at the step that first needs them.
