import { createRoot } from 'react-dom/client'
import App from './App'
import './fonts/fonts.css'
import './styles/app.css'
import { registerSw } from './registerSw'

registerSw()

createRoot(document.getElementById('root')!).render(<App />)
