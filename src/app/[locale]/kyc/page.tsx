'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Phone, KeyRound, AlertCircle } from 'lucide-react';

export default function KYCPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const res = await fetch('/api/kyc/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMsg('SMS de prueba enviado. Revisa la terminal del servidor.');
                setStep(2);
            } else {
                setError(data.error || 'Error al enviar el SMS');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/kyc/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code: otp })
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMsg('¡Identidad verificada! Redirigiendo...');
                setTimeout(() => {
                    router.push('/perfil');
                    router.refresh();
                }, 1500);
            } else {
                setError(data.error || 'Código incorrecto');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(51, 204, 102, 0.2)', padding: '15px', borderRadius: '50%', color: '#33cc66' }}>
                        <ShieldCheck size={40} />
                    </div>
                </div>

                <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Verificación de Identidad</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '30px' }}>
                    Para mantener segura la comunidad, requerimos validar tu número celular.
                </p>

                {error && (
                    <div style={{ background: 'rgba(255, 60, 60, 0.1)', color: '#ff3c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', textAlign: 'left' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {successMsg && (
                    <div style={{ background: 'rgba(51, 204, 102, 0.1)', color: '#33cc66', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                        {successMsg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-secondary)' }} />
                            <input
                                type="tel"
                                className="input-glass"
                                placeholder="+57 300 000 0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ paddingLeft: '45px' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Enviando...' : 'Enviar SMS'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <KeyRound size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Ingresa el código de 6 dígitos"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ paddingLeft: '45px', letterSpacing: '4px', fontWeight: 'bold' }}
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Verificando...' : 'Verificar Código'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginTop: '15px', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                            Cambiar número de teléfono
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
