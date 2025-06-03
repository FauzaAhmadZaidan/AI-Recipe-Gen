const request = require('supertest');

// Mock untuk Hugging Face API
jest.mock('@huggingface/inference', () => {
  return {
    HfInference: jest.fn().mockImplementation(() => {
      return {
        textGeneration: jest.fn().mockResolvedValue({
          generated_text: 'Ini adalah resep yang direkomendasikan.'
        })
      };
    })
  };
});

// Mock untuk axios sebelum mengimpor app
jest.mock('axios', () => ({
  get: jest.fn()
    .mockImplementationOnce((url) => {
      if (url.includes('filter.php')) {
        return Promise.resolve({
          data: {
            meals: [{ idMeal: '52940', strMeal: 'Brown Stew Chicken' }]
          }
        });
      }
    })
    .mockImplementationOnce((url) => {
      if (url.includes('lookup.php')) {
        return Promise.resolve({
          data: {
            meals: [{
              idMeal: '52940',
              strMeal: 'Brown Stew Chicken',
              strInstructions: 'Cook the chicken with spices',
              strSource: 'TheMealDB'
            }]
          }
        });
      }
    })
}));

// Impor app setelah semua mock disiapkan
const app = require('../../src/server');

describe('Recipe App Simple E2E Tests', () => {
  // Simpan referensi ke server yang berjalan
  let server;
  
  // Sebelum semua test, buat server baru dengan port berbeda
  beforeAll((done) => {
    // Pastikan server tidak mendengarkan port default
    // Kita akan membuat server baru untuk pengujian
    server = app.listen(3001, () => {
      console.log('Test server berjalan di port 3001');
      done();
    });
  });
  
  // Setelah semua test, tutup server
  afterAll((done) => {
    server.close(done);
  });

  test('should return a recipe when valid ingredients are provided', async () => {
    const response = await request(app)
      .post('/get-recipe')
      .send({ ingredients: ['chicken', 'tomato', 'garlic'] })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('title', 'Brown Stew Chicken');
    expect(response.body).toHaveProperty('ingredients');
    expect(response.body.ingredients).toEqual(['chicken', 'tomato', 'garlic']);
    expect(response.body).toHaveProperty('instructions', 'Ini adalah resep yang direkomendasikan.');
    expect(response.body).toHaveProperty('source', 'TheMealDB');
  });
});
