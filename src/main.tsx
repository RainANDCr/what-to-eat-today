import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FoodStoreProvider } from './store/FoodStoreProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FoodStoreProvider>
      <App />
    </FoodStoreProvider>
  </StrictMode>,
)
