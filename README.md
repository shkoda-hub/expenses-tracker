# expenses-tracker

The main idea of this service is tracking your expenses and get simple analytics.
I added LLM to categorize expense by description. Xenova/nli-deberta-v3-small was used to do it.

## Api overview

/api/docs - swagger docs

Users
```
POST /api/users - create new user
```

Auth
```
POST /api/auth/login - login with email and password
POST /api/auth/refresh - refresh access token
```

Expenses
```
POST /api/expenses - create new expense
GET /api/expenses - get all user`s expenses
GET /api/expenses/:id - get expense by id
PUT /api/expenses/:id - update expense
DELETE /api/expenses/:id - delete expense
```

Analytics
```
GET /api/analytics/by-categories - aggregate your expenses by categories
```

For more details and examples use Swagger API docs

## How to run

Firstly provide .env file. To do it you can use .env.example. 
To generate new jwt secrets you can exec:
```bash
openssl rand -base64 64
```

To run dev mode
```bash
make up-dev
```

To run prod mode
```bash
make up-prod
```

Run tests
```bash
make run-test
```

Run e2e test
```bash
make run-e2e-test
```
