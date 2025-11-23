# auth-service

Endpoints:
- POST /auth/register { email, username, password } -> { token }
- POST /auth/login { email, password } -> { token }
- GET /auth/me (Auth required)
- GET /admin/users (Admin only)
- PATCH /users/:id/role (Admin only)

.env example:
PORT=4000
MONGO_URI=mongodb://mongo:27017/deepsea_auth
JWT_SECRET=replace_with_a_secure_secret

Run (dev):
npm install
npm run dev
