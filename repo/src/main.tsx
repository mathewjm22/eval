import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("EduTrack: main.tsx is executing");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("EduTrack: Root element not found!");
} else {
  console.log("EduTrack: Root element found, rendering...");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
