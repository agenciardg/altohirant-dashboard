import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { DashboardFilterProvider } from './context/DashboardFilterContext'
import { AuthProvider } from './lib/useAuth.jsx'
import { AuthGate } from './components/AuthGate.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <DashboardFilterProvider>
          <App />
        </DashboardFilterProvider>
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>,
)
