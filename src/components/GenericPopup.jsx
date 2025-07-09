import React from 'react';
import 'leaflet/dist/leaflet.css';
import './map.css';

function GenericPopup({properties}) {
    const ignoreKeys = ['geometry'];

    function renderValue(value) {
        if (value === null || value === 'None' || value === '') return 'N/A';
        if (typeof value === 'object') {
            return (
                <ul style={{listStyle: 'none', paddingLeft: 12}}>
                    {Object.entries(value).map(([k, v]) => (
                        <li key={k}>
                            <small>
                                <strong>{k.charAt(0).toUpperCase() + k.slice(1)}:</strong>{' '}
                                {typeof v === 'object' ? JSON.stringify(v) : v || 'N/A'}
                            </small>
                        </li>
                    ))}
                </ul>
            );
        }
        return value;
    }

    const entries = Object.entries(properties).filter(
        ([key]) => !ignoreKeys.includes(key)
    );

    return (
        <div style={{maxWidth: 250}}>
            <strong>{properties.nome || properties.entity_name || 'Sem nome'}</strong>
            <hr className="my-1"/>
            <strong className="mt-2 d-block">Atributos:</strong>
            <ul style={{listStyle: 'none', paddingLeft: 0, marginBottom: 0}}>
                {entries.map(([key, value]) => (
                    <li key={key}>
                        <small>
                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                            {renderValue(value)}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GenericPopup;