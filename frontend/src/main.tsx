import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installGlobalHandlers, log } from './lib/logger'

installGlobalHandlers();
log('session', 'app', 'Application boot');

createRoot(document.getElementById("root")!).render(<App />);
