import {FeatureGroup, GeoJSON, MapContainer, TileLayer, useMap} from 'react-leaflet';
import {EditControl} from 'react-leaflet-draw';
import {useEffect} from 'react';
import MarkerMap from './MarkerMap';
import MiniMapControl from './MiniMap';
import FileLayerControl from './FileLayerControl';
import ShowCoordsOnClick from './ShowCoordsOnClick';
import ResetViewButton from './ResetViewButton';

import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './map.css';

export default function InteractiveMap({features, bounds}) {
    const position = [-14.235004, -51.92528];
    const featuresNaoPonto = (features || []).filter(f => f?.geometry && f.geometry.type !== 'Point');

    return (<div className="app-container">
        <MapContainer
            center={position}
            zoom={5}
            minZoom={3}
            maxZoom={18}
            scrollWheelZoom={true}
            style={{height: '100vh', width: '100%'}}
            className="map-leaflet"
            preferCanvas={true}
            attributionControl={false}
            fullscreenControl={true}
            fullscreenControlOptions={{
                position: 'topleft', title: 'Full screen', titleCancel: 'Out of the full screen'
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {featuresNaoPonto.length > 0 && featuresNaoPonto.map((feature, idx) => (<GeoJSON
                key={idx}
                data={feature}
                style={{
                    color: '#1976d2', weight: 1, opacity: 0.8, fillColor: '#90caf9', fillOpacity: 0.2
                }}
            />))}
            <MarkerMap features={features}/>
            <FileLayerControl/>
            <ResetViewButton initialCenter={position} initialZoom={5}/>
            <ShowCoordsOnClick/>
            <FeatureGroup>
                <EditControl
                    position="topright"
                    draw={{
                        rectangle: true,
                        polyline: true,
                        polygon: true,
                        circle: false,
                        marker: true,
                        circlemarker: false,
                    }}
                    onCreated={e => {
                    }}
                />
            </FeatureGroup>
            <MiniMapControl position="bottomright" zoom={0}/>
            {bounds && Array.isArray(bounds) && bounds.length === 2 && (<ZoomToBounds bounds={bounds}/>)}
        </MapContainer>
    </div>)
        ;
}

function ZoomToBounds({bounds}) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    }, [bounds, map]);
    return null;
}