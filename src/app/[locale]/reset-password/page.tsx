'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            setMsg({ text: 'Token inválido o no proporcionado.', type: 'error' });
            return;
        }

        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setMsg({ text: data.message, type: 'success' });
                setTimeout(() => router.push('/login'), 3000);
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
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Nueva Contraseña Segura</label>
                <input required type="password" minLength={6} className="input-glass"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !token} style={{ marginTop: '10px', padding: '16px' }}>
                {loading ? 'Guardando...' : 'Restablecer Contraseña'}
            </button>
        </form>
    );
}

export default function ResetPassword() {
    return (
        <main style={{ padding: '60px 20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel animate-in" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Nueva Contraseña</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Define tu nueva contraseña de acceso.
                </p>

                <Suspense fallback={<div style={{ textAlign: 'center', color: '#888' }}>Cargando validación...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link href="/login" style={{ color: 'var(--text-secondary)' }}>Cancelar y volver al inicio de sesión</Link>
                </p>
            </div>
        </main>
    );
}
