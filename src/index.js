import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';

// Corrige o caminho dos ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Elemento com id "root" não encontrado no HTML.');
}

const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <App/>
    </StrictMode>
);