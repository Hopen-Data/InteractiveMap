import React from 'react';
import 'leaflet/dist/leaflet.css';
import './map.css';

function formatLabel(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function renderValue(value) {
    if (value === null || value === 'None' || value === '') return 'N/A';
    if (typeof value === 'object' && !Array.isArray(value)) {
        return (
            <ul style={{listStyle: 'none', paddingLeft: 12}}>
                {Object.entries(value).map(([k, v]) => (
                    <li key={k}>
                        <small>
                            <strong>{formatLabel(k)}:</strong>{' '}
                            {renderValue(v)}
                        </small>
                    </li>
                ))}
            </ul>
        );
    }
    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : 'N/A';
    }
    return value;
}

function GenericPopup({properties = {}, attributes = {}, geometry = {}}) {
    const ignoreKeys = ['geometry', 'attributes', 'Attributes'];
    const main = {...properties};
    delete main.attributes;
    delete main.Attributes;

    const extras = {
        ...(properties.attributes || properties.Attributes || {}),
        ...attributes
    };

    let lat = null, lng = null;
    if (geometry && geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
        [lng, lat] = geometry.coordinates;
    }

    return (
        <div style={{maxWidth: 250}}>
            <strong>{main.nome || main.entity_name || 'Sem nome'}</strong>
            <hr className="my-1"/>
            {lat !== null && lng !== null && (
                <div style={{marginBottom: 8}}>
                    <small>
                        <strong>Coordenadas:</strong><br/>
                        Lat: {lat}<br/>
                        Lng: {lng}
                    </small>
                </div>
            )}
            <ul style={{listStyle: 'none', paddingLeft: 0, marginBottom: 0}}>
                {Object.entries(main)
                    .filter(([key]) => !ignoreKeys.includes(key))
                    .map(([key, value]) => (
                        <li key={key}>
                            <small>
                                <strong>{formatLabel(key)}:</strong>{' '}
                                {renderValue(value)}
                            </small>
                        </li>
                    ))}
                {Object.keys(extras).length > 0 && (
                    <li>
                        <small>
                            <strong>Propriedades:</strong>
                            {renderValue(extras)}
                        </small>
                    </li>
                )}
            </ul>
        </div>
    );
}

export default GenericPopup;