'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMsg({ text: 'Bienvenido de nuevo...', type: 'success' });
                if (data.user.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                setMsg({ text: data.error, type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Error de conexión.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ padding: '60px 20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel animate-in" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <img src="/panoptes_logo.png" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Iniciar Sesión</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Accede a tu cuenta de Panoptes
                </p>

                {msg.text && (
                    <div style={{
                        padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.9rem',
                        backgroundColor: msg.type === 'error' ? 'rgba(255, 60, 60, 0.2)' : 'rgba(51, 204, 102, 0.2)',
                        border: `1px solid ${msg.type === 'error' ? '#ff3c3c' : '#33cc66'}`
                    }}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Correo Electrónico</label>
                        <input required type="email" className="input-glass"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem' }}>Contraseña</label>
                            <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-main)', textDecoration: 'underline' }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <input required type="password" className="input-glass"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', padding: '16px' }}>
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
                        <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>O CONTINÚA CON</span>
                        <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
                    </span>

                    <a href="/api/auth/google" style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
                        width: '100%', padding: '14px', background: 'white', color: '#333', 
                        borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '20px',
                        transition: 'opacity 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                        Ingresar con Google
                    </a>

                    ¿No tienes cuenta? <Link href="/register" style={{ color: 'var(--accent-main)', fontWeight: 'bold' }}>Únete ahora</Link>
                </p>
            </div>
        </main>
    );
}
