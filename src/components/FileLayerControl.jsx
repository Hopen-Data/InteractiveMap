import {useEffect, useRef} from 'react';
import {useMap} from 'react-leaflet';
import * as L from 'leaflet';
import shp from 'shpjs';

const FileLayerControl = () => {
    const map = useMap();
    const geoJsonLayerRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'geojson' || ext === 'json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const geojson = JSON.parse(e.target.result);
                    if (geoJsonLayerRef.current) {
                        map.removeLayer(geoJsonLayerRef.current);
                    }
                    geoJsonLayerRef.current = L.geoJSON(geojson, {
                        style: {color: '#3388ff', weight: 2, opacity: 0.6}
                    }).addTo(map);
                    map.fitBounds(geoJsonLayerRef.current.getBounds());
                } catch (err) {
                    alert('Arquivo GeoJSON inválido!');
                }
            };
            reader.readAsText(file);
        } else if (ext === 'zip') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const geojson = await shp(arrayBuffer);
                if (geoJsonLayerRef.current) {
                    map.removeLayer(geoJsonLayerRef.current);
                }
                geoJsonLayerRef.current = L.geoJSON(geojson, {
                    style: {color: '#3388ff', weight: 2, opacity: 0.6}
                }).addTo(map);
                map.fitBounds(geoJsonLayerRef.current.getBounds());
            } catch (err) {
                alert('Arquivo ZIP/Shapefile inválido!');
            }
        } else {
            alert('Formato não suportado. Use GeoJSON ou ZIP (Shapefile).');
        }
    };

    useEffect(() => {
        return () => {
            if (geoJsonLayerRef.current) {
                map.removeLayer(geoJsonLayerRef.current);
            }
        };
    }, [map]);

    return (
        <div className="leaflet-bottom leaflet-left" style={{zIndex: 500}}>
            <div className="leaflet-control leaflet-bar" style={{marginBottom: 8}}>
                <label htmlFor="geojson-upload" style={{display: 'flex', alignItems: 'center'}}>
                    <button
                        type="button"
                        className="leaflet-bar-part"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'inherit',
                            border: 'none',
                            height: 34,
                            cursor: 'pointer',
                            padding: '0 8px'
                        }}
                        title="Importe um arquivo GeoJSON ou ZIP (Shapefile)"
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                document.getElementById('geojson-upload').click();
                            }
                        }}
                        onClick={() => document.getElementById('geojson-upload').click()}
                    >
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                  d="M12 16a1 1 0 0 1-1-1V5.83l-3.59 3.58A1 1 0 1 1 6 8.17l5-5a1 1 0 0 1 1.41 0l5 5a1 1 0 1 1-1.41 1.41L13 5.83V15a1 1 0 0 1-1 1Zm-7 4a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5Z"/>
                        </svg>
                        <span style={{fontSize: 13, color: '#222'}}>Importar GeoJSON ou ZIP</span>
                    </button>
                    <input
                        id="geojson-upload"
                        type="file"
                        accept=".geojson,application/geo+json,.zip,application/zip"
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                </label>
            </div>
        </div>
    );
};

export default FileLayerControl;