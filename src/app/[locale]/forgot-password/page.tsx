'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setMsg({ text: data.message, type: 'success' });
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
                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Recuperar Acceso</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Ingresa tu correo para enviarte un enlace de recuperación.
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

                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Correo Electrónico</label>
                        <input required type="email" className="input-glass"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', padding: '16px' }}>
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link href="/login" style={{ color: 'var(--text-secondary)' }}>Volver al inicio de sesión</Link>
                </p>
            </div>
        </main>
    );
}
