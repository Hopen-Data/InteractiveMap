export function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
}