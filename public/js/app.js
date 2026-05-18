// DOM Elements
const recipeGrid = document.getElementById('recipeGrid');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// Add/Edit Modal
const recipeModal = document.getElementById('recipeModal');
const recipeForm = document.getElementById('recipeForm');
const modalTitle = document.getElementById('modalTitle');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const ingredientsContainer = document.getElementById('ingredientsContainer');
const addIngredientBtn = document.getElementById('addIngredientBtn');

// View Modal
const viewRecipeModal = document.getElementById('viewRecipeModal');
const closeViewModalBtn = document.getElementById('closeViewModalBtn');
const viewTitle = document.getElementById('viewTitle');
const viewCategory = document.getElementById('viewCategory');
const viewDifficulty = document.getElementById('viewDifficulty');
const viewTime = document.getElementById('viewTime');
const viewIngredients = document.getElementById('viewIngredients');
const viewInstructions = document.getElementById('viewInstructions');
const viewEditBtn = document.getElementById('viewEditBtn');
const viewDeleteBtn = document.getElementById('viewDeleteBtn');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');

// State
let allRecipes = [];
let currentViewingRecipe = null;

// --- API Functions ---
const API_URL = '/api/recipes';

async function fetchRecipes() {
    showLoader();
    try {
        const url = new URL(API_URL, window.location.origin);
        // We could use backend search, but for snappy UX, we fetch all and filter client-side if data is small
        // For a large app, we would append search and category to url here.
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'success') {
            allRecipes = data.data.recipes;
            renderRecipes(allRecipes);
        } else {
            showToast('Failed to load recipes', 'error');
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        showToast('Server error. Could not load recipes.', 'error');
    } finally {
        hideLoader();
    }
}

async function saveRecipe(recipeData, id = null) {
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipeData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(id ? 'Recipe updated successfully!' : 'Recipe created successfully!');
            closeModal();
            fetchRecipes(); // Refresh list
        } else {
            // Handle validation errors
            let errorMsg = data.message || 'Error saving recipe';
            if (data.error && data.error.name === 'ValidationError') {
                const messages = Object.values(data.error.errors).map(val => val.message);
                errorMsg = messages.join(', ');
            }
            showToast(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error saving:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

async function deleteRecipe(id) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.status === 204) {
            showToast('Recipe deleted successfully!');
            closeViewModal();
            fetchRecipes();
        } else {
            showToast('Failed to delete recipe', 'error');
        }
    } catch (error) {
        showToast('Error deleting recipe', 'error');
    }
}

