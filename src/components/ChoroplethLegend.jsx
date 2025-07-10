import { useEffect } from 'react';
import L from 'leaflet';
import { getColorByPopulation, thresholds } from '../utils/mapUtils'; // Importa as funções e constantes

function ChoroplethLegend({ map }) {
    useEffect(() => {
        if (!map) return;

        // Cria o controle da legenda do Leaflet
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend choropleth-legend');
            div.innerHTML += '<h4>População</h4>';

            // Gera as faixas da legenda dinamicamente
            for (let i = 0; i < thresholds.length; i++) {
                const from = thresholds[i];
                const to = thresholds[i + 1];
                const color = getColorByPopulation(from + 1);

                const label = to ? `${from.toLocaleString()} &ndash; ${to.toLocaleString()}` : `${from.toLocaleString()}+`;

                div.innerHTML +=
                    `<i style="background:${color}; width:18px; height:18px; display:inline-block; margin-right:5px;"></i> ${label}<br>`;
            }
            return div;
        };

        legend.addTo(map);

        // Função de limpeza: remove a legenda quando o componente é desmontado
        return () => {
            legend.remove();
        };
    }, [map]); // O efeito depende do objeto 'map'

    // Este componente não renderiza nada no DOM do React, ele apenas manipula o mapa.
    return null;
}

export default ChoroplethLegend;