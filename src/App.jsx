import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from "react";
import Sidebar from './utils/Sidebar';
import InteractiveMap from './components/InteractiveMap';
import { authFetch } from './utils/authFetch';
import { API_BASE_URL } from './config/settings';
import { formatHeatmapPointsPorMunicipio } from './utils/heatmap';
import { getTokenFromUrl } from './utils/getTokenFromUrl';
import Button from 'react-bootstrap/Button';
import { FaBars } from 'react-icons/fa';
import './components/map.css';

export default function App() {
    const [selectedLayers, setSelectedLayers] = useState([]);
    const [municipiosSelecionados, setMunicipiosSelecionados] = useState([]);
    const [layerFeatures, setLayerFeatures] = useState([]);
    const [municipioFeatures, setMunicipioFeatures] = useState([]);
    const [mapBounds, setMapBounds] = useState(null);
    const [choroplethAtivo, setChoroplethAtivo] = useState(false);
    const [heatmapEnabled, setHeatmapEnabled] = useState(false);
    const [heatmapPoints, setHeatmapPoints] = useState([]);
    const formattedPointsPorMunicipio = formatHeatmapPointsPorMunicipio(heatmapPoints);
    const [showSidebar, setShowSidebar] = useState(false);
    const [brasilGeojson, setBrasilGeojson] = useState(null);
    const [isBrasilChecked, setIsBrasilChecked] = useState(false);
    const features = [...layerFeatures, ...municipioFeatures];
    const [loading, setLoading] = useState(false);

    const estiloMalhaBrasil = {
        color: '#007bff',  
        weight: 2,    
        fillOpacity: 0,    
    };

    useEffect(() => {
        const token = getTokenFromUrl();
        if (token) {
            localStorage.setItem('access_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (!selectedLayers.length) {
            setLayerFeatures([]);
            return;
        }
        setLoading(true);
        Promise.all(
            selectedLayers.map(layerId =>
                authFetch(`${API_BASE_URL}/mapas/api/v1/geojson-layer/${layerId}/`)
                    .then(res => res.ok ? res.json() : { features: [] })
                    .then(data => data.features || [])
            )
        ).then(results => {
            setLayerFeatures(results.flat());
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [selectedLayers]);


    const handleSidebarClose = () => setShowSidebar(false);
    const handleSidebarShow = () => setShowSidebar(true);

    function fetchHeatmapForMunicipio(municipioId) {
        authFetch(`${API_BASE_URL}/mapas/api/v1/heatmap/municipalities/${municipioId}/`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data) return;
                if (Array.isArray(data)) {
                    setHeatmapPoints(prev => [...prev, ...data]);
                } else if (data.latitude && data.longitude) {
                    setHeatmapPoints(prev => [...prev, data]);
                } else if (Array.isArray(data.pontos)) {
                    setHeatmapPoints(prev => [...prev, ...data.pontos]);
                }
            });
    }

    function onAddMunicipioGeojson(municipioId) {
        setMunicipiosSelecionados(prev =>
            prev.includes(municipioId) ? prev : [...prev, municipioId]
        );
        authFetch(`${API_BASE_URL}/mapas/api/v1/geojson/municipality/${municipioId}/`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.features && data.features[0]) {
                    setMunicipioFeatures(prev => {
                        const newFeature = data.features[0];
                        if (prev.some(f => f.properties.id === newFeature.properties.id)) {
                            return prev;
                        }
                        return [...prev, newFeature];
                    });
                    const geojson = data.features[0];
                    const layer = L.geoJSON(geojson);
                    const leafletBounds = layer.getBounds();
                    if (leafletBounds.isValid()) {
                        setMapBounds([
                            [leafletBounds.getSouthWest().lat, leafletBounds.getSouthWest().lng],
                            [leafletBounds.getNorthEast().lat, leafletBounds.getNorthEast().lng]
                        ]);
                    }
                    fetchHeatmapForMunicipio(municipioId);
                }
            });
    }

    function onRemoveMunicipioGeojson(municipioId) {
        setMunicipiosSelecionados(prev => prev.filter(id => id !== municipioId));
        setHeatmapPoints(prev => prev.filter(p => p.codigo_ibge !== municipioId));
    }

    function handleAddBrasilGeojson(geom) {
        // 1. Define o estado do checkbox como marcado.
        setIsBrasilChecked(true);

        // 2. Se a malha já foi adicionada, não faz nada para evitar duplicação.
        if (brasilGeojson) return;

        // 3. A API do Brasil retorna apenas a geometria. Para o Leaflet (e para
        //    manter um padrão), montamos um objeto GeoJSON do tipo "Feature" completo.
        const geojsonFeature = {
            type: 'Feature',
            properties: { name: 'Brasil' }, // Propriedades que você pode usar depois
            geometry: geom,
        };

        // 4. Salvamos o objeto completo no estado. Isso fará com que o mapa renderize a malha.
        setBrasilGeojson(geojsonFeature);

        // 5. A lógica para centralizar o mapa é idêntica à dos municípios:
        //    criamos uma camada temporária apenas para calcular os limites.
        const layer = L.geoJSON(geojsonFeature);
        const leafletBounds = layer.getBounds();

        if (leafletBounds.isValid()) {
            // Supondo que você tenha a função setMapBounds no seu App.jsx
            setMapBounds([
                [leafletBounds.getSouthWest().lat, leafletBounds.getSouthWest().lng],
                [leafletBounds.getNorthEast().lat, leafletBounds.getNorthEast().lng]
            ]);
        }
    }

    function handleRemoveBrasilGeojson() {
        setIsBrasilChecked(false);
        setBrasilGeojson(null);
    }

    return (
        <div style={{ display: 'flex' }}>
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
            {!showSidebar && (
                <div
                    className="leaflet-control leaflet-bar"
                    style={{
                        position: 'absolute',
                        left: '24px',
                        top: '130px',
                        zIndex: 1051,
                        margin: 0,
                        padding: 0
                    }}
                >
                    <Button
                        onClick={handleSidebarShow}
                        title="Open Sidebar"
                        style={{
                            background: '#fff',
                            border: 'none',
                            outline: 'none',
                            borderRadius: 0,
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            boxShadow: 'none'
                        }}
                    >
                        <FaBars size={18} color="#000" />
                    </Button>
                </div>
            )}
            <Sidebar
                show={showSidebar}
                onHide={handleSidebarClose}
                selectedLayers={selectedLayers}
                onChange={setSelectedLayers}
                municipiosSelecionados={municipiosSelecionados}
                onAddMunicipioGeojson={onAddMunicipioGeojson}
                onRemoveMunicipioGeojson={onRemoveMunicipioGeojson}
                heatmapEnabled={heatmapEnabled}
                setHeatmapEnabled={setHeatmapEnabled}
                choroplethAtivo={choroplethAtivo}
                setChoroplethAtivo={setChoroplethAtivo}
                onAddBrasilGeojson={handleAddBrasilGeojson}
                onRemoveBrasilGeojson={handleRemoveBrasilGeojson}
                isBrasilChecked={isBrasilChecked}
            />
            <InteractiveMap
                features={features}
                bounds={mapBounds}
                heatmapPointsPorMunicipio={formattedPointsPorMunicipio}
                heatmapEnabled={heatmapEnabled}
                choroplethAtivo={choroplethAtivo}
                municipiosSelecionados={municipiosSelecionados}
                layerId={selectedLayers}
                
                brasilGeojson={brasilGeojson}
                estiloMalhaBrasil={estiloMalhaBrasil}
            />
        </div>
    );
}