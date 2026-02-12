import { useState, useEffect } from 'react';
import { Product, Recipe } from './types';
import { storage } from './utils/storage';
import Dashboard from './components/Dashboard';
import ManualInput from './components/ManualInput';
import ReceiptInput from './components/ReceiptInput';
import AIVisionInput from './components/AIVisionInput';
import RecipeList from './components/RecipeList';
import ShoppingList from './components/ShoppingList';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'manual' | 'receipt' | 'photo' | 'recipes' | 'shopping'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [loadedProducts, loadedRecipes] = await Promise.all([
        storage.getProducts(),
        storage.getCachedRecipes()
      ]);
      setProducts(loadedProducts);
      setRecipes(loadedRecipes);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      await storage.addProduct(product);
      setProducts(prev => [...prev, product]);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await storage.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await storage.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Chef's Eye</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'dashboard'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Главная
              </button>
              <button
                onClick={() => setCurrentView('recipes')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'recipes'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Рецепты
              </button>
              <button
                onClick={() => setCurrentView('shopping')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'shopping'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Список покупок
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onNavigate={(view) => setCurrentView(view as Parameters<typeof setCurrentView>[0])}
          />
        )}

        {currentView === 'manual' && (
          <ManualInput
            onAddProduct={handleAddProduct}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'receipt' && (
          <ReceiptInput
            onAddProducts={(newProducts) => {
              newProducts.forEach(handleAddProduct);
              setCurrentView('dashboard');
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'photo' && (
          <AIVisionInput
            onAddProducts={(newProducts) => {
              newProducts.forEach(handleAddProduct);
              setCurrentView('dashboard');
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'recipes' && (
          <RecipeList
            products={products}
            recipes={recipes}
            onRecipesUpdate={setRecipes}
          />
        )}

        {currentView === 'shopping' && (
          <ShoppingList onBack={() => setCurrentView('dashboard')} />
        )}
      </main>
    </div>
  );
}

export default App;