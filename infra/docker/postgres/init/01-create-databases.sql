-- Runs only on the first start of an empty data volume.
-- One database per microservice; more are added as services are created.
-- (For an existing volume, create new databases manually with psql.)
CREATE DATABASE catalog_db;
CREATE DATABASE keycloak_db;