// --- Render Functions ---
function renderRecipes(recipes) {
    recipeGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = () => openViewModal(recipe);
            
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-category">${recipe.category}</span>
                </div>
                <h3 class="card-title">${recipe.title}</h3>
                <div class="card-meta">
                    <span><i class="fa-solid fa-clock"></i> ${recipe.cookingTime}m</span>
                    <span><i class="fa-solid fa-gauge-high"></i> ${recipe.difficulty}</span>
                    <span><i class="fa-solid fa-list-check"></i> ${recipe.ingredients.length} items</span>
                </div>
            `;
            recipeGrid.appendChild(card);
        });
    }
}

function showLoader() {
    loader.classList.remove('hidden');
    recipeGrid.classList.add('hidden');
    emptyState.classList.add('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
    recipeGrid.classList.remove('hidden');
}

// --- Filtering logic ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    const filtered = allRecipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) || 
                              recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm));
        const matchesCategory = category === '' || recipe.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderRecipes(filtered);
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

// --- Modal & Form Logic ---
function openModal(recipe = null) {
    recipeForm.reset();
    ingredientsContainer.innerHTML = '';
    
    if (recipe) {
        modalTitle.textContent = 'Edit Recipe';
        document.getElementById('recipeId').value = recipe._id;
        document.getElementById('title').value = recipe.title;
        document.getElementById('category').value = recipe.category;
        document.getElementById('difficulty').value = recipe.difficulty;
        document.getElementById('cookingTime').value = recipe.cookingTime;
        document.getElementById('instructions').value = recipe.instructions;
        
        recipe.ingredients.forEach(ing => addIngredientRow(ing.name, ing.quantity));
    } else {
        modalTitle.textContent = 'Add New Recipe';
        document.getElementById('recipeId').value = '';
        addIngredientRow(); // Add one empty row by default
    }
    
    recipeModal.classList.remove('hidden');
}

function closeModal() {
    recipeModal.classList.add('hidden');
}

function openViewModal(recipe) {
    currentViewingRecipe = recipe;
    viewTitle.textContent = recipe.title;
    viewCategory.innerHTML = `<i class="fa-solid fa-tag"></i> ${recipe.category}`;
    viewDifficulty.innerHTML = `<i class="fa-solid fa-gauge-high"></i> ${recipe.difficulty}`;
    viewTime.innerHTML = `<i class="fa-solid fa-clock"></i> ${recipe.cookingTime} mins`;
    
    viewIngredients.innerHTML = recipe.ingredients.map(ing => 
        `<li><span>${ing.name}</span> <span class="text-muted">${ing.quantity}</span></li>`
    ).join('');
    
    viewInstructions.textContent = recipe.instructions;
    
    viewRecipeModal.classList.remove('hidden');
}

function closeViewModal() {
    viewRecipeModal.classList.add('hidden');
    currentViewingRecipe = null;
}

// Event Listeners for Modals
addRecipeBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

closeViewModalBtn.addEventListener('click', closeViewModal);

viewEditBtn.addEventListener('click', () => {
    closeViewModal();
    openModal(currentViewingRecipe);
});

viewDeleteBtn.addEventListener('click', () => {
    if(currentViewingRecipe) {
        deleteRecipe(currentViewingRecipe._id);
    }
});

// Form Submission
recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('recipeId').value;
    
    // Gather ingredients
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    const ingredients = [];
    ingredientRows.forEach(row => {
        const name = row.querySelector('.ingredient-name').value.trim();
        const quantity = row.querySelector('.ingredient-qty').value.trim();
        if (name && quantity) {
            ingredients.push({ name, quantity });
        }
    });
    
    if (ingredients.length === 0) {
        showToast('Please add at least one complete ingredient.', 'error');
        return;
    }

    const payload = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value,
        difficulty: document.getElementById('difficulty').value,
        cookingTime: Number(document.getElementById('cookingTime').value),
        instructions: document.getElementById('instructions').value.trim(),
        ingredients: ingredients
    };
    
    saveRecipe(payload, id || null);
});

// --- Dynamic Ingredients ---
function addIngredientRow(name = '', qty = '') {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" class="ingredient-name" placeholder="Ingredient (e.g. Chicken)" value="${name}" required>
        <input type="text" class="ingredient-qty" placeholder="Qty (e.g. 500g)" value="${qty}" required>
        <button type="button" class="btn-icon remove-ingredient-btn"><i class="fa-solid fa-trash"></i></button>
    `;
    
    row.querySelector('.remove-ingredient-btn').addEventListener('click', () => {
        if (ingredientsContainer.children.length > 1) {
            row.remove();
        } else {
            showToast('A recipe must have at least one ingredient.', 'error');
        }
    });
    
    ingredientsContainer.appendChild(row);
}

addIngredientBtn.addEventListener('click', () => addIngredientRow());

// --- Toast Utility ---
let toastTimeout;
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.classList.add('error');
        toastIcon.className = 'fa-solid fa-circle-exclamation';
    } else {
        toast.classList.remove('error');
        toastIcon.className = 'fa-solid fa-circle-check';
    }
    
    toast.classList.add('show');
    toast.classList.remove('hidden');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Init
document.addEventListener('DOMContentLoaded', fetchRecipes);
