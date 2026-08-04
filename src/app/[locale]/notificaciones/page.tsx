'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, AlertTriangle, MapPin } from 'lucide-react';
import PushManager from '@/components/PushManager';

export default function NotificacionesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<{ global: any[], local: any[] }>({ global: [], local: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchNotifications(pos.coords.latitude, pos.coords.longitude),
        (err) => fetchNotifications() // Fallback sin ubicación
      );
    } else {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async (lat?: number, lng?: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const renderItem = (item: any, isGlobal: boolean) => (
    <div 
      key={item.id} 
      className="glass-panel" 
      style={{ padding: '15px', marginBottom: '15px', cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }}
      onClick={() => router.push(`/reporte/${item.id}`)}
    >
      <div style={{ background: isGlobal ? 'rgba(255, 85, 51, 0.15)' : 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '50%', color: isGlobal ? '#ff5533' : '#3b82f6' }}>
        {isGlobal ? <AlertTriangle size={24} /> : <MapPin size={24} />}
      </div>
      <div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: isGlobal ? '#ffaa00' : '#fff' }}>
          {item.type === 'LOST' ? 'PERDIDO:' : 'ENCONTRADO:'} {item.category}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {item.category === 'Mascota' ? item.name || 'Mascota sin nombre' : 
           item.category === 'Persona' ? item.name || 'Persona sin identificar' : 
           item.category === 'Vehículo' ? item.brandModel || 'Vehículo' : item.description}
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          {item.location} • {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '16px 30px', display: 'flex', alignItems: 'center', background: 'rgba(15, 17, 21, 0.75)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <ArrowLeft size={20} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Volver</span>
        </div>
      </nav>

      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Bell size={36} color="var(--accent-main)" />
          Centro de Alertas
        </h1>

        <PushManager />

        {loading ? (
          <div className="pulse" style={{ textAlign: 'center', padding: '50px' }}>Buscando alertas recientes...</div>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#ffaa00', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Alertas Prioritarias (Personas, Mascotas, Vehículos)
              </h2>
              {notifications.global.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No hay alertas prioritarias recientes.</p>
              ) : (
                notifications.global.map(n => renderItem(n, true))
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} /> Objetos en tu área
              </h2>
              {notifications.local.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No hay reportes de objetos recientes en tu zona.</p>
              ) : (
                notifications.local.map(n => renderItem(n, false))
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
