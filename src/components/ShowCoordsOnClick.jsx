import {useMap} from 'react-leaflet';
import {useEffect, useRef} from 'react';
import L from 'leaflet';

const ShowCoordsOnClick = () => {
    const map = useMap();
    const popupRef = useRef(L.popup({autoPan: false, offset: [0, 0]}));

    useEffect(() => {
        const onClick = (e) => {
            const {lat, lng} = e.latlng;
            popupRef.current
                .setLatLng(e.latlng)
                .setContent(
                    `<div style="font-size:13px">
                        <b>Coordenadas</b><br/>
                        Lat: ${lat.toFixed(6)}<br/>
                        Lng: ${lng.toFixed(6)}
                    </div>`
                )
                .openOn(map);
        };
        map.on('click', onClick);
        return () => {
            map.off('click', onClick);
            map.closePopup(popupRef.current);
        };
    }, [map]);

    return null;
};

export default ShowCoordsOnClick;