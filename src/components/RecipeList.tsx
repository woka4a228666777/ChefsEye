import React, { useState, useEffect } from 'react';
import { Product, Recipe, RecipeSearchFilters } from '../types';
import { storage } from '../utils/storage';

interface RecipeListProps {
  products: Product[];
  recipes: Recipe[];
  onRecipesUpdate: (recipes: Recipe[]) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ products, recipes, onRecipesUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeSearchFilters>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const availableProducts = products.filter(p => p.status !== 'empty');
  const availableIngredients = availableProducts.map(p => p.name.toLowerCase());

  const searchRecipes = async () => {
    if (availableIngredients.length === 0) return;

    setIsLoading(true);
    try {
      // Mock API call - in real app, this would use Spoonacular API
      const mockRecipes: Recipe[] = [
        {
          id: 1,
          title: "Овощной салат",
          image: "/api/placeholder/300/200",
          usedIngredients: ["помидоры", "огурцы", "лук"],
          missedIngredients: ["оливковое масло", "лимон"],
          readyInMinutes: 15,
          servings: 4
        },
        {
          id: 2,
          title: "Куриная грудка с овощами",
          image: "/api/placeholder/300/200",
          usedIngredients: ["курица", "морковь", "лук"],
          missedIngredients: ["специи", "растительное масло"],
          readyInMinutes: 30,
          servings: 2
        },
        {
          id: 3,
          title: "Паста с томатным соусом",
          image: "/api/placeholder/300/200",
          usedIngredients: ["помидоры", "лук", "чеснок"],
          missedIngredients: ["паста", "базилик"],
          readyInMinutes: 25,
          servings: 3
        }
      ].filter(recipe => 
        recipe.usedIngredients.some(ingredient => 
          availableIngredients.some(available => available.includes(ingredient))
        )
      );

      onRecipesUpdate(mockRecipes);
      await storage.cacheRecipes(mockRecipes);
    } catch (error) {
      console.error('Failed to search recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length === 0 && availableIngredients.length > 0) {
      searchRecipes();
    }
  }, [availableIngredients]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTime = !filters.maxTime || recipe.readyInMinutes <= filters.maxTime;
    return matchesSearch && matchesTime;
  });

  const getMatchQuality = (recipe: Recipe) => {
    const usedCount = recipe.usedIngredients.filter(ingredient =>
      availableIngredients.some(available => available.includes(ingredient))
    ).length;
    
    const totalIngredients = recipe.usedIngredients.length + recipe.missedIngredients.length;
    return Math.round((usedCount / totalIngredients) * 100);
  };

  if (availableProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Добавьте продукты</h2>
        <p className="text-gray-600">Чтобы увидеть рецепты, добавьте продукты в свой список</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Поиск рецептов</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Название рецепта..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Макс. время (мин)</label>
            <select
              value={filters.maxTime || ''}
              onChange={(e) => setFilters({ ...filters, maxTime: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Любое</option>
              <option value="15">15 минут</option>
              <option value="30">30 минут</option>
              <option value="45">45 минут</option>
              <option value="60">1 час</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={searchRecipes}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Поиск...' : 'Обновить поиск'}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Найдено рецептов: {filteredRecipes.length}
          {availableProducts.length > 0 && (
            <span className="ml-4">
              Доступно продуктов: {availableProducts.length}
            </span>
          )}
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Рецепты не найдены</h3>
          <p className="text-gray-600">Попробуйте изменить параметры поиска или добавьте больше продуктов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🍳</span>
                </div>
                
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getMatchQuality(recipe) >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : getMatchQuality(recipe) >= 50
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getMatchQuality(recipe)}% совпадение
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">⏱️ {recipe.readyInMinutes} мин</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">👥 {recipe.servings} порции</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Есть в наличии:</h4>
                  <div className="flex flex-wrap gap-1">
                    {recipe.usedIngredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {recipe.missedIngredients.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Нужно купить:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recipe.missedIngredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Посмотреть рецепт
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedRecipe.title}</h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-6xl">🍳</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl">⏱️</div>
                  <div className="font-medium">{selectedRecipe.readyInMinutes} мин</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl">👥</div>
                  <div className="font-medium">{selectedRecipe.servings} порции</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Ингредиенты:</h4>
                <ul className="space-y-1">
                  {selectedRecipe.usedIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                  {selectedRecipe.missedIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-yellow-500 mr-2">⨯</span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  Добавить в список покупок
                </button>
                {selectedRecipe.sourceUrl && (
                  <a
                    href={selectedRecipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Открыть рецепт
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;