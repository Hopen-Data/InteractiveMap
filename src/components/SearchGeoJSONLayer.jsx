import React, {useState} from "react";
import {authFetch} from "../utils/authFetch";

function SearchGeoJSONLayer({layerId, onData}) {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        const resp = await authFetch(`/mapas/api/search-geojson-layer/${layerId}/?q=${encodeURIComponent(search)}`);
        const data = await resp.json();
        onData(data);
        setLoading(false);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
            </button>
        </div>
    );
}

export default SearchGeoJSONLayer;