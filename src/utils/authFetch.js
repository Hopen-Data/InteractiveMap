export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('access_token');
    let headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
    };
    let res = await fetch(url, {...options, headers});

    if (res.status === 401) {
        // Tenta renovar só uma vez
        const refreshed = await refreshToken();
        if (refreshed) {
            const newToken = localStorage.getItem('access_token');
            headers = {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
            };
            res = await fetch(url, {...options, headers});
            // Se ainda der 401, não tenta de novo
            if (res.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
            }
        } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.reload();
        }
    }
    return res;
}

async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    const res = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh}),
    });
    const data = await res.json();
    if (data.access) {
        localStorage.setItem('access_token', data.access);
        return true;
    }
    return false;
}