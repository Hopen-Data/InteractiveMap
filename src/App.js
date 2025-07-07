import L from 'leaflet';

import React, {useEffect, useState} from "react";
import Sidebar from './Sidebar';
import InteractiveMap from './components/InteractiveMap';
import {authFetch} from './utils/authFetch';
import {API_BASE_URL} from './config';
import Login from './components/Authentication';


export default function App() {
    const [selectedLayers, setSelectedLayers] = useState([]);
    const [municipiosSelecionados, setMunicipiosSelecionados] = useState([]);
    const [layerFeatures, setLayerFeatures] = useState([]);
    const [municipioFeatures, setMunicipioFeatures] = useState([]);
    const [mapBounds, setMapBounds] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

    // Atualiza autenticação ao mudar o token
    useEffect(() => {
        const onStorage = () => setIsAuthenticated(!!localStorage.getItem('access_token'));
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Busca features das camadas selecionadas
    useEffect(() => {
        if (!selectedLayers.length) {
            setLayerFeatures([]);
            return;
        }
        setLoading(true);
        Promise.all(
            selectedLayers.map(layerId =>
                authFetch(`${API_BASE_URL}/mapas/api/geojson-layer/${layerId}/`)
                    .then(res => res.ok ? res.json() : {features: []})
                    .then(data => data.features || [])
            )
        ).then(results => {
            setLayerFeatures(results.flat());
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [selectedLayers]);

    function onAddMunicipioGeojson(municipioId) {
        setMunicipiosSelecionados(prev =>
            prev.includes(municipioId) ? prev : [...prev, municipioId]
        );
        authFetch(`${API_BASE_URL}/mapas/api/geojson/municipio/${municipioId}/`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.features && data.features[0]) {
                    setMunicipioFeatures(prev => [...prev, ...data.features]);
                    const geojson = data.features[0];
                    const layer = L.geoJSON(geojson);
                    const leafletBounds = layer.getBounds();
                    if (leafletBounds.isValid()) {
                        setMapBounds([
                            [leafletBounds.getSouthWest().lat, leafletBounds.getSouthWest().lng],
                            [leafletBounds.getNorthEast().lat, leafletBounds.getNorthEast().lng]
                        ]);
                    }
                }
            });
    }

    function onRemoveMunicipioGeojson(municipioId) {
        setMunicipiosSelecionados(prev => prev.filter(id => id !== municipioId));
    }

    const features = [...layerFeatures, ...municipioFeatures];

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)}/>;
    }

    return (
        <div style={{display: 'flex'}}>
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255, 193, 7, 0.95)',
                    padding: '16px 32px',
                    borderRadius: 8,
                    zIndex: 3000,
                    fontWeight: 600,
                    fontSize: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    Carregando camada...
                </div>
            )}
            <aside className="sidebar">
                <Sidebar
                    selectedLayers={selectedLayers}
                    onChange={setSelectedLayers}
                    municipiosSelecionados={municipiosSelecionados}
                    onAddMunicipioGeojson={onAddMunicipioGeojson}
                    onRemoveMunicipioGeojson={onRemoveMunicipioGeojson}
                />
            </aside>
            <InteractiveMap features={features} bounds={mapBounds}/>
        </div>
    );
}