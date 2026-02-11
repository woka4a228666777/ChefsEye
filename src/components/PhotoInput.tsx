import React, { useState } from 'react';
import { Product } from '../types';
import { VisionService } from '../services/visionService';

interface PhotoInputProps {
  onAddProducts: (products: Product[]) => void;
  onBack: () => void;
}

const PhotoInput: React.FC<PhotoInputProps> = ({ onAddProducts, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectedProducts, setDetectedProducts] = useState<Product[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Автоматическое распознавание продуктов
    setIsProcessing(true);
    setError('');

    try {
      const result = await VisionService.detectProducts(file);
      
      const products: Product[] = result.products.map(detection => ({
        id: `detected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: detection.name,
        category: VisionService.getProductCategory(detection.name),
        status: 'full'
      }));

      setDetectedProducts(products);
      
      // Показываем превью изображения
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (products.length > 0) {
        setError(`Успешно распознано ${products.length} продуктов!`);
      } else {
        setError('Не удалось распознать продукты на фото');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка распознавания изображения');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddProducts = () => {
    if (detectedProducts.length > 0) {
      onAddProducts(detectedProducts);
      setError(`Добавлено ${detectedProducts.length} продуктов!`);
    }
  };

  const clearResults = () => {
    setSelectedImage(null);
    setDetectedProducts([]);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Фото холодильника</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {isProcessing && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Распознаем продукты на фото...</p>
          </div>
        )}

        {error && (
          <div className={`p-4 rounded-md mb-4 ${
            error.includes('Успешно') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        {!selectedImage && !isProcessing ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">📸</span>
            </div>
            <p className="text-gray-600 mb-4">Загрузите фото вашего холодильника или продуктов</p>
            <label className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md cursor-pointer hover:bg-primary-700">
              Выбрать фото
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Результаты распознавания</h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearResults}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm"
                >
                  Новое фото
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <img
                    src={selectedImage}
                    alt="Загруженное фото"
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                  
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                      📸 Фото загружено для анализа
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Распознанные продукты</h4>
                
                {detectedProducts.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h5 className="font-medium text-green-800 text-sm mb-3">✅ Автоматически распознано:</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {detectedProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{index + 1}. {product.name}</span>
                            <span className="text-xs text-green-600 ml-2">({product.category})</span>
                          </div>
                          <span className="text-xs text-gray-500">авто</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleAddProducts}
                      className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Добавить все продукты ({detectedProducts.length})
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
                    <p className="text-yellow-700 text-sm">
                      Продукты не распознаны. Попробуйте другое фото с лучшим освещением.
                    </p>
                  </div>
                )}

                <button
                  onClick={onBack}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Назад к списку
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Как пользоваться:</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <strong className="text-green-800">Полностью автоматическое распознавание:</strong>
            <p className="mt-1">Просто загрузите фото - система сама определит все продукты!</p>
          </div>
          
          <ol className="space-y-2">
            <li>1. Сделайте четкое фото холодильника или продуктов на столе</li>
            <li>2. Система автоматически распознает все видимые продукты</li>
            <li>3. Продукты добавляются с автоматическим определением категорий</li>
            <li>4. Нажмите "Добавить все продукты" для подтверждения</li>
          </ol>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <strong>📸 Советы для лучшего распознавания:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Хорошее освещение</li>
              <li>• Четкий фокус на продуктах</li>
              <li>• Избегайте бликов и теней</li>
              <li>• Размещайте продукты отдельно друг от друга</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoInput;