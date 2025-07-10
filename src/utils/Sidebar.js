import React, {useEffect, useState} from 'react';
import {API_BASE_URL} from '../config/settings';
import {authFetch} from './authFetch';
import '../app.css';

// Importando componentes do react-bootstrap
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Sidebar({
                                    selectedLayers = [],
                                    onChange = () => {
                                    },
                                    onAddMunicipioGeojson,
                                    onRemoveMunicipioGeojson,
                                    municipiosSelecionados = [],
                                    heatmapEnabled,
                                    setHeatmapEnabled,
                                    choroplethAtivo,
                                    setChoroplethAtivo,
                                }) {
    // Estados para armazenar dados das camadas e UFs
    const [layers, setLayers] = useState([]);
    const [ufs, setUfs] = useState([]);
    const [ufsExpandidas, setUfsExpandidas] = useState([]);
    const [activeUfKey, setActiveUfKey] = useState(null);

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

    function handleTogglechoropleth() {
        setChoroplethAtivo(prev => !prev);
    }

    return (
        <aside className="bg-light p-5" style={{ width: 380, height: '100vh', overflowY: 'auto' }}>
            <Container fluid>
                <h4 className="mb-3">Visão Espacial</h4>
                <Form.Group>
                    <Form.Check
                        type="switch"
                        id="heatmap-switch"
                        label="Habilitar mapa de calor"
                        checked={heatmapEnabled}
                        onChange={() => setHeatmapEnabled(prev => !prev)}
                    />
                    <Form.Check
                        type="switch"
                        id="choropleth-switch"
                        label="Habilitar mapa coroplético"
                        checked={choroplethAtivo}
                        onChange={() => setChoroplethAtivo(prev => !prev)}
                    />
                </Form.Group>
                
                <hr />

                <h4 className="mb-3">Camadas de Pontos</h4>
                <ListGroup>
                    {layers.map((layer) => (
                        <ListGroup.Item key={layer.id} className="border-0 bg-light">
                            <Form.Check
                                type="checkbox"
                                id={`layer-${layer.id}`}
                                label={layer.name}
                                checked={selectedLayers.includes(layer.id)}
                                onChange={() => {
                                    const newSelected = selectedLayers.includes(layer.id)
                                        ? selectedLayers.filter(l => l !== layer.id)
                                        : [...selectedLayers, layer.id];
                                    onChange(newSelected);
                                }}
                            />
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <hr />

                <h4 className="mb-3">Malhas Municipais</h4>
                <Accordion activeKey={activeUfKey} onSelect={(key) => setActiveUfKey(key)}>
                    {ufs.map((uf, index) => (
                        <Accordion.Item eventKey={String(index)} key={uf.sigla}>
                            <Accordion.Header>
                                <Container fluid className="p-0">
                                    <Row className="align-items-center">
                                        <Col>{uf.nome}</Col>
                                        <Col xs="auto">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={(e) => handleSelectAllMunicipios(e, uf)}
                                            >
                                                Todos
                                            </Button>
                                        </Col>
                                    </Row>
                                </Container>
                            </Accordion.Header>
                            <Accordion.Body style={{ maxHeight: 250, overflowY: 'auto' }}>
                                <ListGroup variant="flush">
                                    {uf.municipios.map(m => (
                                        <ListGroup.Item key={m.id} className="border-0">
                                            <Form.Check
                                                type="checkbox"
                                                id={`municipio-${m.id}`}
                                                label={m.nome}
                                                checked={municipiosSelecionados.includes(m.id)}
                                                onChange={() => handleMunicipioToggle(m.id)}
                                            />
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Container>
        </aside>
    );
}