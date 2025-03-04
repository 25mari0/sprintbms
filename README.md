project goals:

- full-stack application to streamline operations for car detailing businesses. 
- combine a robust Node.js backend with a dynamic React frontend to manage bookings, services, customers, and user authentication seamlessly, along with detailed and useful business management analytics

"education" goals:

- learn and develop following true business/collaborative projects
- use proper coding & development procedures - structural organization, pipelines, modularity to avoid repetition, security, testing, separation between dev and prod enviroments, etc
- follow through with learning React & modern FE development
- implement a payment system for subscriptions (STRIPE)


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
        -refresh & access tokens
        -optimized db operation's frequency when possible to improve performance
        -husky (githook) with prettier & eslint
        -used .env which will be replaced by a Vault later
        -pgadmin, tableplus & postman 

setup notes:
	
 	-ethereal.email is used while in development, go their website, click the create button & replace the backend .env variables for it
    
