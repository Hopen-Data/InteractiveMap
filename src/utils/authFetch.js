import {API_BASE_URL} from '../config/settings';


/**
 * Função para fazer requisições autenticadas com o token de acesso
 */
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('access_token');
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    let res = await fetch(url, {...options, headers});

    if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
            const newToken = localStorage.getItem('access_token');
            headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(url, {...options, headers});
        }
    }
    return res;
}

/** * Função para atualizar o token de acesso usando o refresh token
 * Retorna true se o token foi atualizado, false caso contrário
 */
async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    const res = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh}),
    });
    const data = await res.json();
    if (data.access) {
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
        }
        return true;
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
}