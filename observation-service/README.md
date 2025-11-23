# observation-service

Endpoints:
- POST /species (Auth required) { name }
- GET /species
- GET /species/:id
- POST /observations (Auth required) { speciesId, description, dangerLevel }
- GET /observations/species/:id
- POST /observations/:id/validate (Auth required, EXPERT/ADMIN)
- POST /observations/:id/reject (Auth required, EXPERT/ADMIN)

.env example:
PORT=5000
MONGO_URI=mongodb://mongo:27017/deepsea_obs
JWT_SECRET=replace_with_a_secure_secret

Run (dev):
npm install
npm run dev
