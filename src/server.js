// Import dependensi
const express = require('express');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
const { hfApiToken } = require('./config');

// Inisialisasi aplikasi Express
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname + '/../public')); // Melayani file statis dari folder public

// Inisialisasi Hugging Face Inference
const hf = new HfInference(hfApiToken);

// Endpoint untuk mendapatkan resep
app.post('/get-recipe', async (req, res) => {
  const { ingredients } = req.body;
  console.log('Input bahan:', ingredients); // Log input dari client

  try {
    // Ambil bahan utama untuk pencarian di TheMealDB
    const mainIngredient = ingredients[0];
    console.log('Mencari resep untuk:', mainIngredient); // Log bahan utama

    // Request ke TheMealDB untuk daftar resep
    const mealDbResponse = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${mainIngredient}`
    );
    const meals = mealDbResponse.data.meals;
    console.log('Hasil TheMealDB:', meals); // Log hasil dari API

    // Cek apakah ada resep yang ditemukan
    if (!meals) {
      console.log('Tidak ada resep ditemukan');
      return res.status(404).json({ message: 'Tidak ada resep ditemukan untuk bahan ini.' });
    }

    // Ambil detail resep pertama
    const mealId = meals[0].idMeal;
    const mealDetailResponse = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const meal = mealDetailResponse.data.meals[0];
    console.log('Detail resep:', meal.strMeal); // Log judul resep

    // Buat prompt untuk Hugging Face
    const prompt = `
      Saya punya bahan: ${ingredients.join(', ')}. 
      Berdasarkan resep "${meal.strMeal}" dengan instruksi "${meal.strInstructions}",
      buatkan rekomendasi resep sederhana yang bisa saya buat, termasuk langkah-langkahnya.
    `;

    // Generate resep dengan Hugging Face
    const hfResponse = await hf.textGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
      },
    });
    const aiRecipe = hfResponse.generated_text;
    console.log('Resep dari Hugging Face:', aiRecipe); // Log hasil AI

    // Kirim respons ke client
    res.json({
      title: meal.strMeal,
      ingredients: ingredients,
      instructions: aiRecipe,
      source: meal.strSource || 'TheMealDB',
    });
  } catch (error) {
    console.error('Error di server:', error.message); // Log error dengan detail
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});