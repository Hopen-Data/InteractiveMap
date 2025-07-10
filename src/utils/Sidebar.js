import React, {useEffect, useState} from 'react';
import {API_BASE_URL} from '../config/settings';
import {authFetch} from './authFetch';
import '../app.css';

export default function Sidebar({
    selectedLayers = [],
    onChange = () => {},
    onAddMunicipioGeojson,
    onRemoveMunicipioGeojson,
    municipiosSelecionados = [],
    heatmapEnabled,
    setHeatmapEnabled
    }) {
    // Estados para armazenar dados das camadas e UFs
    const [layers, setLayers] = useState([]);
    const [ufs, setUfs] = useState([]);
    const [ufsExpandidas, setUfsExpandidas] = useState([]);

    useEffect(() => {
        Promise.all([
            authFetch(`${API_BASE_URL}/mapas/api/layers/`).then(res => res.json()),
            authFetch(`${API_BASE_URL}/mapas/api/ufs-municipios/`).then(res => res.json())
        ])
            .then(([layersData, ufsData]) => {
                setLayers(Array.isArray(layersData) ? layersData : layersData.results || []);
                setUfs(Array.isArray(ufsData) ? ufsData : ufsData.results || []);
            })
            .catch(error => {
                setLayers([]);
                setUfs([]);
            });
    }, []);

    function handleMunicipioToggle(municipioId) {
        if (municipiosSelecionados.includes(municipioId)) {
            if (onRemoveMunicipioGeojson) onRemoveMunicipioGeojson(municipioId);
        } else {
            if (onAddMunicipioGeojson) onAddMunicipioGeojson(municipioId);
        }
    }

    function handleSelectAllMunicipios(uf) {
        const municipioIds = uf.municipios.map(m => m.id);
        const todosSelecionados = municipioIds.every(id => municipiosSelecionados.includes(id));
        if (todosSelecionados) {
            municipioIds.forEach(id => {
                if (onRemoveMunicipioGeojson) onRemoveMunicipioGeojson(id);
            });
        } else {
            municipioIds.forEach(id => {
                if (!municipiosSelecionados.includes(id) && onAddMunicipioGeojson) {
                    onAddMunicipioGeojson(id);
                }
            });
        }
    }

    function handleUfToggle(uf) {
        setUfsExpandidas(prev =>
            prev.includes(uf)
                ? prev.filter(u => u !== uf)
                : [...prev, uf]
        );
        // Se desmarcar o estado, desmarque todos os municípios desse estado
        if (ufsExpandidas.includes(uf)) {
            const ufObj = ufs.find(u => u.sigla === uf);
            if (ufObj) {
                ufObj.municipios.forEach(m => {
                    if (municipiosSelecionados.includes(m.id) && onRemoveMunicipioGeojson) {
                        onRemoveMunicipioGeojson(m.id);
                    }
                });
            }
        }
    }

    function handleToggleHeatmap() {
        setHeatmapEnabled(prev => !prev);
    }

    return (
        <aside
            style={{width: 400, background: '#f5f5f5', padding: 16, overflowY: 'auto', maxHeight: '100vh'}}>
            <h3>Visão Espacial</h3>
            <label>
                <input
                    type="checkbox"
                    checked={heatmapEnabled}
                    onChange={handleToggleHeatmap}
                />
                Habilitar mapa de calor
            </label>
            <hr/>

            <h3>Camadas</h3>
            <ul style={{listStyle: 'none', padding: 0}}>
                {layers.map((layer) => (
                    <li key={layer.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedLayers.includes(layer.id)}
                                onChange={() => {
                                    const newSelected = selectedLayers.includes(layer.id)
                                        ? selectedLayers.filter(l => l !== layer.id)
                                        : [...selectedLayers, layer.id];
                                    onChange(newSelected);
                                }}
                            />
                            {layer.name}
                        </label>
                    </li>
                ))}
            </ul>
            <hr/>
            <h3>Estados</h3>
            <ul style={{listStyle: 'none', padding: 0}}>
                {ufs.map(uf => (
                    <li key={uf.sigla}>
                        <label>
                            <input
                                type="checkbox"
                                checked={ufsExpandidas.includes(uf.sigla)}
                                onChange={() => handleUfToggle(uf.sigla)}
                            />
                            {uf.nome}
                            <button
                                type="button"
                                style={{marginLeft: 8, fontSize: 12}}
                                onClick={() => handleSelectAllMunicipios(uf)}
                            >
                                Selecionar todos
                            </button>
                        </label>
                        {ufsExpandidas.includes(uf.sigla) && (
                            <>
                                <h4 style={{margin: '8px 0 4px 24px', fontSize: 14}}>
                                    Municípios de {uf.nome}
                                </h4>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: '0 0 0 24px',
                                    maxHeight: 200,
                                    overflowY: 'auto'
                                }}>
                                    {uf.municipios.map(m => (
                                        <li key={m.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={municipiosSelecionados.includes(m.id)}
                                                    onChange={() => handleMunicipioToggle(m.id)}
                                                />
                                                {m.nome}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}