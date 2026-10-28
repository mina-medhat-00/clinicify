# Clinicfy

## Description

Frontend for Clinicify:

- It talks to [clinicify-api] on port 5000 (REST and Socket.IO).
- Video calls also need OpenVidu on port 4443, which Compose starts with the API.

## Run

- Start the API and MySQL from `clinicify-api`: `docker compose up --build`
- Copy env: `cp .env.example .env` and set `STRIPE_KEY` plus `VITE_API_URL`
  - `STRIPE_KEY` is the publishable key (`pk_...`) from the same Stripe account as the API's `STRIPE_SECRET`; keys from different accounts make the card form fail to load.
- Install the dependencies: `npm install`
- Run in development: `npm run dev` (Vite on localhost:5173)
