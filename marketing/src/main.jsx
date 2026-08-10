import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SiteContactProvider } from './context/SiteContactContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteContactProvider>
      <App />
    </SiteContactProvider>
  </StrictMode>,
)
