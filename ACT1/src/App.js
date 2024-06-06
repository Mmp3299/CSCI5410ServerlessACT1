import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// AWS URL   
const apiBaseUrl = 'https://nugc0z129a.execute-api.us-east-1.amazonaws.com/ACT1';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Fetch all recipes on load
  useEffect(() => {
    axios.get(`${apiBaseUrl}/list-recipe`).then(response => setRecipes(response.data));
  }, []);

  // Create a new recipe
  const createRecipe = () => {
    if (!image) return alert('Select an image');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const payload = {
        recipe_name: recipeName,
        ingredients: ingredients.split(',').map(item => item.trim()),
        instructions,
        image_data: reader.result.split(',')[1],
      };

      axios.post(`${apiBaseUrl}/create-recipe`, payload).then(() => {
        axios.get(`${apiBaseUrl}/list-recipe`).then(response => setRecipes(response.data));
        setRecipeName(''); setIngredients(''); setInstructions(''); setImage(null);
      });
    };
    reader.readAsDataURL(image);
  };

  // Delete a recipe
  const deleteRecipe = recipeId => {
    axios.delete(`${apiBaseUrl}/delete-recipe`, { data: { recipe_id: recipeId } }).then(() => {
      axios.get(`${apiBaseUrl}/list-recipe`).then(response => setRecipes(response.data));
    });
  };

  // Get details of a single recipe (Image is included in this response)
  const getRecipe = recipeId => {
    axios.get(`${apiBaseUrl}/get-recipe`, { params: { recipe_id: recipeId } }).then(response => setSelectedRecipe(response.data));
  };

  return (
    <div className="App">
      <h1>Recipe Management</h1>
      <button onClick={() => document.getElementById('create-recipe-form').style.display = 'block'}>Create Recipe</button>
      
      {/* Form for creating a new recipe */}
      <div id="create-recipe-form" style={{ display: 'none' }}>
        <input type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)} placeholder="Recipe Name" required /><br />
        <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Ingredients" required></textarea><br />
        <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Instructions" required></textarea><br />
        <input type="file" onChange={e => setImage(e.target.files[0])} /><br />
        <button onClick={createRecipe}>Submit</button>
      </div>
      
      {/* List of recipes */}
      {recipes.map(recipe => (
        <div key={recipe.recipe_id}>
          <h3>{recipe.recipe_name}</h3>
          <p>{recipe.ingredients.join(', ')}</p>
          <p>{recipe.instructions}</p>
          <button onClick={() => deleteRecipe(recipe.recipe_id)}>Delete</button>
          <button onClick={() => getRecipe(recipe.recipe_id)}>View</button>
        </div>
      ))}
      
      {/* Details of the selected recipe */}
      {selectedRecipe && (
        <div>
          <h2>{selectedRecipe.recipe_name}</h2>
          {selectedRecipe.image_url && <img src={selectedRecipe.image_url} alt="Recipe" style={{ width: '100%', maxWidth: '300px' }} />}
          <p>{selectedRecipe.ingredients.join(', ')}</p>
          <p>{selectedRecipe.instructions}</p>
        </div>
      )}
    </div>
  );
}
export default App;
