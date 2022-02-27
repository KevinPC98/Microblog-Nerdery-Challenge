# Microblog-Nerdery-Challenge
Microblog built for learning
## Steps to run
1. Clone this repository
2. Define the configuration variables in an .env file as shown in .env.example and use `JWT_SECRET_KEY= Hola`
3. Install the dependencies with `npm install`
4. Do migrations with `npm run prisma:migrate:run`
5. Run the command if the models wasn't generated: `npm run prisma:generate`
6. Import the workspace in your Postman application
7. Run the aplication with `npm run dev`
8. Star with the endpoint signup to create an account or you can login with this user:
```
{
    "email": "kevinparedes@ravn.co",
    "password" : "nerdery2022"
}
```
## Steps to test
1. Create a .env.test file and define the configuration variables as shown in .env.example
2. Do the migrations with: `npm run prisma:migrate:run:test`
3. Run each test with: `npm run test`
4. Run the test coverange with `npm run test:coverage`
