import './css/index.css';
import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root.tsx';
import { ThemeProvider } from 'next-themes';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Root />
        </ThemeProvider>
    </React.StrictMode>,
);
