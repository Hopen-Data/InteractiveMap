import React, {useMemo} from 'react';
import {Marker, Polygon, Polyline, Popup} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import GenericPopup from './GenericPopup';

// Points
function PointLayer({features}) {
    const jitter = value => value + (Math.random() - 0.5) * 0.0001;
    return (
        <MarkerClusterGroup maxClusterRadius={40} disableClusteringAtZoom={16} spiderfyOnMaxZoom chunkedLoading>
            {features.map((feature, idx) => {
                const [lng, lat] = feature.geometry.coordinates;
                const pos = {lat: jitter(lat), lng: jitter(lng)};
                return (
                    <Marker key={feature.id || idx} position={pos} draggable={false}>
                        <Popup>
                            <GenericPopup properties={{...(feature.properties || {}), ...(feature.attributes || {})}}/>
                        </Popup>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
    );
}

// LineStrings
function LineStringLayer({features}) {
    return features.map((feature, idx) => (
        <Polyline
            key={feature.id || idx}
            positions={feature.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
            color="blue"
        >
            <Popup>
                <GenericPopup properties={{...(feature.properties || {}), ...(feature.attributes || {})}}/>
            </Popup>
        </Polyline>
    ));
}

// Polygons
function PolygonLayer({features}) {
    return features.map((feature, idx) => (
        <Polygon
            key={feature.id || idx}
            positions={feature.geometry.coordinates.map(ring => ring.map(([lng, lat]) => [lat, lng]))}
            color="green"
        >
            <Popup>
                <GenericPopup properties={{...(feature.properties || {}), ...(feature.attributes || {})}}/>
            </Popup>
        </Polygon>
    ));
}


// Main component
export default function MarkerMap({features = []}) {
    const featuresByType = useMemo(() => {
        const byType = {};
        features.forEach(f => {
            const geometry = typeof f.geometry === 'string' ? JSON.parse(f.geometry) : f.geometry;
            const type = geometry?.type;
            if (!byType[type]) byType[type] = [];
            byType[type].push({...f, geometry});
        });
        return byType;
    }, [features]);

    return (
        <>
            {featuresByType.Point && <PointLayer features={featuresByType.Point}/>}
            {featuresByType.LineString && <LineStringLayer features={featuresByType.LineString}/>}
            {featuresByType.MultiLineString && (
                <LineStringLayer
                    features={featuresByType.MultiLineString.flatMap(f =>
                        f.geometry.coordinates.map(coords => ({
                            ...f,
                            geometry: {type: 'LineString', coordinates: coords}
                        }))
                    )}
                />
            )}
            {featuresByType.Polygon && <PolygonLayer features={featuresByType.Polygon}/>}
            {featuresByType.MultiPolygon && (
                <PolygonLayer
                    features={featuresByType.MultiPolygon.flatMap(f =>
                        f.geometry.coordinates.map(coords => ({
                            ...f,
                            geometry: {type: 'Polygon', coordinates: coords}
                        }))
                    )}
                />
            )}
        </>
    );
}