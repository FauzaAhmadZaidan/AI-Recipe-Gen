const request = require('supertest');
const nock = require('nock');
const app = require('../../src/server');

// Mock the HfInference class
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

describe('Recipe API Endpoints', () => {
  beforeAll(() => {
    // Disable external HTTP requests
    nock.disableNetConnect();
    // Allow localhost connections for supertest
    nock.enableNetConnect('127.0.0.1');
  });

  afterAll(() => {
    // Re-enable all HTTP requests
    nock.enableNetConnect();
    // Clean up all interceptors
    nock.cleanAll();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /get-recipe', () => {
    test('should return a recipe when valid ingredients are provided', async () => {
      // Mock TheMealDB API responses
      nock('https://www.themealdb.com')
        .get('/api/json/v1/1/filter.php')
        .query({ i: 'chicken' })
        .reply(200, {
          meals: [
            { idMeal: '12345', strMeal: 'Chicken Curry' }
          ]
        });

      nock('https://www.themealdb.com')
        .get('/api/json/v1/1/lookup.php')
        .query({ i: '12345' })
        .reply(200, {
          meals: [
            {
              idMeal: '12345',
              strMeal: 'Chicken Curry',
              strInstructions: 'Cook the chicken with spices',
              strSource: 'TheMealDB'
            }
          ]
        });

      // Make the API request
      const response = await request(app)
        .post('/get-recipe')
        .send({ ingredients: ['chicken', 'tomato', 'garlic'] })
        .expect('Content-Type', /json/)
        .expect(200);

      // Check the response structure
      expect(response.body).toHaveProperty('title', 'Chicken Curry');
      expect(response.body).toHaveProperty('ingredients');
      expect(response.body.ingredients).toEqual(['chicken', 'tomato', 'garlic']);
      expect(response.body).toHaveProperty('instructions', 'Ini adalah resep yang direkomendasikan.');
      expect(response.body).toHaveProperty('source', 'TheMealDB');
    });

    test('should return 404 when no recipes are found', async () => {
      // Mock TheMealDB API response for no recipes found
      nock('https://www.themealdb.com')
        .get('/api/json/v1/1/filter.php')
        .query({ i: 'unknown' })
        .reply(200, { meals: null });

      // Make the API request
      const response = await request(app)
        .post('/get-recipe')
        .send({ ingredients: ['unknown'] })
        .expect('Content-Type', /json/)
        .expect(404);

      // Check the error message
      expect(response.body).toHaveProperty('message', 'Tidak ada resep ditemukan untuk bahan ini.');
    });

    test('should return 500 when TheMealDB API fails', async () => {
      // Mock TheMealDB API failure
      nock('https://www.themealdb.com')
        .get('/api/json/v1/1/filter.php')
        .query({ i: 'chicken' })
        .replyWithError('API connection failed');

      // Make the API request
      const response = await request(app)
        .post('/get-recipe')
        .send({ ingredients: ['chicken'] })
        .expect('Content-Type', /json/)
        .expect(500);

      // Check the error message
      expect(response.body).toHaveProperty('message', 'Terjadi kesalahan pada server.');
    });
  });
});
