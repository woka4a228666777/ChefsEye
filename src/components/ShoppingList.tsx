import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from '../types';
import { storage } from '../utils/storage';

interface ShoppingListProps {
  onBack: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ onBack }) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  const categories = [
    'Овощи',
    'Фрукты',
    'Молочные продукты',
    'Мясо и птица',
    'Рыба и морепродукты',
    'Бакалея',
    'Специи и приправы',
    'Напитки',
    'Замороженные продукты',
    'Другое'
  ];

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      const shoppingList = await storage.getShoppingList();
      setItems(shoppingList);
    } catch (error) {
      console.error('Failed to load shopping list:', error);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory || 'Другое',
      quantity: newItemQuantity,
      completed: false,
      addedAt: new Date()
    };

    try {
      await storage.addToShoppingList(newItem);
      setItems(prev => [...prev, newItem]);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemQuantity('');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const toggleItem = async (itemId: string) => {
    try {
      await storage.updateShoppingItem(itemId, { completed: !items.find(item => item.id === itemId)?.completed });
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      ));
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const list = await storage.getShoppingList();
      const filteredList = list.filter(item => item.id !== itemId);
      await storage.saveShoppingList(filteredList);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const clearCompleted = async () => {
    try {
      await storage.clearCompletedItems();
      setItems(prev => prev.filter(item => !item.completed));
    } catch (error) {
      console.error('Failed to clear completed items:', error);
    }
  };

  const exportToText = () => {
    const text = items
      .filter(item => !item.completed)
      .map(item => {
        let line = `- ${item.name}`;
        if (item.quantity) line += ` (${item.quantity})`;
        if (item.category && item.category !== 'Другое') line += ` [${item.category}]`;
        return line;
      })
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'список-покупок.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Другое';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Список покупок</h2>
      </div>

      {/* Add Item Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить продукт</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Название продукта"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          
          <div>
            <input
              type="text"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Количество (опционально)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          
          <div>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите категорию</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={addItem}
          disabled={!newItemName.trim()}
          className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          Добавить
        </button>
      </div>

      {/* Shopping List */}
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {completedCount} из {totalCount} завершено
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToText}
              disabled={items.length === 0}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Экспорт
            </button>
            
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                Очистить завершенные
              </button>
            )}
          </div>
        </div>

        {/* Items by Category */}
        {Object.keys(itemsByCategory).length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-600">Список покупок пуст</p>
            <p className="text-sm text-gray-500 mt-1">Добавьте продукты вручную или из рецептов</p>
          </div>
        ) : (
          <div className="divide-y">
            {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <div key={category}>
                <h4 className="p-3 bg-gray-50 font-medium text-gray-900">
                  {category}
                </h4>
                
                <ul className="divide-y">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="p-3 flex items-center">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                        className="mr-3 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      
                      <div className="flex-1">
                        <span className={`block ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.name}
                          {item.quantity && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({item.quantity})
                            </span>
                          )}
                        </span>
                        
                        {item.addedAt && (
                          <span className="text-xs text-gray-500">
                            Добавлено: {new Date(item.addedAt).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={onBack}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Назад
        </button>
        
        <button
          onClick={exportToText}
          disabled={items.length === 0}
          className="px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          📋 Экспорт списка
        </button>
      </div>

      {/* Statistics */}
      {items.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h4 className="font-medium text-gray-900 mb-2">Статистика:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl">{totalCount}</div>
              <div className="text-gray-600">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-green-600">{totalCount - completedCount}</div>
              <div className="text-gray-600">Активно</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-blue-600">{completedCount}</div>
              <div className="text-gray-600">Завершено</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;