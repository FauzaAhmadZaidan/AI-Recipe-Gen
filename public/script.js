// Event listener untuk form submit
document.getElementById('recipe-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Ambil elemen DOM
  const ingredientsInput = document.getElementById('ingredients').value;
  const recipeOutput = document.getElementById('recipe-output');
  const loading = document.getElementById('loading');

  // Proses input bahan
  const ingredients = ingredientsInput.split(',').map(item => item.trim());
  console.log('Bahan yang dikirim:', ingredients); // Log input untuk debugging

  // Tampilkan loading, sembunyikan hasil
  loading.style.display = 'block';
  recipeOutput.style.display = 'none';

  try {
    // Kirim request ke backend
    const response = await fetch('/get-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });

    const data = await response.json();
    console.log('Response dari server:', data); // Log response untuk debugging

    // Sembunyikan loading setelah respons diterima
    loading.style.display = 'none';

    // Tangani respons sukses
    if (response.ok) {
      // Jika data memiliki struktur nested (result.recipe)
      if (data.result && data.result.recipe) {
        const recipe = data.result.recipe;
        const ingredientsList = recipe.ingredients
          .map(ing => `${ing.qty ? ing.qty + ' ' : ''}${ing.name}`)
          .join(', ');

        recipeOutput.innerHTML = `
          <h3>${recipe.name}</h3>
          <p><strong>Bahan:</strong> ${ingredientsList}</p>
          <p><strong>Langkah-langkah:</strong> ${data.instructions ? data.instructions.replace(/\n/g, '<br>') : 'Instruksi belum tersedia'}</p>
          <p><strong>Sumber:</strong> ${data.source || 'Tidak diketahui'}</p>
        `;
      } else {
        // Struktur data sederhana (title, ingredients, dll.)
        recipeOutput.innerHTML = `
          <h3>${data.title}</h3>
          <p><strong>Bahan:</strong> ${data.ingredients.join(', ')}</p>
          <p><strong>Langkah-langkah:</strong> ${data.instructions.replace(/\n/g, '<br>')}</p>
          <p><strong>Sumber:</strong> ${data.source}</p>
        `;
      }
      recipeOutput.style.display = 'block'; // Tampilkan hasil dengan animasi
    } else {
      // Tangani respons gagal
      recipeOutput.innerHTML = `<p>${data.message || 'Tidak ada resep ditemukan'}</p>`;
      recipeOutput.style.display = 'block';
    }
  } catch (error) {
    // Tangani error jaringan atau lainnya
    console.error('Error di frontend:', error); // Log error untuk debugging
    loading.style.display = 'none';
    recipeOutput.innerHTML = '<p>Terjadi kesalahan. Coba lagi nanti.</p>';
    recipeOutput.style.display = 'block';
  }
});