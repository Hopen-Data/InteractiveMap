import {useMap} from 'react-leaflet';
import {useEffect, useRef} from 'react';
import {FaGlobeAmericas} from 'react-icons/fa';

const ResetViewButton = ({initialCenter, initialZoom}) => {
    const map = useMap();
    const controlRef = useRef(null);

    useEffect(() => {
        let controlsContainer = document.querySelector('.leaflet-top .leaflet-right');
        // Garante que o container exista
        if (!controlsContainer) {
            const leafletTop = document.querySelector('.leaflet-top');
            controlsContainer = document.createElement('div');
            controlsContainer.className = 'leaflet-right';
            leafletTop.appendChild(controlsContainer);
        }

        const moveButton = () => {
            const fullscreenBtn = controlsContainer?.querySelector('.leaflet-control-fullscreen, .leaflet-control-fullscreen-button');
            if (controlsContainer && controlRef.current) {

                // Adiciona espaçamento ao botão
                controlRef.current.style.marginTop = '12px';
                controlRef.current.style.marginRight = '4px';
                if (fullscreenBtn && fullscreenBtn.nextSibling !== controlRef.current) {
                    controlsContainer.insertBefore(controlRef.current, fullscreenBtn.nextSibling);
                } else if (!fullscreenBtn && !controlsContainer.contains(controlRef.current)) {
                    controlsContainer.appendChild(controlRef.current);
                }
            }
        };

        moveButton();
        const observer = new MutationObserver(moveButton);
        if (controlsContainer) {
            observer.observe(controlsContainer, {childList: true});
        }

        return () => {
            observer.disconnect();
            if (controlsContainer && controlRef.current && controlsContainer.contains(controlRef.current)) {
                controlsContainer.removeChild(controlRef.current);
            }
        };
    }, []);

    const handleReset = () => {
        map.setView(initialCenter, initialZoom);
    };

    return (
        <div
            ref={controlRef}
            className="leaflet-control leaflet-bar"
            style={{marginTop: 0}}
        >
            <button
                onClick={handleReset}
                title="Initial framing"
                style={{
                    width: 30,
                    height: 30,
                    background: '#fff',
                    border: 'none',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                <FaGlobeAmericas size={18} color="#000"/>
            </button>
        </div>
    );
};

export default ResetViewButton;