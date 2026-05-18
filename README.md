# Global Kitchen API

A simple RESTful API and web interface for managing recipes. Built with Node.js, Express, and MongoDB.

## Features
- Full CRUD operations for recipes
- Web dashboard to easily add, edit, and delete recipes
- Search and category filtering
- MongoDB backend

## Setup

1. Install the dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your MongoDB connection string:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/global_kitchen
NODE_ENV=development
```

3. Start the server:
```bash
# for development with hot-reload
npm run dev

# for production
npm start
```
The app will run on `http://localhost:3000`. You can visit this URL in your browser to see the UI.

## API Endpoints

- `GET /api/recipes` - List all recipes. You can filter with query params (e.g. `?category=Dessert`)
- `GET /api/recipes/:id` - Get a specific recipe
- `POST /api/recipes` - Add a new recipe
- `PATCH /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

## Recipe Data Structure

When creating or updating a recipe via the API, send a JSON payload like this:

```json
{
  "title": "Jollof Rice",
  "category": "Dinner",
  "difficulty": "Medium",
  "cookingTime": 45,
  "ingredients": [
    { "name": "Long-grain rice", "quantity": "2 cups" },
    { "name": "Tomatoes", "quantity": "4 large" }
  ],
  "instructions": "Blend tomatoes and peppers. Fry the blend in oil..."
}
```

Valid Categories: Breakfast, Lunch, Dinner, Dessert, Snack, Appetizer, Beverage, Soup, Salad, Vegan, Vegetarian, Seafood, Baking, Other.  
Valid Difficulty levels: Easy, Medium, Hard, Expert.
