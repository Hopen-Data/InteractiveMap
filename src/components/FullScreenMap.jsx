import {useEffect, useRef} from 'react';
import {useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet.fullscreen';

function FullscreenControl() {
    const map = useMap();
    const controlRef = useRef(null);

    useEffect(() => {
        if (map && !controlRef.current) {
            controlRef.current = L.control.fullscreen({position: 'topleft'}).addTo(map);
        }
        return () => {
            if (map && controlRef.current) {
                map.removeControl(controlRef.current);
                controlRef.current = null;
            }
        };
    }, [map]);
    return null;
}

export default FullscreenControl;