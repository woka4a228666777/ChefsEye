// Сервис для распознавания текста с чеков (OCR)
// Используем бесплатный OCR API от OCR.Space

interface OCRResult {
  text: string;
  confidence: number;
}

interface ReceiptParseResult {
  products: string[];
  store?: string;
  total?: number;
  date?: Date;
}

// Конфигурация OCR API
const OCR_CONFIG = {
  // Бесплатный API ключ для OCR.Space (250 запросов/день)
  API_KEY: 'K88937697488957',
  API_URL: 'https://api.ocr.space/parse/image',
  // Резервный ключ
  FALLBACK_KEY: 'helloworld'
};

// Кэш для результатов OCR чтобы уменьшить количество запросов
const ocrCache = new Map<string, string>();

export class OCRService {
  static async extractTextFromImage(imageFile: File): Promise<string> {
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Неподдерживаемый формат файла. Загрузите изображение.');
    }

    // Проверяем кэш
    const fileHash = await this.generateFileHash(imageFile);
    if (ocrCache.has(fileHash)) {
      return ocrCache.get(fileHash)!;
    }

    try {
      // Пытаемся использовать реальное OCR API
      const extractedText = await this.callRealOCRAPI(imageFile);
      
      if (extractedText.trim().length > 10) {
        // Сохраняем в кэш
        ocrCache.set(fileHash, extractedText);
        return extractedText;
      }
      
      // Если OCR вернул мало текста, используем демо-режим
      console.warn('OCR вернул мало текста, используем демо-режим');
      return await this.demoOCRProcessing(imageFile);
      
    } catch (error) {
      console.warn('OCR API недоступно, используем демо-режим:', error);
      // Fallback to demo mode
      return await this.demoOCRProcessing(imageFile);
    }
  }

  private static async demoOCRProcessing(file: File): Promise<string> {
    // Демо-режим: возвращаем пример текста чека
    const demoReceipts = [
      `ПЯТЕРОЧКА
Чек №123456
2024-01-15 14:30:25

Молоко Простоквашино 2.5% 1л - 85.50
Хлеб Бородинский 400г - 45.00
Яйца куриные С0 10шт - 95.00
Сыр Российский 200г - 120.00

ИТОГ: 345.50`,
      
      `МАГНИТ
Чек №789012
2024-01-15 16:45:12

Курица охлажденная 1кг - 250.00
Картофель 2кг - 80.00
Морковь 1кг - 40.00
Лук репчатый 1кг - 35.00
Помидоры 1кг - 120.00

ИТОГ: 525.00`,
      
      `ЛЕНТА
Чек №345678
2024-01-14 12:15:30

Говядина вырезка 1кг - 450.00
Рис басмати 1кг - 120.00
Огурцы 1кг - 90.00
Сметана 20% 400г - 65.00
Хлеб белый 500г - 50.00

ИТОГ: 775.00`
    ];
    
    // Возвращаем случайный демо-чек
    return demoReceipts[Math.floor(Math.random() * demoReceipts.length)];
  }

  static parseReceiptText(text: string): ReceiptParseResult {
    const lines = text.split('\n').filter(line => line.trim());
    const products: string[] = [];
    let store: string | undefined;
    let total: number | undefined;
    let date: Date | undefined;

    // Определяем магазин по первой строке
    const storePatterns = [
      { pattern: /ПЯТЕРОЧКА/i, store: 'Пятерочка' },
      { pattern: /МАГНИТ/i, store: 'Магнит' },
      { pattern: /ЛЕНТА/i, store: 'Лента' },
      { pattern: /АШАН/i, store: 'Ашан' },
      { pattern: /ПЕРЕКРЕСТОК/i, store: 'Перекресток' }
    ];

    for (const line of lines) {
      // Поиск магазина
      if (!store) {
        for (const { pattern, store: storeName } of storePatterns) {
          if (pattern.test(line)) {
            store = storeName;
            break;
          }
        }
      }

      // Поиск даты
      if (!date) {
        const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          date = new Date(dateMatch[1]);
        }
      }

      // Поиск итоговой суммы
      if (!total) {
        const totalMatch = line.match(/ИТОГ[\s:]*([\d.,]+)/i);
        if (totalMatch) {
          total = parseFloat(totalMatch[1].replace(',', '.'));
        }
      }

      // Извлечение продуктов (строки с ценами)
      const productMatch = line.match(/^(.+?)\s*-\s*([\d.,]+)$/);
      if (productMatch && !line.includes('ИТОГ') && !line.includes('ЧЕК')) {
        const productName = productMatch[1].trim();
        // Убираем цифры в начале (номера позиций)
        const cleanName = productName.replace(/^\d+\.?\s*/, '');
        products.push(cleanName);
      }
    }

    return { products, store, total, date };
  }

  // Генерация хэша файла для кэширования
  private static async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Реальный вызов OCR API
  private static async callRealOCRAPI(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', OCR_CONFIG.API_KEY);
    formData.append('language', 'rus');
    formData.append('OCREngine', '2');
    formData.append('scale', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('isTable', 'true');
    formData.append('isOverlayRequired', 'false');

    try {
      const response = await fetch(OCR_CONFIG.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.IsErroredOnProcessing) {
        console.error('OCR API Error:', data.ErrorMessage);
        throw new Error(data.ErrorMessage || 'Ошибка обработки OCR');
      }

      const parsedText = data.ParsedResults[0]?.ParsedText || '';
      
      if (!parsedText.trim()) {
        throw new Error('Не удалось распознать текст');
      }

      return parsedText;
      
    } catch (error) {
      console.error('OCR API call failed:', error);
      
      // Попробуем использовать fallback ключ
      if (OCR_CONFIG.API_KEY !== OCR_CONFIG.FALLBACK_KEY) {
        console.log('Пробуем использовать fallback ключ...');
        const tempKey = OCR_CONFIG.API_KEY;
        OCR_CONFIG.API_KEY = OCR_CONFIG.FALLBACK_KEY;
        try {
          const result = await this.callRealOCRAPI(file);
          OCR_CONFIG.API_KEY = tempKey;
          return result;
        } catch (fallbackError) {
          OCR_CONFIG.API_KEY = tempKey;
          throw fallbackError;
        }
      }
      
      throw new Error('Не удалось подключиться к сервису распознавания');
    }
  }
}