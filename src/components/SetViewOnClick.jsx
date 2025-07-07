import {useMapEvent} from 'react-leaflet';

export default function SetViewOnClick({animateRef}) {
    useMapEvent('click', (e) => {
        const map = e.target;
        map.setView(e.latlng, map.getZoom(), {
            animate: animateRef.current || false,
        });
    });

    return null;
}