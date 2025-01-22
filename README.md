# Bun.js Backend Template

A modern backend template built with **Bun.js**, **TypeScript**, and **PostgreSQL**. This project follows an **Object-Oriented Programming (OOP)** approach and includes features like **TypeORM** for database management, **Swagger** for API documentation, and a clean folder structure for scalability.

---

## Features

- **Bun.js**: Fast and modern runtime for JavaScript and TypeScript.
- **TypeScript**: Strongly typed codebase for better maintainability.
- **PostgreSQL**: Relational database with **TypeORM** for ORM support.
- **Swagger**: Automatically generated API documentation.
- **OOP Design**: Clean separation of concerns with Models, Services, Controllers, and Routes.
- **Scalable Structure**: Organized folder structure for easy scaling.

---

## Prerequisites

Before running the project, ensure you have the following installed:

- [Bun.js](https://bun.sh/) (v1.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- Node.js (optional, for compatibility with some tools)

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bunjs-backend-template.git
   cd bunjs-backend-template
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up the database:
   - Create a PostgreSQL database.
   - Update the `ormconfig.json` file with your database credentials:

     ```json
     {
       "type": "postgres",
       "host": "localhost",
       "port": 5432,
       "username": "yourusername",
       "password": "yourpassword",
       "database": "yourdbname",
       "synchronize": true,
       "logging": false,
       "entities": ["src/models/**/*.ts"],
       "migrations": ["src/migration/**/*.ts"],
       "subscribers": ["src/subscriber/**/*.ts"],
       "cli": {
         "entitiesDir": "src/models",
         "migrationsDir": "src/migration",
         "subscribersDir": "src/subscriber"
       }
     }
     ```

4. Run the project:

   ```bash
   bun run src/server.ts
   ```

   The server will start at `http://localhost:3000`.

---

## Project Structure

```
/src
  /config          # Configuration files (e.g., Swagger, TypeORM)
  /controllers     # Controllers to handle requests
  /helpers         # Utility and helper functions
  /models          # Database models (TypeORM entities)
  /routes          # API route definitions
  /services        # Business logic and service layers
  /types           # Custom TypeScript types
  app.ts           # Main application setup
  server.ts        # Server entry point
```

---

## API Documentation

The API documentation is automatically generated using **Swagger**. You can access it at:

```
http://localhost:3000/api-docs
```

### Example API Endpoints

- **GET /users**: Fetch all users.
- **POST /users**: Create a new user.

---

## Example Requests

### Fetch All Users

```bash
curl -X GET http://localhost:3000/users
```

### Create a New User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john.doe@example.com"}'
```

---

## Environment Variables

To manage environment-specific configurations, create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=yourusername
DB_PASSWORD=yourpassword
DB_NAME=yourdbname
PORT=3000
```

Update the `ormconfig.json` to use environment variables:

```json
{
  "type": "postgres",
  "host": "process.env.DB_HOST",
  "port": "process.env.DB_PORT",
  "username": "process.env.DB_USERNAME",
  "password": "process.env.DB_PASSWORD",
  "database": "process.env.DB_NAME",
  "synchronize": true,
  "logging": false,
  "entities": ["src/models/**/*.ts"],
  "migrations": ["src/migration/**/*.ts"],
  "subscribers": ["src/subscriber/**/*.ts"],
  "cli": {
    "entitiesDir": "src/models",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
  }
}
```

---

## Running Migrations

To create and run database migrations, use TypeORM's CLI:

1. Install TypeORM globally (if not already installed):

   ```bash
   bun add -g typeorm
   ```

2. Generate a migration:

   ```bash
   typeorm migration:generate -n CreateUsersTable
   ```

3. Run migrations:

   ```bash
   typeorm migration:run
   ```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to the branch.
4. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Bun.js](https://bun.sh/) for the fast and modern runtime.
- [TypeORM](https://typeorm.io/) for the ORM support.
- [Swagger](https://swagger.io/) for API documentation.

---

Enjoy building your backend with Bun.js! 🚀