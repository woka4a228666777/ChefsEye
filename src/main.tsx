import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AIVisionService from './services/aiVisionService'

// Инициализация AI сервиса с переменными окружения
AIVisionService.init({
  huggingFaceToken: import.meta.env.VITE_HUGGING_FACE_TOKEN,
  googleVisionKey: import.meta.env.VITE_GOOGLE_VISION_KEY
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)