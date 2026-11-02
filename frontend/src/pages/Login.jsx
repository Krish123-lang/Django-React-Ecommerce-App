import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveToken } from '../utils/auth';

function Login() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || '';
    const [form, setForm] = useState({ username: '', password: '' });
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const csrfResponse = await fetch(`${BASE_URL}/api/csrf/`, {
                credentials: 'include',
            });
            const csrfData = await csrfResponse.json();
            if (!csrfResponse.ok || !csrfData.csrfToken) {
                throw new Error('Could not initialize a secure login request. Refresh the page and try again.');
            }
            const response = await fetch(`${BASE_URL}/api/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfData.csrfToken,
                },
                body: JSON.stringify(form),
                credentials: 'include',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || data.detail || `Login failed (HTTP ${response.status})`);
            }
            saveToken(data);
            setMsg('Login successful! Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        }
        catch (error) {
            console.error('Login error: ', error);
            setMsg(`Error: ${error.message}`);
        }
    }

    return (
        <main className="min-h-[calc(100vh-5rem)] bg-stone-50 px-4 py-12 text-stone-900 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-md">
                <div className="mb-8 border-b border-stone-200 pb-6">
                    <p className="mb-2 text-xs font-semibold uppercase text-emerald-800">Welcome back</p>
                    <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Sign in</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-5">
                    <label htmlFor="login-username" className="grid gap-2 text-sm font-medium text-stone-800">
                        Username
                        <input id="login-username" type="text" name="username" autoComplete="username" value={form.username} onChange={handleChange} required className="min-h-12 w-full border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" />
                    </label>
                    <label htmlFor="login-password" className="grid gap-2 text-sm font-medium text-stone-800">
                        Password
                        <input id="login-password" type="password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} required className="min-h-12 w-full border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" />
                    </label>
                    <button type="submit" className="min-h-12 bg-emerald-900 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800">
                        Login
                    </button>
                </form>
                {msg && <p role={msg.startsWith('Error:') ? 'alert' : 'status'} className={`mt-5 border px-4 py-3 text-sm ${msg.startsWith('Error:') ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>{msg}</p>}
                <p className="mt-6 text-sm text-stone-600">
                    Don't have an account? <Link to="/signup" className="font-semibold text-emerald-900 underline decoration-stone-300 underline-offset-4 hover:decoration-emerald-900">Sign up</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;