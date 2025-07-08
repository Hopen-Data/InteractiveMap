import {useState} from 'react';
import {API_BASE_URL} from '../config/settings';

export default function Login({onLogin}) {
    const [username, setUsername] = useState('havokz');
    const [password, setPassword] = useState('123');
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        let data = {};
        try {
            const res = await fetch(`${API_BASE_URL}/api/token/`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password}),
            });
            if (!res.ok) {
                setError('Erro ao conectar ao servidor');
                return;
            }
            data = await res.json();
        } catch (err) {
            setError('Erro inesperado no servidor');
            return;
        }
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            onLogin();
        } else {
            setError('Usuário ou senha inválidos');
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                margin: 40,
                maxWidth: 320,
                padding: 32,
                borderRadius: 12,
                boxShadow: '0 2px 16px #0002',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}
        >
            <h2 style={{textAlign: 'center', marginBottom: 8}}>Login</h2>
            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Usuário"
                style={{
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    fontSize: 16
                }}
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha"
                style={{
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    fontSize: 16
                }}
            />
            <button
                type="submit"
                style={{
                    padding: 12,
                    borderRadius: 6,
                    border: 'none',
                    background: '#1976d2',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 16,
                    cursor: 'pointer'
                }}
            >
                Entrar
            </button>
            {error && <div style={{color: 'red', textAlign: 'center'}}>{error}</div>}
        </form>
    );
}