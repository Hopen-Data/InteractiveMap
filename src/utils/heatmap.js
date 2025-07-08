export function formatHeatmapPointsPorMunicipio(rawPoints) {
    const pointsArray = Array.isArray(rawPoints) ? rawPoints : (rawPoints ? [rawPoints] : []);
    if (pointsArray.length === 0) return [];

    // Aplica log para suavizar as diferenças
    const pibs = pointsArray.map(p => Math.log1p(p.pib));
    const maxPIB = Math.max(...pibs);
    const minPIB = Math.min(...pibs);
    const municipios = [...new Set(pointsArray.map(p => p.codigo_ibge))];
    return municipios.map(mun => {
        const pontosMun = pointsArray.filter(p => p.codigo_ibge === mun);
        return {
            codigo_ibge: mun,
            points: pontosMun.map(p => {
                const logPIB = Math.log1p(p.pib);
                return {
                    lat: p.latitude,
                    lng: p.longitude,
                    intensity: (logPIB - minPIB) / (maxPIB - minPIB || 1)
                };
            })
        };
    });
}
