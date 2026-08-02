'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Shield, Lock, FileText, MessageSquare, LogOut, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'DATOS' | 'REPORTES' | 'SOPORTE'>('DATOS');
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [supportMsg, setSupportMsg] = useState('');
    const [passwordData, setPasswordData] = useState({ current: '', new: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/me')
            .then(res => res.json())
            .then(data => {
                if (!data.loggedIn) {
                    router.push('/login');
                } else {
                    setUser(data.user);
                }
                setLoading(false);
            })
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg({ text: '', type: '' });
        
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            });
            const data = await res.json();
            if (res.ok) {
                setMsg({ text: 'Contraseña actualizada exitosamente.', type: 'success' });
                setPasswordData({ current: '', new: '' });
            } else {
                setMsg({ text: data.error || 'Error actualizando contraseña.', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Error de conexión.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg({ text: '', type: '' });
        
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: supportMsg, subject: `Panoptes Soporte: [${user.name}] tema` })
            });
            if (res.ok) {
                setMsg({ text: 'Mensaje enviado a soporte.', type: 'success' });
                setSupportMsg('');
            } else {
                setMsg({ text: 'Error enviando mensaje.', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Error de conexión.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}><Loader2 size={32} className="animate-spin" /></div>;
    if (!user) return null;

    return (
        <main style={{ minHeight: '100vh', padding: '100px 20px 40px 20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* ═══ SIDEBAR ═══ */}
            <div className="glass-panel" style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px', height: 'fit-content' }}>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    {user.photoUrl && !user.photoUrl.startsWith('pending') ? (
                        <img src={user.photoUrl} alt={user.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-main)' }} />
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-main), #ffcc00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '3rem' }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {user.status === 'SUSPENDED' && (
                        <div style={{ position: 'absolute', bottom: -10, background: '#ff3333', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                            SUSPENDIDO
                        </div>
                    )}
                </div>

                <h2 style={{ fontSize: '1.2rem', marginBottom: '5px', textAlign: 'center' }}>{user.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>{user.email}</p>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => setActiveTab('DATOS')} className="input-glass" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'DATOS' ? 'rgba(255,255,255,0.1)' : 'transparent', border: activeTab === 'DATOS' ? '1px solid var(--accent-main)' : '1px solid transparent', cursor: 'pointer' }}>
                        <User size={18} /> Mis Datos
                    </button>
                    <button onClick={() => setActiveTab('REPORTES')} className="input-glass" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'REPORTES' ? 'rgba(255,255,255,0.1)' : 'transparent', border: activeTab === 'REPORTES' ? '1px solid var(--accent-main)' : '1px solid transparent', cursor: 'pointer' }}>
                        <FileText size={18} /> Mis Reportes
                    </button>
                    <button onClick={() => setActiveTab('SOPORTE')} className="input-glass" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'SOPORTE' ? 'rgba(255,255,255,0.1)' : 'transparent', border: activeTab === 'SOPORTE' ? '1px solid var(--accent-main)' : '1px solid transparent', cursor: 'pointer' }}>
                        <MessageSquare size={18} /> Soporte
                    </button>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <button className="input-glass" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,51,51,0.1)', color: '#ff3333', border: '1px solid rgba(255,51,51,0.3)', cursor: 'pointer' }}>
                            <LogOut size={18} /> Volver al Inicio
                        </button>
                    </Link>
                </div>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div className="glass-panel" style={{ flex: '3 1 400px', padding: '30px' }}>
                {msg.text && (
                    <div style={{
                        padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.9rem',
                        backgroundColor: msg.type === 'error' ? 'rgba(255, 60, 60, 0.2)' : 'rgba(51, 204, 102, 0.2)',
                        border: `1px solid ${msg.type === 'error' ? '#ff3c3c' : '#33cc66'}`
                    }}>
                        {msg.text}
                    </div>
                )}

                {activeTab === 'DATOS' && (
                    <div className="animate-in">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={24} color="var(--accent-main)" /> Seguridad e Identidad
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Estado de Cuenta</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: user.status === 'ACTIVE' ? '#33cc66' : '#ff3333' }}>
                                    {user.status}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Teléfono</label>
                                <p style={{ fontSize: '1.1rem' }}>{user.phone || 'No registrado'}</p>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '30px 0' }} />

                        <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Lock size={18} /> Cambiar Contraseña
                        </h4>
                        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                            <input 
                                type="password" 
                                placeholder="Contraseña actual" 
                                className="input-glass" 
                                required
                                value={passwordData.current}
                                onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                            />
                            <input 
                                type="password" 
                                placeholder="Nueva contraseña" 
                                className="input-glass" 
                                required
                                minLength={6}
                                value={passwordData.new}
                                onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                            />
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'REPORTES' && (
                    <div className="animate-in">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Mis Reportes Publicados</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Esta función estará disponible en la próxima actualización.</p>
                        {/* Se implementará en la siguiente fase */}
                    </div>
                )}

                {activeTab === 'SOPORTE' && (
                    <div className="animate-in">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Contactar a Soporte</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            Si crees que hubo un error con tu cuenta o necesitas ayuda técnica, escríbenos.
                        </p>
                        <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input 
                                type="text" 
                                className="input-glass" 
                                value={`Panoptes Soporte: [${user.name}] tema`} 
                                readOnly 
                                style={{ opacity: 0.7 }}
                            />
                            <textarea 
                                className="input-glass" 
                                placeholder="Describe tu problema en detalle..." 
                                required
                                rows={6}
                                value={supportMsg}
                                onChange={e => setSupportMsg(e.target.value)}
                            />
                            <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
                                {submitting ? 'Enviando...' : 'Enviar Mensaje'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
