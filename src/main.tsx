import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { QueryProvider } from './app/providers/QueryProvider'
import './index.css'
import './styles/components/layout.css'
import './styles/components/filter.css'
import './styles/components/table.css'
import './styles/components/top3.css'
import './styles/components/button-overrides.css'
import './styles/components/platform-donut.css'
import './styles/components/modal.css'
import './styles/components/select.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
