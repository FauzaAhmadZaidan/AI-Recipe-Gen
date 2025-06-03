const { 
  formatIngredients, 
  createRecipePrompt, 
  formatRecipeResponse 
} = require('../../src/utils');

describe('Utility Functions', () => {
  describe('formatIngredients', () => {
    test('should format an array of ingredients into a comma-separated string', () => {
      const ingredients = ['chicken', 'tomato', 'garlic'];
      expect(formatIngredients(ingredients)).toBe('chicken, tomato, garlic');
    });

    test('should trim whitespace from ingredients', () => {
      const ingredients = [' chicken ', ' tomato', 'garlic '];
      expect(formatIngredients(ingredients)).toBe('chicken, tomato, garlic');
    });

    test('should return empty string for non-array input', () => {
      expect(formatIngredients('not an array')).toBe('');
      expect(formatIngredients(null)).toBe('');
      expect(formatIngredients(undefined)).toBe('');
    });
  });

  describe('createRecipePrompt', () => {
    test('should create a valid prompt with ingredients and meal details', () => {
      const ingredients = ['chicken', 'tomato', 'garlic'];
      const meal = {
        strMeal: 'Chicken Curry',
        strInstructions: 'Cook the chicken with spices'
      };

      const prompt = createRecipePrompt(ingredients, meal);
      expect(prompt).toContain('Saya punya bahan: chicken, tomato, garlic');
      expect(prompt).toContain('Berdasarkan resep "Chicken Curry"');
      expect(prompt).toContain('dengan instruksi "Cook the chicken with spices"');
    });

    test('should throw error if required parameters are missing', () => {
      expect(() => createRecipePrompt(null, { strMeal: 'Test', strInstructions: 'Test' }))
        .toThrow('Missing required parameters');
      
      expect(() => createRecipePrompt(['chicken'], null))
        .toThrow('Missing required parameters');
    });
  });

  describe('formatRecipeResponse', () => {
    test('should format recipe response correctly', () => {
      const meal = {
        strMeal: 'Chicken Curry',
        strSource: 'Example Source'
      };
      const ingredients = ['chicken', 'tomato', 'garlic'];
      const aiRecipe = 'Cook the chicken with tomato and garlic';

      const response = formatRecipeResponse(meal, ingredients, aiRecipe);
      
      expect(response).toEqual({
        title: 'Chicken Curry',
        ingredients: ['chicken', 'tomato', 'garlic'],
        instructions: 'Cook the chicken with tomato and garlic',
        source: 'Example Source'
      });
    });

    test('should use default source if not provided', () => {
      const meal = {
        strMeal: 'Chicken Curry'
        // No strSource
      };
      const ingredients = ['chicken', 'tomato', 'garlic'];
      const aiRecipe = 'Cook the chicken with tomato and garlic';

      const response = formatRecipeResponse(meal, ingredients, aiRecipe);
      
      expect(response.source).toBe('TheMealDB');
    });
  });
});
