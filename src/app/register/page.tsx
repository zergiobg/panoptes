'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Email for OTP, 2: OTP verification & details

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        otpCode: '',
        photo: null as File | null
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const requestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg({ text: 'Código enviado. Revisa tu email (o la consola).', type: 'success' });
                setStep(2);
            } else {
                setMsg({ text: data.error, type: 'error' });
            }
        } catch {
            setMsg({ text: 'Error enviando OTP.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    otpCode: formData.otpCode,
                    photoUrl: 'pending_ai_validation'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMsg({ text: data.message, type: 'success' });
                setTimeout(() => router.push('/'), 5000);
            } else {
                setMsg({ text: data.error, type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Error creando usuario.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ padding: '60px 20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel animate-in" style={{ padding: '40px', maxWidth: '500px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Integración a Panoptes</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    {step === 1 ? 'Paso 1: Iniciamos con el envío del testigo alfanumérico a tu email.' : 'Paso 2: Finaliza la confirmación de la identidad visual e ingresa.'}
                </p>

                {msg.text && (
                    <div style={{
                        padding: '12px', marginBottom: '20px', borderRadius: '8px',
                        backgroundColor: msg.type === 'error' ? 'rgba(255, 60, 60, 0.2)' : 'rgba(51, 204, 102, 0.2)',
                        border: `1px solid ${msg.type === 'error' ? '#ff3c3c' : '#33cc66'}`
                    }}>
                        {msg.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={requestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Correo Electrónico a Validar</label>
                            <input required type="email" className="input-glass"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', padding: '16px' }}>
                            {loading ? 'Generando Testigo...' : 'Obtener Código OTP Segurizado'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Código OTP (Revisa tu Email)</label>
                            <input required type="text" className="input-glass" maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                                value={formData.otpCode} onChange={e => setFormData({ ...formData, otpCode: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Nombre Completo (Real)</label>
                            <input required type="text" className="input-glass"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Teléfono Móvil</label>
                            <input required type="tel" className="input-glass"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div style={{ padding: '15px', border: '1px dashed var(--border-glass)', borderRadius: '8px', textAlign: 'center', margin: '10px 0' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ marginBottom: '10px', color: 'var(--accent-main)' }}>Subir Fotografía (Rostro ID / KYC)</span>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setFormData({ ...formData, photo: e.target.files[0] });
                                    }
                                }} />
                                {formData.photo ? (
                                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>Archivo para IA: {formData.photo.name}</span>
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Esta foto pasará pruebas de Inteligencia Computacional.</span>
                                )}
                            </label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', padding: '16px' }}>
                            {loading ? 'Fijando grafo Blockchain y KYC...' : 'Convertirme en Miembro (Pendiente de Endoso)'}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
