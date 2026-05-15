# 🍳 The Global Kitchen — Recipe REST API

A professional-grade **RESTful API** for managing a digital cookbook, built with **Node.js**, **Express**, and **MongoDB**. This project demonstrates a clean **3-Tier Architecture**, best-practice schema design, and production-quality error handling.

---

## 🏗️ Project Architecture

```
the-global-kitchen/
│
├── src/
│   ├── config/
│   │   └── database.js          ← Singleton DB connection (DRY)
│   │
│   ├── models/
│   │   └── Recipe.js            ← BSON schema, validation, indexes
│   │
│   ├── services/
│   │   └── recipeService.js     ← Business logic layer
│   │
│   ├── controllers/
│   │   └── recipeController.js  ← Request/Response cycle handler
│   │
│   ├── routes/
│   │   └── recipeRoutes.js      ← API endpoint definitions
│   │
│   ├── middlewares/
│   │   ├── validateObjectId.js  ← MongoDB ID format guard
│   │   └── errorHandler.js      ← Global error handler
│   │
│   ├── app.js                   ← Express app configuration
│   └── server.js                ← Entry point & bootstrap
│
├── .env                         ← Environment variables (never commit!)
├── .gitignore
├── .eslintrc.js                 ← Linting rules
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone and install dependencies
```bash
git clone <your-repo-url>
cd the-global-kitchen
npm install
```

### 2. Configure environment variables
Edit the `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/global_kitchen
NODE_ENV=development
```

> **MongoDB Atlas?** Replace `MONGODB_URI` with your Atlas connection string:
> ```
> MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/global_kitchen
> ```

### 3. Start the server
```bash
# Development (hot-reload with nodemon)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

| Method   | Endpoint              | Description                          |
|----------|-----------------------|--------------------------------------|
| `GET`    | `/api/health`         | Health check                         |
| `GET`    | `/api/recipes`        | Get all recipes (supports filters)   |
| `GET`    | `/api/recipes/:id`    | Get a single recipe by ID            |
| `POST`   | `/api/recipes`        | Create a new recipe                  |
| `PATCH`  | `/api/recipes/:id`    | Partially update a recipe            |
| `DELETE` | `/api/recipes/:id`    | Delete a recipe                      |

### Query Filters (GET /api/recipes)
```
GET /api/recipes?category=Dessert
GET /api/recipes?difficulty=Easy
GET /api/recipes?category=Vegan&difficulty=Medium
```

---

## 📋 Recipe Document Structure

```json
{
  "title": "Jollof Rice",
  "ingredients": [
    { "name": "Long-grain rice", "quantity": "2 cups" },
    { "name": "Tomatoes", "quantity": "4 large" },
    { "name": "Onion", "quantity": "1 medium" }
  ],
  "instructions": "Blend tomatoes and peppers. Fry the blend in oil until the oil floats...",
  "cookingTime": 45,
  "difficulty": "Medium",
  "category": "Dinner"
}
```

### Field Validation Rules

| Field         | Type     | Rules                                              |
|---------------|----------|----------------------------------------------------|
| `title`       | String   | Required, 3–100 chars, trimmed                     |
| `ingredients` | Array    | Required, at least 1 item; each has name + quantity|
| `instructions`| String   | Required, min 20 chars, trimmed                    |
| `cookingTime` | Number   | Required, positive integer (minutes), min: 1      |
| `difficulty`  | String   | Required, enum: Easy, Medium, Hard, Expert         |
| `category`    | String   | Required, enum: Breakfast, Lunch, Dinner, etc.     |
| `createdAt`   | Date     | Auto-generated (real Date type)                    |
| `updatedAt`   | Date     | Auto-updated on every save                         |

---

## 🧪 Example API Requests

### Create a Recipe
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chocolate Lava Cake",
    "ingredients": [
      { "name": "Dark chocolate", "quantity": "200g" },
      { "name": "Butter", "quantity": "100g" },
      { "name": "Eggs", "quantity": "3" },
      { "name": "Sugar", "quantity": "80g" }
    ],
    "instructions": "Melt chocolate and butter together. Whisk eggs and sugar until pale. Fold the chocolate mixture into the eggs, pour into greased ramekins, and bake at 200°C for 12 minutes.",
    "cookingTime": 25,
    "difficulty": "Hard",
    "category": "Dessert"
  }'
```

### Get All Dessert Recipes
```bash
curl http://localhost:3000/api/recipes?category=Dessert
```

### Update Only the Cooking Time
```bash
curl -X PATCH http://localhost:3000/api/recipes/<id> \
  -H "Content-Type: application/json" \
  -d '{ "cookingTime": 30 }'
```

### Delete a Recipe
```bash
curl -X DELETE http://localhost:3000/api/recipes/<id>
```

---

## ✅ Best Practices Implemented

| Criterion                  | Implementation                                                         |
|----------------------------|------------------------------------------------------------------------|
| **BSON Data Types**        | `Number` for cookingTime, real `Date` for timestamps                   |
| **Schema Validation**      | `required`, `min`, `enum`, `trim`, `minlength` on every field          |
| **Indexing**               | Indexes on `category`, `title` (text), and compound `{category, cookingTime}` |
| **DRY**                    | Single `database.js` module imported where needed — no reconnections   |
| **3-Tier Architecture**    | Routes → Controllers → Services → Models (strict separation)           |
| **Non-Blocking I/O**       | All DB operations use `async/await`; `.lean()` for read performance    |
| **Error Handling**         | Global error handler normalizes all errors with proper HTTP status codes|
| **Silent End**             | Every controller path ends with `res.json()` — no hanging requests     |
| **Code Readability**       | Descriptive function names, JSDoc comments, ESLint enforced            |
| **Environment Security**   | `.env` for secrets; `.gitignore` prevents accidental commits           |

---

## 🔧 Valid Category Values

`Breakfast` | `Lunch` | `Dinner` | `Dessert` | `Snack` | `Appetizer` | `Beverage` | `Soup` | `Salad` | `Vegan` | `Vegetarian` | `Seafood` | `Baking` | `Other`

## 🔧 Valid Difficulty Values

`Easy` | `Medium` | `Hard` | `Expert`
