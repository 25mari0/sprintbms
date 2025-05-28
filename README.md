# SprintBMS

A full-stack web application to streamline operations for car detailing businesses. SprintBMS is subscription-based and integrates Stripe for payments. It combines a robust Express.js + TypeScript backend with a dynamic React frontend to manage bookings, services, customers, workers, and user authentication, along with detailed and useful business management analytics.

---

## Current Platform Showcase

https://streamable.com/8bq0i6

![Image caption](https://github.com/25mari0/sprintbms/blob/master/showcase%202.png)

---

## Project Goals

- Full-stack web application to streamline operations for car detailing businesses, subscription-based with Stripe payments.
- Combine a robust Express.js/TypeScript backend with a dynamic React frontend to manage bookings, services, customers, workers, and user authentication seamlessly, along with detailed and useful business management analytics.

---

## "Education" Goals

- Learn and develop following true business/collaborative projects.
- Use proper coding and development procedures: structural organization, pipelines, modularity to avoid repetition, security, testing, separation between dev and prod environments, etc.
- Follow through with learning React and modern frontend development.
- Implement a payment system for subscriptions (Stripe).

---

## Tech Stack

### Backend
- Node.js & Express
- TypeScript
- TypeORM & PostgreSQL
- pgAdmin

### Frontend
- React, Hook Form & React Router
- Vite dev server
- TypeScript

### Key Aspects
- DRY principles
- Fully Dockerized backend (frontend not Dockerized by choice)
- Async-wrapped error handling
- Refresh & access cookies with IP location fingerprinting
- Optimized DB operation frequency to improve performance
- Husky (git hooks) with Prettier & ESLint
- .env used (to be replaced by a Vault later)
- Tools: pgAdmin, TablePlus, Postman

---

## Progress

- Stripe payments are integrated on the backend and frontend
- Backend is around 70% done, just needs a few more optimizations and a couple more routes
- Frontend is starting to take shape—most pages have a proper flow; now adding functionality and uniform styling
