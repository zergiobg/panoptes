'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportEvent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'PET',
        latitude: '',
        longitude: '',
        reporterId: 'demo-user-123' // Fallback for local testing if no auth context
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setFormData({
                    ...formData,
                    latitude: pos.coords.latitude.toString(),
                    longitude: pos.coords.longitude.toString()
                });
            }, (err) => {
                setMsg({ text: 'Error obteniendo ubicación. Puedes ingresarla manualmente.', type: 'error' });
            });
        } else {
            setMsg({ text: 'Geolocalización no soportada.', type: 'error' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            };

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg({ text: 'Alerta Roja Activada. La red fue notificada (Geocerca: 1km).', type: 'success' });
                setTimeout(() => router.push('/'), 4000);
            } else {
                setMsg({ text: data.error || 'Error reportando el evento.', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Falla crítica de red.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ padding: '60px 20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel animate-in" style={{ padding: '40px', maxWidth: '500px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--accent-main)' }}>Reportar Evento (Alarma Comunitaria)</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    Se emitirá una notificación a todos los usuarios de la red dentro del perímetro circular configurado.
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Tipo de Pérdida</label>
                        <select className="input-glass" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            <option value="PERSON">Persona (Máxima Prioridad)</option>
                            <option value="PET">Mascota</option>
                            <option value="THING">Objeto de Valor</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Título Corto</label>
                        <input required type="text" className="input-glass" placeholder="Ej: Perro Golden en la 5ta con 11"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Descripción (y marcas únicas)</label>
                        <textarea required className="input-glass" rows={3}
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--accent-hover)' }}>Última Ubicación Conocida</label>
                        <button type="button" onClick={getLocation} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', marginBottom: '10px', backgroundColor: '#3399ff' }}>
                            Autocompletar con mi GPS
                        </button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input required type="text" className="input-glass" placeholder="Latitud"
                                value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                            />
                            <input required type="text" className="input-glass" placeholder="Longitud"
                                value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', padding: '16px' }}>
                        {loading ? 'Propagando en la red...' : 'Disparar Geocerca y Alertas'}
                    </button>
                </form>
            </div>
        </main>
    );
}
