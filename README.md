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

## Backend

Build and test all services (from `backend/`):

```bash
./mvnw clean verify          # Linux/macOS/Git Bash
mvnw.cmd clean verify        # Windows cmd/PowerShell
```

Run locally, **discovery-server first**:

```bash
java -jar discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar
java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar
```

| URL                                         | What                         |
|---------------------------------------------|------------------------------|
| http://localhost:8761                       | Eureka dashboard             |
| http://localhost:8080/actuator/health       | Gateway health               |
| http://localhost:8080/actuator/gateway/routes | Gateway routes (read-only) |

Ports can be overridden with the `SERVER_PORT` environment variable (or `--server.port=...`),
and the Eureka address with `EUREKA_URL`.

## Project status

- [x] Step 1 – Environment check, architecture, repository initialization
- [x] Step 2 – Backend skeleton: Maven multi-module, Eureka discovery-server, API gateway
- [ ] Step 3 – catalog-service (categories & products) with PostgreSQL
