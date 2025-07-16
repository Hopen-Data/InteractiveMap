import React from 'react';

import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import PainelEstados from './PainelEstados';
import PainelMunicipios from './PainelMunicipios';

export default function SidebarContent(
    {
        // Props para os switches
        heatmapEnabled,
        setHeatmapEnabled,
        choroplethAtivo,
        setChoroplethAtivo,

        // Props para as camadas de pontos
        layers,
        selectedLayers,
        onLayerChange,

        //Props paras as malhas
        view,
        onUfClick,
        ufSelecionada,
        municipios,
        isLoadingMunicipios,
        onVoltar,
        filtroMunicipio,
        setFiltroMunicipio,
        municipiosSelecionados,
        handleMunicipioToggle,
        handleSelectAllMunicipios,
        onBrasilToggle,
        isBrasilChecked,
        onRegionToggle,
        checkedRegions,
        onStateToggle,
        checkedStates
    }
) {
    return (
        <Container fluid className="sidebar-compact">
            <h4 className="mb-3">Visão Espacial</h4>
            <Form.Group>
                <Form.Check type="switch" id="heatmap-switch" label="Habilitar mapa de calor" checked={heatmapEnabled}
                    onChange={() => setHeatmapEnabled(p => !p)} />
                <Form.Check type="switch" id="choropleth-switch" label="Habilitar mapa coroplético"
                    checked={choroplethAtivo} onChange={() => setChoroplethAtivo(p => !p)} />
            </Form.Group>
            <hr />
            <h4 className="mb-3">Camadas de Pontos</h4>
            <ListGroup>
                {(layers || []).map((layer, idx) => (
                    <ListGroup.Item key={layer.id ?? `layer-idx-${idx}`} className="border-0 bg-light">
                        <Form.Check
                            type="checkbox"
                            id={`layer-${layer.id ?? idx}`}
                            label={layer.name ?? `Layer ${idx + 1}`}
                            checked={layer.id ? selectedLayers.includes(layer.id) : false}
                            onChange={() => {
                                if (layer.id !== undefined && layer.id !== null) {
                                    onLayerChange(layer.id);
                                }
                            }}
                        />
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <hr />
            {view === 'estados' ? (
                <PainelEstados
                    onBrasilToggle={onBrasilToggle}
                    onUfClick={onUfClick}
                    isBrasilChecked={isBrasilChecked}
                    onRegionToggle={onRegionToggle}
                    checkedRegions={checkedRegions}
                    onStateToggle={onStateToggle}
                    checkedStates={checkedStates}
                />
            ) : (
                <PainelMunicipios
                    ufSelecionada={ufSelecionada}
                    municipios={municipios}
                    isLoading={isLoadingMunicipios}
                    onVoltar={onVoltar}
                    filtro={filtroMunicipio}
                    onFiltroChange={setFiltroMunicipio}
                    municipiosSelecionados={municipiosSelecionados}
                    onMunicipioToggle={handleMunicipioToggle}
                    onSelectAll={handleSelectAllMunicipios}
                />
            )}
        </Container>
    );
}