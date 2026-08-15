# Clinicfy

React frontend for Clinicify. It talks to [clinicify-api](../clinicify-api) on port **5000** (REST and Socket.IO). Video calls also need OpenVidu on port **4443**, which Compose starts with the API.

## Run

1. Start the API and MySQL from `clinicify-api`: `docker compose up --build`
2. Copy env: `cp .env.example .env` and set `STRIPE_KEY` plus `VITE_API_URL=http://localhost:5000`
3. `npm install`
4. `npm run dev` (Vite on http://localhost:5173)
