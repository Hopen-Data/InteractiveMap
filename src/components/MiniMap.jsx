import {MapContainer, Rectangle, TileLayer, useMap, useMapEvent} from 'react-leaflet';
import {useCallback, useMemo, useState} from 'react';

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
};

const BOUNDS_STYLE = {weight: 1};

function MinimapBounds({parentMap, zoom}) {
    const minimap = useMap();

    const onClick = useCallback(
        (e) => {
            parentMap.setView(e.latlng, parentMap.getZoom());
        },
        [parentMap]
    );
    useMapEvent('click', onClick);

    const [bounds, setBounds] = useState(parentMap.getBounds());
    const onChange = useCallback(() => {
        setBounds(parentMap.getBounds());
        minimap.setView(parentMap.getCenter(), zoom);
    }, [minimap, parentMap, zoom]);

    // Atualiza o minimapa quando o mapa principal muda
    useMapEvent('move', onChange);
    useMapEvent('zoom', onChange);

    return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE}/>;
}

export default function MiniMapControl({position = 'topright', zoom = 0}) {
    const parentMap = useMap();

    const minimap = useMemo(
        () => (
            <MapContainer
                style={{height: 80, width: 80}}
                center={parentMap.getCenter()}
                zoom={zoom}
                dragging={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                attributionControl={false}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <MinimapBounds parentMap={parentMap} zoom={zoom}/>
            </MapContainer>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const positionClass = POSITION_CLASSES[position] || POSITION_CLASSES.topright;
    return (
        <div className={positionClass}>
            <div className="leaflet-control leaflet-bar">{minimap}</div>
        </div>
    );
}