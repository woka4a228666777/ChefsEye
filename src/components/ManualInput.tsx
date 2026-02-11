import React, { useState } from 'react';
import { Product } from '../types';

interface ManualInputProps {
  onAddProduct: (product: Product) => void;
  onBack: () => void;
}

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

const ManualInput: React.FC<ManualInputProps> = ({ onAddProduct, onBack }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<Product['status']>('full');
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const product: Product = {
      id: Date.now().toString(),
      name: name.trim(),
      category: category === 'custom' ? customCategory.trim() : category,
      status
    };

    onAddProduct(product);
    
    // Reset form
    setName('');
    setCategory('');
    setStatus('full');
    setCustomCategory('');
  };

  const finalCategory = category === 'custom' ? customCategory : category;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Ручной ввод продукта</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Название продукта
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Помидоры"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="custom">Другая категория...</option>
          </select>
        </div>

        {category === 'custom' && (
          <div>
            <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Введите название категории
            </label>
            <input
              type="text"
              id="customCategory"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Например: Орехи и семена"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Статус
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Product['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="full">Есть в наличии</option>
            <option value="low">Заканчивается</option>
            <option value="empty">Закончился</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !finalCategory.trim()}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить
          </button>
        </div>
      </form>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Советы по вводу:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Используйте конкретные названия ("Помидоры черри" вместо просто "Помидоры")</li>
          <li>• Указывайте количество в статусе ("Заканчивается" для малых количеств)</li>
          <li>• Выбирайте точную категорию для лучшей организации</li>
          <li>• Можно добавлять несколько продуктов подряд</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualInput;