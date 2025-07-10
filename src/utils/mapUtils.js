// Paleta de cores e faixas de população
const colors = [
    '#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c',
    '#fc4e2a', '#e31a1c', '#bd0026', '#800026'
];
const thresholds = [0, 10000, 50000, 100000, 250000, 500000, 1000000, 2000000, 12000000];

/**
 * Retorna uma cor baseada no valor da população.
 * @param {number} pop - A população.
 * @returns {string} A cor correspondente.
 */
export function getColorByPopulation(pop) {
    // Itera do maior para o menor para encontrar a faixa correta
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (pop > thresholds[i]) {
            // Garante que o índice não exceda o tamanho do array de cores
            return colors[Math.min(i + 1, colors.length - 1)];
        }
    }
    return colors[0]; // Cor para a faixa mais baixa (0)
}

/**
 * Retorna o objeto de estilo para uma feature GeoJSON do município.
 * @param {object} feature - A feature GeoJSON.
 * @param {boolean} choroplethAtivo - Se a camada de coroplético está ativa.
 * @returns {object} O objeto de estilo para Leaflet.
 */
export function getChoroplethStyle(feature, choroplethAtivo) {
    // Se o coroplético estiver desativado, retorna um estilo padrão e neutro.
    if (!choroplethAtivo) {
        return {
            fillColor: '#FFFFFF',
            weight: 1,
            color: '#666',
            fillOpacity: 0.2
        };
    }

    // Acessa a população da feature com segurança
    const props = feature?.properties ?? {};
    const pop = props.population?.valor ?? 0;

    // Retorna o estilo do coroplético com a cor baseada na população.
    return {
        fillColor: getColorByPopulation(pop),
        weight: 1,
        color: '#666',
        fillOpacity: 0.7
    };
}

// Exporta as constantes para serem usadas na legenda
export { colors, thresholds };