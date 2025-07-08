import {FeatureGroup, GeoJSON, MapContainer, TileLayer, useMap} from 'react-leaflet';
import {EditControl} from 'react-leaflet-draw';
import {useEffect} from 'react';
import MarkerMap from './MarkerMap';
import MiniMapControl from './MiniMap';
import FileLayerControl from './FileLayerControl';
import ShowCoordsOnClick from './ShowCoordsOnClick';
import ResetViewButton from './ResetViewButton';
import {HeatmapLayer} from "react-leaflet-heatmap-layer-v3";

import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './map.css';

export default function InteractiveMap({
                                           features,
                                           bounds,
                                           heatmapPointsPorMunicipio,
                                           heatmapEnabled,
                                           municipiosSelecionados = []
                                       }) {
    const position = [-14.235004, -51.92528];
    const featuresNaoPonto = (features || [])
        .filter(f => f?.geometry && f.geometry.type !== 'Point')
        .filter(f => municipiosSelecionados.includes(f.properties.id));

    const allPoints = heatmapPointsPorMunicipio.flatMap(mun => mun.points);
    const maxIntensity = Math.max(...allPoints.map(p => p.intensity || 0)) || 1;

    function transformIntensity(intensity) {
        // Aplica log para suavizar e normaliza
        return Math.pow(intensity, 0.25) / Math.pow(maxIntensity, 0.25);
    }

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
                fullscreenControl={true}
                fullscreenControlOptions={{
                    position: 'topleft',
                    title: 'Full screen',
                    titleCancel: 'Out of the full screen'
                }}
            >
                {heatmapEnabled && heatmapPointsPorMunicipio && heatmapPointsPorMunicipio.length > 0 && (
                    heatmapPointsPorMunicipio.map(mun => (
                        <HeatmapLayer
                            key={mun.codigo_ibge}
                            points={mun.points.map(p => ({
                                ...p,
                                intensity: transformIntensity((p.intensity || 0) / maxIntensity)
                            }))}
                            longitudeExtractor={m => m.lng}
                            latitudeExtractor={m => m.lat}
                            intensityExtractor={m => m.intensity}
                            max={0.5}
                            radius={14}
                            minOpacity={0.2}
                        />
                    ))
                )}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                // Aplica o Popup apenas para os municípios selecionados
                {featuresNaoPonto.length > 0 && featuresNaoPonto.map((feature, idx) => (
                    <GeoJSON
                        key={feature.properties.id}
                        data={feature}
                        style={{
                            color: '#1976d2', weight: 1, opacity: 0.8, fillColor: '#90caf9', fillOpacity: 0.2
                        }}
                        onEachFeature={(feature, layer) => {
                            if (feature.properties) {
                                const nome = feature.properties.name || '';
                                const pib = feature.properties.pib?.valor
                                    ? `R\$ ${feature.properties.pib.valor.toLocaleString('pt-BR')}`
                                    : 'N/A';
                                const anoPib = feature.properties.pib?.ano || '';
                                layer.bindPopup(
                                    `<div>
                                        <strong>Município:</strong> ${nome}<br/>
                                        <strong>PIB:</strong> ${pib} ${anoPib ? `(${anoPib})` : ''}
                                    </div>`
                                );
                            }
                        }}
                    />
                ))}

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
        </div>
    );
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