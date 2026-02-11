import React from 'react';
import { Product } from '../types';

interface DashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onNavigate
}) => {
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'empty': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрое добавление</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('manual')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📝</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Ручной ввод</span>
          </button>

          <button
            onClick={() => onNavigate('receipt')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-200 transition-colors">
              <span className="text-2xl">🧾</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Сканировать чек</span>
            <span className="text-xs text-green-600 mt-1">Авто-распознавание</span>
          </button>

          <button
            onClick={() => onNavigate('photo')}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-200 transition-colors">
              <span className="text-2xl">📸</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Фото холодильника</span>
            <span className="text-xs text-green-600 mt-1">Авто-распознавание</span>
          </button>
        </div>
      </div>

      {/* Current Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Мои продукты</h2>
          <span className="text-sm text-gray-500">{products.length} продуктов</span>
        </div>

        {Object.keys(productsByCategory).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500">Добавьте продукты, чтобы начать поиск рецептов</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {product.status === 'full' && '📦'}
                          {product.status === 'low' && '⚠️'}
                          {product.status === 'empty' && '❌'}
                        </span>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={product.status}
                          onChange={(e) => onUpdateProduct(product.id, { 
                            status: e.target.value as Product['status'] 
                          })}
                          className={`text-xs px-2 py-1 rounded ${getStatusColor(product.status)}`}
                        >
                          <option value="full">Есть</option>
                          <option value="low">Мало</option>
                          <option value="empty">Нет</option>
                        </select>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Recipes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Рекомендуемые рецепты</h2>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            Все рецепты →
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <p className="text-gray-500 mb-4">Добавьте продукты, чтобы увидеть рекомендации</p>
          <button
            onClick={() => onNavigate('manual')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Добавить продукты
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;