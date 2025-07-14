import {useState} from "react";
import {authFetch} from '../utils/authFetch';
import {API_BASE_URL} from '../config/settings';
import './map.css';

function SearchGeoJSONControl({layerId, onData}) {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const realLayerId = Array.isArray(layerId) ? layerId[0] : layerId;
    const isLayerIdValid = () =>
        (typeof realLayerId === "string" && realLayerId.trim() !== "") ||
        (typeof realLayerId === "number" && !Number.isNaN(realLayerId) && realLayerId > 0);

    const handleSearch = async () => {
        if (!search.trim() || !isLayerIdValid()) {
            setError("Selecione uma camada para pesquisar.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}/mapas/api/search-geojson-layer/${encodeURIComponent(realLayerId)}/?q=${encodeURIComponent(search)}`;
            const resp = await authFetch(url);
            if (!resp.ok) {
                throw new Error(`Erro HTTP: ${resp.status}`);
            }
            const data = await resp.json();
            if (!data || (Array.isArray(data.features) && data.features.length === 0)) {
                setError("Nenhum ponto encontrado para a busca.");
                onData([]);
            } else {
                onData(data);
            }
        } catch (e) {
            if (e.message && e.message.includes("404")) {
                setError("Nenhum ponto encontrado para a busca.");
            } else {
                setError("Erro ao buscar dados.");
            }
        }
        setLoading(false);
    };

    const handleClear = () => {
        setSearch("");
        onData([]);
        setError(null);
    };

    return (
        <div
            className="leaflet-control leaflet-bar"
            style={{
                background: "#fff",
                padding: 8,
                position: "absolute",
                top: 180,
                left: 10,
                zIndex: 1000
            }}
        >
            <input
                type="text"
                placeholder="Buscar..."
                aria-label="Buscar camada"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" && isLayerIdValid()) {
                        handleSearch();
                    }
                }}
                disabled={loading || !isLayerIdValid()}
            />
            <button
                onClick={handleSearch}
                disabled={loading || !search.trim() || !isLayerIdValid()}
            >
                {loading ? "Buscando..." : "Buscar"}
            </button>
            {search && !loading && isLayerIdValid() && (
                <button onClick={handleClear} aria-label="Limpar busca">Limpar</button>
            )}
            {error && <div style={{color: "red"}}>{error}</div>}
        </div>
    );
}

export default SearchGeoJSONControl;