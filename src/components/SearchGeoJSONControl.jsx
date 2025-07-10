import {useState} from "react";
import {authFetch} from '../utils/authFetch';
import {API_BASE_URL} from '../config/settings';

function SearchGeoJSONControl({layerId, onData}) {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!search.trim() || !layerId || typeof layerId !== "string" || !layerId.length) {
            setError("Selecione uma camada para pesquisar.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const resp = await authFetch(
                `${API_BASE_URL}/mapas/api/search-geojson-layer/${layerId}/?q=${encodeURIComponent(search)}`
            );
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
            console.error(e);
            setError("Erro ao buscar dados.");
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
                top: 165,
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
                    if (e.key === "Enter" && layerId) {
                        handleSearch();
                    }
                }}
                disabled={loading || !layerId}
            />
            <button
                onClick={handleSearch}
                disabled={loading || !search.trim() || !layerId}
            >
                {loading ? "Buscando..." : "Buscar"}
            </button>
            {search && !loading && layerId && (
                <button onClick={handleClear} aria-label="Limpar busca">Limpar</button>
            )}
            {error && <div style={{color: "red"}}>{error}</div>}
        </div>
    );
}

export default SearchGeoJSONControl;