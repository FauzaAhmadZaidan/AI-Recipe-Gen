// Mock untuk API eksternal
const nock = require('nock');

// Setup mock untuk TheMealDB API
function setupMocks() {
  // Mock untuk pencarian resep
  nock('https://www.themealdb.com')
    .persist()
    .get('/api/json/v1/1/filter.php')
    .query({ i: 'chicken' })
    .reply(200, {
      meals: [
        { idMeal: '12345', strMeal: 'Chicken Curry' }
      ]
    });

  // Mock untuk detail resep
  nock('https://www.themealdb.com')
    .persist()
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

  // Mock untuk bahan yang tidak ada
  nock('https://www.themealdb.com')
    .persist()
    .get('/api/json/v1/1/filter.php')
    .query({ i: 'xyznonexistentingredient' })
    .reply(200, {
      meals: null
    });
}

module.exports = { setupMocks };
