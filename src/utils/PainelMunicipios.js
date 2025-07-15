import React from 'react';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function PainelMunicipios({
    ufSelecionada,
    municipios,
    isLoading,
    onVoltar,
    filtro,
    onFiltroChange,
    municipiosSelecionados,
    onMunicipioToggle,
    onSelectAll,
}) {

    const municipiosFiltrados = municipios.filter(m =>
        (m.name || '').toLowerCase().includes(filtro.toLowerCase())
    );
    const todosVisiveisSelecionados = municipiosFiltrados.length > 0 && municipiosFiltrados.every(m => municipiosSelecionados.includes(m.id));

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">{ufSelecionada.nome}</h5>
                <Button variant="secondary" size="sm" onClick={onVoltar}>
                    &larr; Voltar
                </Button>
            </div>

            <Form.Control
                type="text"
                placeholder="Filtrar município..."
                className="mb-3"
                value={filtro}
                onChange={(e) => onFiltroChange(e.target.value)}
            />

            <Button
                variant="outline-secondary"
                size="sm"
                className="mb-2 w-100"
                onClick={() => onSelectAll(municipiosFiltrados, todosVisiveisSelecionados)}
            >
                {todosVisiveisSelecionados ? 'Desmarcar Todos' : 'Marcar Todos'}
            </Button>

            {isLoading ? (
                <div className="text-center py-3">
                    <Spinner animation="border" />
                </div>
            ) : (
                <ListGroup variant="flush" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {municipiosFiltrados.map(m => (
                        <ListGroup.Item key={m.id} className="border-0 px-1">
                            <Form.Check
                                type="checkbox"
                                id={`municipio-${m.id}`}
                                label={m.name}
                                checked={municipiosSelecionados.includes(m.id)}
                                onChange={() => onMunicipioToggle(m.id)}
                            />
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
}