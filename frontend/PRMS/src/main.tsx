import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


import "../node_modules/bootstrap/dist/css/bootstrap.min.css"

//import "./assets/styles/global.scss"
import { Provider } from 'react-redux'
import store from './store/store.ts'
import { ToastProvider } from './context/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />

      </ToastProvider>
    </Provider>
  </StrictMode>,
)
