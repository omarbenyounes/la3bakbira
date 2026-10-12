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
| Frontend           | Angular 21 (standalone components), TypeScript, Bootstrap 5 + Angular Material |
| Backend runtime    | Java 21 (LTS)                                  |
| Backend framework  | Spring Boot 3.x, Spring Cloud (Gateway, Eureka client/server) |
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

## 4. Frontend

A single Angular application with two areas:

- **Storefront** (public): home, category browsing, product details, search, cart, checkout, account.
- **Admin dashboard** (`/admin`, lazy-loaded, `ADMIN` role required): manage categories,
  products, offers, banners, orders, store settings.

## 5. Repository layout

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
