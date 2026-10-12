# la3bakbira – E-commerce Marketplace

Online marketplace (storefront + admin dashboard) built with Angular, Spring Boot
microservices, Keycloak and PostgreSQL, with a full DevOps toolchain.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the architecture and technology choices.

## Prerequisites

| Tool            | Version          |
|-----------------|------------------|
| JDK             | 21               |
| Node.js / npm   | 20+ / 10+        |
| Angular CLI     | 17+              |
| Docker Desktop  | with Compose v2  |
| Git             | 2.x              |

Maven does not need to be installed: the backend uses the Maven Wrapper (`mvnw`).

## 1. Start the infrastructure

```bash
cd infra/docker
cp .env.example .env        # first time only (Windows: copy .env.example .env)
docker compose up -d        # PostgreSQL 16 on localhost:5433
```

## 2. Build the backend

From `backend/` (tests need Docker running – they start a temporary PostgreSQL):

```bash
./mvnw clean verify          # Linux/macOS/Git Bash
mvnw.cmd clean verify        # Windows cmd/PowerShell
```

## 3. Run the services

Start them in this order, each in its own terminal (from `backend/`):

```bash
java -jar discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar
java -jar catalog-service/target/catalog-service-0.0.1-SNAPSHOT.jar
java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar
```

| Service          | Default port | Check                                   |
|------------------|--------------|-----------------------------------------|
| discovery-server | 8761         | http://localhost:8761 (Eureka dashboard) |
| api-gateway      | 8080         | http://localhost:8080/actuator/health   |
| catalog-service  | 8081         | http://localhost:8081/actuator/health   |
| PostgreSQL       | 5433         | `docker compose ps`                     |

If a port is taken on your machine, append `--server.port=XXXX` (or set `SERVER_PORT`).
The Eureka address can be changed with `EUREKA_URL`, and the database with
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

## Catalog API (through the gateway)

| Method | Path                                   | Purpose |
|--------|----------------------------------------|---------|
| GET    | `/api/catalog/categories`              | Flat list |
| GET    | `/api/catalog/categories/tree`         | Nested tree for menus (`?activeOnly=true`) |
| GET    | `/api/catalog/categories/{id}` · `/slug/{slug}` | One category |
| POST / PUT / DELETE | `/api/catalog/categories[/{id}]` | Manage categories |
| GET    | `/api/catalog/brands[/{id}]`           | Brands |
| POST / PUT / DELETE | `/api/catalog/brands[/{id}]` | Manage brands |
| GET    | `/api/catalog/products`                | Search, paginated: `q`, `categoryId` (includes sub-categories), `brandId`, `minPrice`, `maxPrice`, `inStock`, `featured`, `active`, `page`, `size`, `sort=price,asc` |
| GET    | `/api/catalog/products/{id}` · `/slug/{slug}` | Product details |
| POST / PUT / DELETE | `/api/catalog/products[/{id}]` | Manage products |

Errors are returned as RFC 9457 problem details (`400` validation with an `errors` map,
`404` not found, `409` conflict such as duplicate SKU/slug or deleting a category that still has products).
Prices are in TND with 3 decimals.

## Project status

- [x] Step 1 – Environment check, architecture, repository initialization
- [x] Step 2 – Backend skeleton: Maven multi-module, Eureka discovery-server, API gateway
- [x] Step 3 – catalog-service (categories, brands, products) with PostgreSQL
- [ ] Step 4 – Swagger / OpenAPI documentation
