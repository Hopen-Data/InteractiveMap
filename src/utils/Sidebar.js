import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/settings';
import { authFetch } from './authFetch';
import '../app.css';
import SidebarContent from './SidebarContent';
import Offcanvas from 'react-bootstrap/Offcanvas';

export default function Sidebar({
    selectedLayers = [],
    onChange = () => { },
    show,
    onHide,
    onAddMunicipioGeojson,
    onRemoveMunicipioGeojson,
    municipiosSelecionados = [],
    heatmapEnabled,
    setHeatmapEnabled,
    choroplethAtivo,
    setChoroplethAtivo,
    onAddBrasilGeojson,
    onRemoveBrasilGeojson,
    isBrasilChecked,
    onAddRegionGeojson,
    onRemoveRegionGeojson,
    checkedRegions,
    setLoading,
    onAddStateGeojson,
    onRemoveStateGeojson,
    checkedStates,
}) {
    // Estados para armazenar dados das camadas e UFs
    const [layers, setLayers] = useState([]);
    const [activeUfKey, setActiveUfKey] = useState(null);

    //  ESTADOS PARA CONTROLAR A LÓGICA DOS PAINÉIS ---
    const [view, setView] = useState('estados'); // 'estados' ou 'municipios'
    const [ufSelecionada, setUfSelecionada] = useState(null);
    const [municipios, setMunicipios] = useState([]);
    const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(false);
    const [filtroMunicipio, setFiltroMunicipio] = useState('');

    useEffect(() => {
        Promise.all([
            authFetch(`${API_BASE_URL}/mapas/api/v1/layers/`).then(res => res.json()),
        ])
            .then(([layersData]) => {
                setLayers(Array.isArray(layersData) ? layersData : layersData.results || []);
            })
            .catch(error => {
                setLayers([]);
            });
    }, []);

    const handleUfClick = (uf) => {
        setUfSelecionada(uf);
        setView('municipios');
        setIsLoadingMunicipios(true);

        // Fetch dos municípios para a UF clicada
        authFetch(`${API_BASE_URL}/mapas/api/v1/state/municipalities/${uf.sigla}/`)
            .then(res => res.json())
            .then(data => {
                setMunicipios(Array.isArray(data) ? data : data.results || []);
            })
            .catch(error => console.error("Erro ao buscar municípios", error))
            .finally(() => setIsLoadingMunicipios(false));
    };

    const handleVoltar = () => {
        setView('estados');
        setUfSelecionada(null);
        setMunicipios([]);
        setFiltroMunicipio('');
    };

    function handleMunicipioToggle(municipioId) {
        if (municipiosSelecionados.includes(municipioId)) {
            if (onRemoveMunicipioGeojson) onRemoveMunicipioGeojson(municipioId);
        } else {
            if (onAddMunicipioGeojson) onAddMunicipioGeojson(municipioId);
        }
    }

    function handleSelectAllMunicipios(municipios) {
        const municipioIds = municipios.map(m => m.id);
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

    function handleLayerChange(layerId) {
        const newSelected = selectedLayers.includes(layerId)
            ? selectedLayers.filter(l => l !== layerId)
            : [...selectedLayers, layerId];
        onChange(newSelected);
    }

    const handleBrasilToggle = (isChecked) => {
        if (isChecked) {
            setLoading(true);
            authFetch(`${API_BASE_URL}/mapas/api/v1/countries/`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0 && data[0].geom) {
                        console.log(data[0].geom);
                        onAddBrasilGeojson(data[0].geom);
                    }
                })
                .catch(() => setLoading(false));
        } else {
            onRemoveBrasilGeojson();
        }
    };

    const handleRegionToggle = (regiao, isChecked) => {
        const regionName = regiao.nome;

        if (isChecked) {
            setLoading(true);
            authFetch(`${API_BASE_URL}/mapas/api/v1/regions/?name=${regionName}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0 && data[0].geom) {
                        onAddRegionGeojson(regionName, data[0].geom);
                    }
                })
                .catch(() => setLoading(false));
        } else {
            onRemoveRegionGeojson(regionName);
        }
    };

    const handleStateToggle = (uf, isChecked) => {
        if (isChecked) {
            setLoading(true);
            authFetch(`${API_BASE_URL}/mapas/api/v1/states/${uf.id}/`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.geom) {
                        onAddStateGeojson(uf, data.geom);
                    }
                })
                .catch(() => setLoading(false));
        } else {
            onRemoveStateGeojson(uf);
        }
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="start" className="sidebar-offcanvas" >
            <Offcanvas.Header closeButton>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <SidebarContent
                    heatmapEnabled={heatmapEnabled}
                    setHeatmapEnabled={setHeatmapEnabled}
                    choroplethAtivo={choroplethAtivo}
                    setChoroplethAtivo={setChoroplethAtivo}
                    layers={layers}
                    selectedLayers={selectedLayers}
                    onLayerChange={handleLayerChange}
                    activeUfKey={activeUfKey}
                    setActiveUfKey={setActiveUfKey}
                    handleSelectAllMunicipios={handleSelectAllMunicipios}
                    municipiosSelecionados={municipiosSelecionados}
                    handleMunicipioToggle={handleMunicipioToggle}
                    ufSelecionada={ufSelecionada}
                    municipios={municipios}
                    isLoadingMunicipios={isLoadingMunicipios}
                    onVoltar={handleVoltar}
                    view={view}
                    onUfClick={handleUfClick}
                    filtroMunicipio={filtroMunicipio}
                    setFiltroMunicipio={setFiltroMunicipio}
                    onBrasilToggle={handleBrasilToggle}
                    isBrasilChecked={isBrasilChecked}
                    onRegionToggle={handleRegionToggle}
                    checkedRegions={checkedRegions}
                    onStateToggle={handleStateToggle}
                    checkedStates={checkedStates}
                />
            </Offcanvas.Body>
        </Offcanvas>

    );
}