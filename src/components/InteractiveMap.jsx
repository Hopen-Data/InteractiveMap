import {useEffect, useState} from 'react';

import {FeatureGroup, GeoJSON, MapContainer, TileLayer, useMap} from 'react-leaflet';
import MarkerMap from './MarkerMap';
import MiniMapControl from './MiniMap';
import FileLayerControl from './FileLayerControl';
import ShowCoordsOnClick from './ShowCoordsOnClick';
import ResetViewButton from './ResetViewButton';
import SearchGeoJSONControl from './SearchGeoJSONControl';
import {EditControl} from 'react-leaflet-draw';
import {HeatmapLayer} from "react-leaflet-heatmap-layer-v3";
import ChoroplethLegend from './ChoroplethLegend';
import { getChoroplethStyle } from '../utils/mapUtils';

import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './map.css';

// Ele usa o hook 'useMap' para acessar a instância do mapa e passá-la para a legenda.
function LegendControl({ choroplethAtivo }) {
    const map = useMap();
    return choroplethAtivo ? <ChoroplethLegend map={map} /> : null;
}

export default function InteractiveMap(
    {
        features,
        bounds,
        heatmapPointsPorMunicipio,
        heatmapEnabled,
        municipiosSelecionados = [],
        choroplethAtivo,
        layerId
    }
) {
    const position = [-14.235004, -51.92528];
    const featuresNaoPonto = (features || [])
        .filter(f => {
            const geometry = typeof f.geometry === 'string' ? JSON.parse(f.geometry) : f.geometry;
            return geometry && geometry.type !== 'Point';
        })
        .filter(f => f.properties && municipiosSelecionados.includes(f.properties.id));
    const allPoints = heatmapPointsPorMunicipio.flatMap(mun => mun.points);
    const maxIntensity = Math.max(...allPoints.map(p => p.intensity || 0)) || 1;
    const [leafletMap, setLeafletMap] = useState(null);
    const [pendingFlyTo, setPendingFlyTo] = useState(null);

    function transformIntensity(intensity) {
        // Aplica log para suavizar e normaliza
        return Math.pow(intensity, 0.25) / Math.pow(maxIntensity, 0.25);
    }

    function handleData(data) {
        const featuresArray = Array.isArray(data) ? data : data.features;
        if (featuresArray && featuresArray.length > 0) {
            const marker = featuresArray.find(f => {
                const geometry = typeof f.geometry === 'string' ? JSON.parse(f.geometry) : f.geometry;
                return geometry && geometry.type === 'Point';
            });
            if (marker) {
                const geometry = typeof marker.geometry === 'string' ? JSON.parse(marker.geometry) : marker.geometry;
                const [lng, lat] = geometry.coordinates;
                setPendingFlyTo([lat, lng]);
            }
        }
    }

    useEffect(() => {
        if (leafletMap && pendingFlyTo) {
            leafletMap.setView(pendingFlyTo, 12);
            setPendingFlyTo(null);
        }
    }, [leafletMap, pendingFlyTo]);

    return (
        <div className="app-container">
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
            fullscreenControl={false}
            fullscreenControlOptions={{
                position: 'topleft', title: 'Full screen', titleCancel: 'Out of the full screen'
            }}
            whenReady={({target}) => setLeafletMap(target)}
        >
            {heatmapEnabled && heatmapPointsPorMunicipio && heatmapPointsPorMunicipio.length > 0 && (heatmapPointsPorMunicipio.map(mun => (
                <HeatmapLayer
                    key={mun.codigo_ibge}
                    points={mun.points.map(p => ({
                        ...p, intensity: transformIntensity((p.intensity || 0) / maxIntensity)
                    }))}
                    longitudeExtractor={m => m.lng}
                    latitudeExtractor={m => m.lat}
                    intensityExtractor={m => m.intensity}
                    max={0.5}
                    radius={14}
                    minOpacity={0.2}
                />)))}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            {/* // Aplica o Popup apenas para os municípios selecionados */}
            {featuresNaoPonto.length > 0 && featuresNaoPonto.map((feature, idx) => (<GeoJSON
                key={feature.properties.id}
                data={feature}
                style={(feature) => getChoroplethStyle(feature, choroplethAtivo)}
                onEachFeature={(feature, layer) => {
                    if (feature.properties) {
                        const nome = feature.properties.name || '';
                        const pib = feature.properties.pib?.valor ? `R\$ ${feature.properties.pib.valor.toLocaleString('pt-BR')}` : 'N/A';
                        const pop = feature.properties.population?.valor ? `${feature.properties.population.valor.toLocaleString('pt-BR')}`: 'N/A';
                        const anoPop = feature.properties.population?.ano || '';
                        const anoPib = feature.properties.pib?.ano || '';
                        layer.bindPopup(
                            `<div>
                                <strong>Município:</strong> ${nome}<br/>
                                <strong>População:</strong> ${pop} ${anoPop ? `(${anoPop})` : ''} <br>
                                <strong>PIB:</strong> ${pib} ${anoPib ? `(${anoPib})` : ''}
                            </div>`
                        );
                    }
                }}
            />))}
            <SearchGeoJSONControl layerId={layerId} onData={handleData} />
            <MarkerMap features={features}/>
            <FileLayerControl/>
            <ResetViewButton initialCenter={position} initialZoom={5} />
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
            <MiniMapControl position="bottomright" zoom={0} />
            {bounds && Array.isArray(bounds) && bounds.length === 2 && !pendingFlyTo && (
                <ZoomToBounds bounds={bounds} />)}
            <LegendControl choroplethAtivo={choroplethAtivo} />
        </MapContainer>
    </div>);
}

function ZoomToBounds({bounds}) {
    const map = useMap();
    useEffect(() => {
        if (bounds && Array.isArray(bounds) && bounds.length === 2) {
            map.fitBounds(bounds, {maxZoom: 14});
        }
    }, [bounds, map]);
    return null;
}