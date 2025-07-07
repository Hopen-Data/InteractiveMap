import React, {useEffect, useState} from 'react';
import {Marker, Popup} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import PopupGenerico from './PopupGenerico';

export default function MarkerMap({features = []}) {
    const pontos = Array.isArray(features) ? features.filter(
        feature =>
            feature?.geometry?.type === 'Point' &&
            Array.isArray(feature.geometry.coordinates) &&
            feature.geometry.coordinates.length === 2 &&
            typeof feature.geometry.coordinates[0] === 'number' &&
            typeof feature.geometry.coordinates[1] === 'number'
    ) : [];

    // Adicione essa função antes do componente
    const jitter = value => value + (Math.random() - 0.5) * 0.0001;

    // Dentro do componente, troque onde monta positions:
    const [positions, setPositions] = useState(
        pontos.map(f => ({
            lat: jitter(f.geometry.coordinates[1]),
            lng: jitter(f.geometry.coordinates[0]),
        }))
    );
    const [draggables, setDraggables] = useState(
        pontos.map(() => false)
    );

    useEffect(() => {
        setPositions(
            pontos.map(f => ({
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
            }))
        );
        setDraggables(pontos.map(() => false));
    }, [features]);

    if (pontos.length === 0) return null;

    const handleDragEnd = idx => e => {
        const latlng = e.target.getLatLng();
        if (latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number') {
            setPositions(prev => {
                const newPositions = [...prev];
                newPositions[idx] = latlng;
                return newPositions;
            });
        }
    };

    const toggleDraggable = idx => {
        setDraggables(ds => {
            const newDs = [...ds];
            newDs[idx] = !newDs[idx];
            return newDs;
        });
    };

    return (
        <MarkerClusterGroup
            maxClusterRadius={40}
            disableClusteringAtZoom={16}
            spiderfyOnMaxZoom={true}
            chunkedLoading={true}
        >
            >
            {pontos.map((feature, idx) => {
                const pos = positions[idx];
                if (!pos || typeof pos.lat !== 'number' || typeof pos.lng !== 'number') {
                    return null;
                }
                return (
                    <Marker
                        key={idx}
                        draggable={draggables[idx]}
                        eventHandlers={{
                            dragend: handleDragEnd(idx),
                        }}
                        position={pos}
                    >
                        <Popup>
                            <PopupGenerico properties={feature.properties}/>
                        </Popup>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
    );
}