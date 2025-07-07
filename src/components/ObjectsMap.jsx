import {useEffect, useState} from 'react';
import {authFetch} from '../utils/authFetch';
import {API_BASE_URL} from '../config';

export default function ObjectsMap({selectedLayers, setSelectedLayers}) {
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        authFetch(`${API_BASE_URL}/mapas/api/layers/`)
            .then(res => res.json())
            .then(data => {
                setLayers(Array.isArray(data) ? data : data.results || []);
                setLoading(false);
            })
            .catch(() => {
                setLayers([]);
                setLoading(false);
            });
    }, []);

    function handleLayerChange(e, layerId) {
        if (e.target.checked) {
            setSelectedLayers(prev => [...prev, layerId]);
        } else {
            setSelectedLayers(prev => prev.filter(id => id !== layerId));
        }
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="objects-map-panel" style={{background: '#fff', padding: 12, borderRadius: 8, maxWidth: 300}}>
            <h4>Camadas</h4>
            {layers.map(layer => (
                <label key={layer.id} style={{display: 'block', marginBottom: 4}}>
                    <input
                        type="checkbox"
                        checked={selectedLayers.includes(layer.id)}
                        onChange={e => handleLayerChange(e, layer.id)}
                    />
                    {layer.name}
                </label>
            ))}
        </div>
    );
}