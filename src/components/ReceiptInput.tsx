import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { OCRService } from '../services/ocrService';

interface ReceiptInputProps {
  onAddProducts: (products: Product[]) => void;
  onBack: () => void;
}

const ReceiptInput: React.FC<ReceiptInputProps> = ({ onAddProducts, onBack }) => {
  const [receiptText, setReceiptText] = useState('');
  const [store, setStore] = useState('');
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseReceiptFromText = () => {
    if (!receiptText.trim()) return;

    const result = OCRService.parseReceiptText(receiptText);
    
    const products: Product[] = result.products.map((productName, index) => ({
      id: `receipt-${Date.now()}-${index}`,
      name: productName,
      category: 'Другое',
      status: 'full'
    }));

    if (result.store && !store) {
      setStore(result.store);
    }

    setParsedProducts(products);
    setSelectedProducts(new Set(products.map(p => p.id)));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const extractedText = await OCRService.extractTextFromImage(file);
      setReceiptText(extractedText);
      
      // Автоматически парсим после загрузки
      const result = OCRService.parseReceiptText(extractedText);
      
      const products: Product[] = result.products.map((productName, index) => ({
        id: `receipt-${Date.now()}-${index}`,
        name: productName,
        category: 'Другое',
        status: 'full'
      }));

      if (result.store && !store) {
        setStore(result.store);
      }

      setParsedProducts(products);
      setSelectedProducts(new Set(products.map(p => p.id)));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки изображения');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddSelected = () => {
    const productsToAdd = parsedProducts.filter(product => 
      selectedProducts.has(product.id)
    );
    
    if (productsToAdd.length > 0) {
      onAddProducts(productsToAdd);
    }
  };

  const selectAll = () => {
    setSelectedProducts(new Set(parsedProducts.map(p => p.id)));
  };

  const selectNone = () => {
    setSelectedProducts(new Set());
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Сканирование чека</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
            Магазин (опционально)
          </label>
          <select
            id="store"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Выберите магазин</option>
            <option value="Пятерочка">Пятерочка</option>
            <option value="Магнит">Магнит</option>
            <option value="Лента">Лента</option>
            <option value="Другой">Другой магазин</option>
          </select>
        </div>

        <div>
          <label htmlFor="receiptText" className="block text-sm font-medium text-gray-700 mb-1">
            Вставьте текст чека
          </label>
          <textarea
            id="receiptText"
            value={receiptText}
            onChange={(e) => setReceiptText(e.target.value)}
            placeholder="Вставьте сюда текст из чека..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={parseReceiptFromText}
            disabled={!receiptText.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Разобрать чек
          </button>
          
          <button
            onClick={triggerFileInput}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            📷 Загрузить фото чека
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {parsedProducts.length > 0 && (
            <>
              <button
                onClick={selectAll}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Выбрать все
              </button>
              <button
                onClick={selectNone}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Снять выделение
              </button>
            </>
          )}
        </div>
      </div>

      {parsedProducts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Распознанные продукты ({selectedProducts.size} выбрано)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {parsedProducts.map((product) => (
              <label
                key={product.id}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleProductToggle(product.id)}
                  className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{product.name}</span>
              </label>
            ))}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Назад
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedProducts.size === 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить выбранные ({selectedProducts.size})
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Как это работает:</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <strong className="text-blue-800">Автоматическое распознавание:</strong>
            <p className="mt-1">Загрузите фото чека - система сама распознает текст и извлечет продукты!</p>
          </div>
          
          <div>
            <strong>📷 Фото чека:</strong> Сфотографируйте чек и загрузите фото
          </div>
          <div>
            <strong>📋 Текст чека:</strong> Скопируйте текст из приложения магазина
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="bg-green-50 p-2 rounded">
              <strong>Пятерочка:</strong> Приложение, email
            </div>
            <div className="bg-green-50 p-2 rounded">
              <strong>Магнит:</strong> СМС, приложение
            </div>
            <div className="bg-green-50 p-2 rounded">
              <strong>Лента:</strong> Приложение, email
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <strong>Совет:</strong> Фото чека должно быть четким и хорошо освещенным для лучшего распознавания.
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-blue-700">Обрабатываем изображение...</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptInput;