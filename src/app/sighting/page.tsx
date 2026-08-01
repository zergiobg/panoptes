'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function SightingForm() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  const router = useRouter();

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toString());
          setLongitude(pos.coords.longitude.toString());
        },
        (err) => console.log('Geolocation disabled')
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          comment
        })
      });
      router.push('/map');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '30px' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: 'bold' }}>Reportar Avistamiento</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
        Ayuda a trazar la ruta de este evento. La ubicación actual se ha completado mediante tu GPS.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Latitud</label>
          <input 
            type="number" 
            step="any"
            className="input-glass"
            value={latitude} 
            onChange={(e) => setLatitude(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Longitud</label>
          <input 
            type="number" 
            step="any"
            className="input-glass"
            value={longitude} 
            onChange={(e) => setLongitude(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Comentario (opcional)</label>
          <textarea 
            className="input-glass"
            placeholder="Ej: Lo vi corriendo hacia el norte..."
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={() => router.push('/map')} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2 }}>
            {loading ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SightingPage() {
  return (
    <div className="container mx-auto p-6 max-w-md animate-in" style={{ marginTop: '50px' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>}>
        <SightingForm />
      </Suspense>
    </div>
  );
}
