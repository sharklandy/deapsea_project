# DeepSea Archives - Full Project (auth-service + observation-service)

This archive contains a complete scaffold for the **DeepSea Archives** backend project:
- `auth-service` (Express + Mongoose): register / login / roles / JWT
- `observation-service` (Express + Mongoose): species & observations, validates JWT from auth-service via shared secret

## Quickstart (with Docker)
1. Copy and set secrets in `.env` files located in each service folder (examples provided).
2. Build & run:
```bash
docker-compose up --build
```
3. Services:
- Auth: http://localhost:4000
- Observation: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Or run locally (without Docker)
Open two terminals and in each service folder:
```bash
cd auth-service
npm install
npm run dev
```
and
```bash
cd observation-service
npm install
npm run dev
```

## Notes
- Both services expect `JWT_SECRET` to be identical if you want observation-service to validate JWTs locally.
- The project includes:
  - Models, controllers, routes, middleware
  - Dockerfiles for each service
  - Example `.env` files
  - Postman examples in README of each service
- This scaffold is ready to be improved: tests, CI, token introspection, swagger, production hardening.

Good luck — have fun building DeepSea Archives!
