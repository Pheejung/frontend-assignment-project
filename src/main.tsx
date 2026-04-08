import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { QueryProvider } from './app/providers/QueryProvider'
import './index.css'
import './shared/styles/layout.css'
import './shared/styles/button.css'
import './shared/styles/input.css'
import './shared/styles/chip.css'
import './shared/styles/filter.css'
import './shared/styles/toast.css'
import './shared/styles/table.css'
import './shared/styles/modal.css'
import './shared/styles/top3.css'
import './shared/styles/platform-donut.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
