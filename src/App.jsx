import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from "react";
import Sidebar from './utils/Sidebar';
import InteractiveMap from './components/InteractiveMap';
import {authFetch} from './utils/authFetch';
import {API_BASE_URL} from './config/settings';
import {formatHeatmapPointsPorMunicipio} from './utils/heatmap';
import {getTokenFromUrl} from './utils/getTokenFromUrl';

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

    const [loading, setLoading] = useState(false);

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
                authFetch(`${API_BASE_URL}/mapas/api/geojson-layer/${layerId}/`)
                    .then(res => res.ok ? res.json() : {features: []})
                    .then(data => data.features || [])
            )
        ).then(results => {
            setLayerFeatures(results.flat());
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [selectedLayers]);

    function fetchHeatmapForMunicipio(municipioId) {
        authFetch(`${API_BASE_URL}/mapas/api/heatmap/municipios/${municipioId}/`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data) return;
                // Se vier um array direto
                if (Array.isArray(data)) {
                    setHeatmapPoints(prev => [...prev, ...data]);
                }
                // Se vier um objeto único
                else if (data.latitude && data.longitude) {
                    setHeatmapPoints(prev => [...prev, data]);
                }
                // Se vier no formato { pontos: [...] }
                else if (Array.isArray(data.pontos)) {
                    setHeatmapPoints(prev => [...prev, ...data.pontos]);
                }
            });
    }

    function onAddMunicipioGeojson(municipioId) {
        setMunicipiosSelecionados(prev =>
            prev.includes(municipioId) ? prev : [...prev, municipioId]
        );
        authFetch(`${API_BASE_URL}/mapas/api/geojson/municipio/${municipioId}/`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.features && data.features[0]) {
                    setMunicipioFeatures(prev => {
                        const newFeature = data.features[0];
                        // Evita adicionar features duplicados pelo id
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
        // Remove pontos do heatmap do município removido
        setHeatmapPoints(prev => prev.filter(p => p.codigo_ibge !== municipioId));
    }

    const features = [...layerFeatures, ...municipioFeatures];

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
                    heatmapEnabled={heatmapEnabled}
                    setHeatmapEnabled={setHeatmapEnabled}
                    choroplethAtivo={choroplethAtivo}
                    setChoroplethAtivo={setChoroplethAtivo}
                />
            </aside>
            <InteractiveMap
                features={features}
                bounds={mapBounds}
                heatmapPointsPorMunicipio={formattedPointsPorMunicipio}
                heatmapEnabled={heatmapEnabled}
                choroplethAtivo={choroplethAtivo}
                municipiosSelecionados={municipiosSelecionados}
                layerId={selectedLayers}
            />
        </div>
    );
}