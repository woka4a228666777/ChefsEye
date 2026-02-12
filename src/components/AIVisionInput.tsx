import React, { useState, useRef } from 'react';
import { Product } from '../types';
import AIVisionService from '../services/aiVisionService';

interface AIVisionInputProps {
  onAddProducts: (products: Product[]) => void;
  onBack: () => void;
}

const AIVisionInput: React.FC<AIVisionInputProps> = ({ onAddProducts, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectedProducts, setDetectedProducts] = useState<Product[]>([]);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [apiUsed, setApiUsed] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Сброс предыдущих результатов
    setError('');
    setDetectedProducts([]);
    setApiUsed('');
    setIsProcessing(true);

    try {
      // Показываем превью изображения
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Начинаем обработку с прогрессом
      setProcessingStage('Анализируем изображение...');
      
      const result = await AIVisionService.detectProducts(file, (stage) => {
        setProcessingStage(stage);
      });

      setApiUsed(result.modelUsed);
      
      const products: Product[] = result.products.map((detection, index) => ({
        id: `ai-detected-${Date.now()}-${index}`,
        name: detection.name,
        category: detection.category || 'other',
        status: 'full',
        confidence: detection.confidence,
        source: 'ai-vision'
      }));

      setDetectedProducts(products);
      
      if (products.length > 0) {
        setError(`✅ Успешно распознано ${products.length} продуктов с помощью ${getApiDisplayName(apiUsed)}!`);
      } else {
        setError('❌ Не удалось распознать продукты на фото. Попробуйте другое изображение.');
      }
      
    } catch (err) {
      console.error('AI Vision error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка распознавания изображения');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const getApiDisplayName = (api: string): string => {
    const apiNames: Record<string, string> = {
      'huggingface': 'Hugging Face AI',
      'google-vision': 'Google Vision',
      'fallback': 'резервный алгоритм',
      'simulation': 'тестовый режим'
    };
    return apiNames[api] || api;
  };

  const handleAddProducts = () => {
    if (detectedProducts.length > 0) {
      onAddProducts(detectedProducts);
      setError(`✅ Добавлено ${detectedProducts.length} продуктов!`);
      
      // Автоматический сброс через 2 секунды
      setTimeout(() => {
        setSelectedImage(null);
        setDetectedProducts([]);
        setError('');
      }, 2000);
    }
  };

  const clearResults = () => {
    setSelectedImage(null);
    setDetectedProducts([]);
    setError('');
    setApiUsed('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Создаем искусственное событие для обработки файла
        const event = {
          target: { files: [file] }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleImageUpload(event);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          ← Назад
        </button>
        <h2 className="text-2xl font-bold text-gray-900">🤖 Умное распознавание продуктов</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Статус обработки */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">{processingStage}</p>
            <p className="text-sm text-gray-500 mt-2">Используем современные нейросети для анализа...</p>
          </div>
        )}

        {/* Сообщения об ошибках/успехе */}
        {error && (
          <div className={`p-4 rounded-lg border ${
            error.includes('✅') 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : error.includes('❌')
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">{error.includes('✅') ? '✅' : error.includes('❌') ? '❌' : 'ℹ️'}</span>
              <span>{error}</span>
            </div>
            {apiUsed && (
              <p className="text-sm opacity-75 mt-1">
                Использован: {getApiDisplayName(apiUsed)}
              </p>
            )}
          </div>
        )}

        {/* Загрузка изображения */}
        {!selectedImage && !isProcessing && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Загрузите фото продуктов</h3>
            <p className="text-gray-600 mb-4">Перетащите изображение или нажмите для выбора файла</p>
            
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-2">📷 Поддерживаемые форматы:</p>
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <span>JPEG</span>
                <span>PNG</span>
                <span>WEBP</span>
                <span>до 10MB</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Результаты распознавания */}
        {selectedImage && !isProcessing && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Результаты анализа</h3>
              <div className="flex space-x-3">
                <button
                  onClick={clearResults}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  📷 Новое фото
                </button>
                {detectedProducts.length > 0 && (
                  <button
                    onClick={handleAddProducts}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Добавить все
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Изображение */}
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Анализируемое изображение"
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-lg mr-2">📊</span>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Статистика анализа</p>
                      <p className="text-xs text-blue-600">
                        Распознано: {detectedProducts.length} продуктов | 
                        API: {getApiDisplayName(apiUsed)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Список продуктов */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Распознанные продукты</h4>
                
                {detectedProducts.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center mb-4">
                      <span className="text-green-600 text-xl mr-2">✅</span>
                      <h5 className="font-medium text-green-800">Автоматически распознано:</h5>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {detectedProducts.map((product, index) => (
                        <div 
                          key={product.id} 
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 shadow-sm"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {product.category}
                                  </span>
                                  {(product as any).confidence && (
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {(product as any).confidence && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                          {Math.round((product as any).confidence * 100)}%
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">AI</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAddProducts}
                      className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📥 Добавить все продукты ({detectedProducts.length})
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <div className="text-yellow-600 text-4xl mb-3">🔍</div>
                    <p className="text-yellow-800 font-medium mb-2">Продукты не найдены</p>
                    <p className="text-yellow-700 text-sm">
                      Попробуйте другое фото с лучшим освещением и четкими продуктами
                    </p>
                  </div>
                )}

                <button
                  onClick={onBack}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Вернуться назад
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Информационная панель */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">🎯 Как добиться лучших результатов</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
              <h4 className="font-medium text-blue-800 mb-2">✅ Что делать:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Хорошее естественное освещение</li>
                <li>• Четкий фокус на продуктах</li>
                <li>• Продукты отдельно друг от друга</li>
                <li>• Крупный план упаковки/этикетки</li>
                <li>• Фон без отвлекающих элементов</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
              <h4 className="font-medium text-green-800 mb-2">🚀 Технологии:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Современные нейросети AI</li>
                <li>• Компьютерное зрение</li>
                <li>• Машинное обучение</li>
                <li>• Мульти-API подход</li>
                <li>• Автоматическая категоризация</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
              <h4 className="font-medium text-red-800 mb-2">❌ Избегайте:</h4>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Слишком темные фото</li>
                <li>• Размытые изображения</li>
                <li>• Сильные блики/тени</li>
                <li>• Много продуктов в куче</li>
                <li>• Сложный фон с узорами</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r">
              <h4 className="font-medium text-purple-800 mb-2">📊 Точность:</h4>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• До 95% для четких этикеток</li>
                <li>• 80-90% для свежих продуктов</li>
                <li>• Автоматическая проверка</li>
                <li>• Уверенность каждого распознавания</li>
                <li>• Постоянное улучшение алгоритмов</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVisionInput;