import {useState} from "react";
import {authFetch} from '../utils/authFetch';
import {API_BASE_URL} from '../config/settings';
import {BsSearch, BsX} from "react-icons/bs";
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
                background: "rgba(255,255,255,0.92)",
                padding: 6,
                position: "absolute",
                top: 180,
                left: 10,
                zIndex: 1000,
                borderRadius: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                border: "1px solid #e0e0e0",
                minWidth: 130
            }}
        >
            <div style={{position: "relative", display: "inline-block", width: 120}}>
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
                    style={{
                        height: 22,
                        fontSize: 12,
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        padding: "0 24px 0 8px",
                        outline: "none",
                        width: "100%",
                        background: "#fafbfc"
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !search.trim() || !isLayerIdValid()}
                    aria-label="Buscar"
                    style={{
                        position: "absolute",
                        right: 2,
                        top: 2,
                        height: 18,
                        width: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer"
                    }}
                    tabIndex={-1}
                >
                    {loading ? (
                        <span style={{fontSize: 10}}>...</span>
                    ) : (
                        <BsSearch size={12} color="#555"/>
                    )}
                </button>
                {search && !loading && isLayerIdValid() && (
                    <button
                        onClick={handleClear}
                        aria-label="Limpar busca"
                        style={{
                            position: "absolute",
                            right: 22,
                            top: 2,
                            height: 18,
                            width: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer"
                        }}
                        tabIndex={-1}
                    >
                        <BsX size={13} color="#888"/>
                    </button>
                )}
            </div>
            {error && <div style={{color: "red", fontSize: 11, marginTop: 4}}>{error}</div>}
        </div>
    );
}

export default SearchGeoJSONControl;