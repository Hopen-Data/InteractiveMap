import React from 'react';
import 'leaflet/dist/leaflet.css';
import './map.css';

function PopupGenerico({properties}) {
    return (
        <div style={{maxWidth: 250}}>
            <strong>{properties.entity_name || 'Sem nome'}</strong>
            <hr className="my-1"/>
            <small>
                <strong>Camada:</strong> {properties.layer_name || 'N/A'}
            </small>
            <br/>
            <small>
                <strong>Início:</strong> {properties.start_date || 'N/A'}
            </small>
            <br/>
            {properties.end_date && (
                <small>
                    <strong>Fim:</strong> {properties.end_date}
                </small>
            )}
            <br/>
            <strong className="mt-2 d-block">Atributos:</strong>
            <ul style={{listStyle: 'none', paddingLeft: 0, marginBottom: 0}}>
                {properties.attributes && Object.keys(properties.attributes).length > 0 ? (
                    Object.entries(properties.attributes).map(([key, value]) =>
                        value !== null && value !== 'None' && value !== '' ? (
                            <li key={key}>
                                <small>
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                </small>
                            </li>
                        ) : null
                    )
                ) : (
                    <li>
                        <small>Nenhum atributo disponível.</small>
                    </li>
                )}
            </ul>
        </div>
    );
}

export default PopupGenerico;