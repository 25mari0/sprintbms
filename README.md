current platform showcase: 

https://streamable.com/8bq0i6

project goals:

- full-stack web application to streamline operations for car detailing businesses, subscription based /w Stripe payments. 
- combine a robust expressjs/typescript backend with a dynamic React frontend to manage bookings, services, customers, workers and user authentication seamlessly, along with detailed and useful business management analytics

"education" goals:

- learn and develop following true business/collaborative projects
- use proper coding & development procedures - structural organization, pipelines, modularity to avoid repetition, security, testing, separation between dev and prod enviroments, etc
- follow through with learning React & modern FE development
- implement a payment system for subscriptions (Stripe)


tech stack:

    backend:
        -node.js & express
        -typescript
        -typeORM & postgresql
        -pgadmin

    frontend:
        -react, hook form & router 
        -vite dev server
        -typescript
    
    -key aspects
        -DRY principles
        -fully dockerized backend (decided to not do the same for the FE because I did not see the need)
        -async wrapped error handling
        -refresh & access cookies w/ ip location fingerprinting
        -optimized db operation's frequency when possible to improve performance
        -husky (githook) with prettier & eslint
        -used .env which will be replaced by a Vault later
        -pgadmin, tableplus & postman 

progress:

- stripe payments are integrated on the backend and frontend
- backend is around 70% done, just needs a few more optimizations and a couple more routes.
- frontend is starting to take shape, most pages have a proper flow, now adding functionality and uniform styling
