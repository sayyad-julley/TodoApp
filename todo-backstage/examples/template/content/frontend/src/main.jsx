import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'antd/dist/reset.css'
import './index.css'
import xrayContext from './utils/xray.js'

// Initialize X-Ray tracing for frontend
// This will set up trace context generation and propagation
if (xrayContext.enabled) {
  console.log('✅ X-Ray tracing enabled for frontend');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
