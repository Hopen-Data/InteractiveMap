import {useState} from "react";

function SearchGeoJSONControl({layerId, onData}) {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!search.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`/mapas/api/search-geojson-layer/${layerId}/?q=${encodeURIComponent(search)}`);
            const data = await resp.json();
            onData(data);
        } catch (e) {
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
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                disabled={loading}
            />
            <button onClick={handleSearch} disabled={loading || !search.trim()}>
                {loading ? "Buscando..." : "Buscar"}
            </button>
            {search && !loading && (
                <button onClick={handleClear} aria-label="Limpar busca">Limpar</button>
            )}
            {error && <div style={{color: "red"}}>{error}</div>}
        </div>
    );
}

export default SearchGeoJSONControl;