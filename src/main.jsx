import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { DashboardFilterProvider } from './context/DashboardFilterContext'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DashboardFilterProvider>
      <App />
    </DashboardFilterProvider>
  </React.StrictMode>,
)
