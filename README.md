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
docker compose up -d        # PostgreSQL 16 on localhost:5433, Keycloak on localhost:8180
```

Keycloak imports the `la3bakbira` realm from `infra/docker/keycloak/realm-la3bakbira.json`
on first start (roles, clients, test users). Admin console: http://localhost:8180/admin
(master admin `admin` / `admin`, development only).

> If your PostgreSQL volume was created before Keycloak was added, create its database once:
> `docker exec la3bakbira-postgres psql -U la3bakbira -d postgres -c "CREATE DATABASE keycloak_db;"`

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
| Keycloak         | 8180         | http://localhost:8180/realms/la3bakbira |

If a port is taken on your machine, append `--server.port=XXXX` (or set `SERVER_PORT`).
The Eureka address can be changed with `EUREKA_URL`, and the database with
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. Keycloak URLs: `KEYCLOAK_ISSUER_URI`, `KEYCLOAK_JWK_SET_URI`.

## Security

Authentication is handled by Keycloak (OpenID Connect). The gateway and each service validate the
JWT access token (signature, issuer `http://localhost:8180/realms/la3bakbira`, audience `la3bakbira-api`)
and read the realm roles from `realm_access.roles`.

| Who              | Can do                                        |
|------------------|-----------------------------------------------|
| Anyone           | Browse the catalog (`GET /api/catalog/**`), API docs, health |
| `CUSTOMER`       | (cart and orders – coming with order-service) |
| `ADMIN`          | Create, update, delete catalog data; gateway management endpoints |

New users who sign up get the `CUSTOMER` role automatically.

**Test users (development only):**

| User                     | Password       | Roles            |
|--------------------------|----------------|------------------|
| `admin@la3bakbira.tn`    | `Admin@123`    | ADMIN, CUSTOMER  |
| `customer@la3bakbira.tn` | `Customer@123` | CUSTOMER         |

**Keycloak clients:** `la3bakbira-frontend` (Angular, PKCE), `la3bakbira-swagger` (Swagger UI, PKCE),
`la3bakbira-cli` (password grant for scripts/tests – development only).

Get a token from the command line:

```bash
curl -s -X POST http://localhost:8180/realms/la3bakbira/protocol/openid-connect/token \
  -d grant_type=password -d client_id=la3bakbira-cli \
  -d username=admin@la3bakbira.tn -d password=Admin@123
# then: curl -H "Authorization: Bearer <access_token>" ...
```

## API documentation (Swagger UI)

With the services running, open **http://localhost:8080/swagger-ui.html** (served by the gateway).
Pick a service in the top-right "Select a definition" list, then use **Try it out** to send real
requests through the gateway. To call protected endpoints, click **Authorize**, then **Authorize**
again in the dialog (client `la3bakbira-swagger` is pre-filled) and log in with a test user. Each service publishes its OpenAPI 3 description at `/v3/api-docs`;
the gateway exposes them as `/docs/<service-name>/v3/api-docs`.

## Catalog API (through the gateway)

All `GET` endpoints are public; `POST`, `PUT` and `DELETE` require a token with the `ADMIN` role.

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
- [x] Step 4 – Swagger / OpenAPI documentation (aggregated on the gateway)
- [x] Step 5 – Security with Keycloak (JWT, ADMIN / CUSTOMER roles)
- [ ] Step 6 – Angular frontend foundation
