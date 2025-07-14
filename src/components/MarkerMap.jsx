import React, {useMemo} from 'react';
import {Marker, Popup} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import GenericPopup from './GenericPopup';

export default function MarkerMap({features = []}) {
    console.log(features);
    const jitter = value => value + (Math.random() - 0.5) * 0.0001;

    const pontos = useMemo(() =>
            features
                .map(f => ({
                    ...f,
                    geometry: typeof f.geometry === 'string' ? JSON.parse(f.geometry) : f.geometry,
                }))
                .filter(
                    feature =>
                        feature?.geometry?.type === 'Point' &&
                        Array.isArray(feature.geometry.coordinates) &&
                        feature.geometry.coordinates.length === 2 &&
                        typeof feature.geometry.coordinates[0] === 'number' &&
                        typeof feature.geometry.coordinates[1] === 'number'
                )
        , [features]);

    const positions = useMemo(() =>
            pontos.map(f => ({
                lat: jitter(f.geometry.coordinates[1]),
                lng: jitter(f.geometry.coordinates[0]),
            }))
        , [pontos]);

    if (pontos.length === 0) return null;

    return (
        <MarkerClusterGroup
            maxClusterRadius={40}
            disableClusteringAtZoom={16}
            spiderfyOnMaxZoom={true}
            chunkedLoading={true}
        >
            {pontos.map((feature, idx) => {
                const pos = positions[idx];
                if (!pos) return null;
                const {attributes, properties, ...rest} = feature;
                return (
                    <Marker
                        key={feature.id || idx}
                        position={pos}
                        draggable={false}
                    >
                        <Popup>
                            <GenericPopup properties={{...(feature.properties || {}), ...(feature.attributes || {})}} />
                        </Popup>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
    );
}