'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Megaphone, MapPin, Eye, Search, Briefcase } from 'lucide-react';

export default function MiActividad() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reportes' | 'eurekas' | 'avistamientos'>('reportes');
  const [data, setData] = useState<any>({ myReports: [], mySightings: [], myMatches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    const reportIds = JSON.parse(localStorage.getItem('my_panoptes_reports') || '[]');
    const sightingIds = JSON.parse(localStorage.getItem('my_panoptes_sightings') || '[]');
    const matchIds = JSON.parse(localStorage.getItem('my_panoptes_matches') || '[]');

    try {
      const res = await fetch('/api/me/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds, sightingIds, matchIds })
      });
      const json = await res.json();
      if (json.success) {
        setData({
          myReports: json.myReports,
          mySightings: json.mySightings,
          myMatches: json.myMatches
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Persona': return '👤';
      case 'Mascota': return '🐾';
      case 'Vehículo': return '🚗';
      case 'Llaves': return '🔑';
      case 'Dispositivos': return '📱';
      case 'Artículo personal': return '👜';
      case 'Ropa': return '👕';
      case 'Documento': return '📄';
      default: return '📦';
    }
  };

  const renderGrid = (items: any[]) => {
    if (items.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Briefcase size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p>No tienes actividad en esta sección aún.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {items.map(item => (
          <div 
            key={item.id} 
            className="glass-panel" 
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onClick={() => router.push(`/reporte/${item.id}`)}
          >
            <div style={{ 
              display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, 
              background: item.type === 'FOUND' ? 'rgba(51, 204, 102, 0.15)' : 'rgba(255, 85, 51, 0.15)',
              color: item.type === 'FOUND' ? '#33cc66' : '#ff5533', marginBottom: '10px',
              alignSelf: 'flex-start'
            }}>
              {item.type === 'FOUND' ? 'ENCONTRADO 🤝' : 'PERDIDO 🚨'} • {getCategoryIcon(item.category)} {item.category}
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              {item.category === 'Mascota' ? (
                item.name ? `${item.petType || 'Mascota'}: ${item.name}` : (item.petType || 'Mascota')
              ) : item.category === 'Persona' ? (
                item.name || 'Persona sin identificar'
              ) : item.category === 'Vehículo' ? (
                item.brandModel || 'Vehículo'
              ) : (
                item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description
              )}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'auto' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {item.location}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ═══ NAVBAR MINIMALISTA ═══ */}
      <nav style={{
        padding: '16px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(15, 17, 21, 0.75)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <ArrowLeft size={20} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Volver al Inicio</span>
        </div>
      </nav>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Briefcase size={36} color="var(--accent-main)" />
          Mi Actividad
        </h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('reportes')}
            style={{ 
              padding: '10px 20px', background: activeTab === 'reportes' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'reportes' ? 'bold' : 'normal',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <Megaphone size={18} />
            Mis Reportes ({data.myReports.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('eurekas')}
            style={{ 
              padding: '10px 20px', background: activeTab === 'eurekas' ? 'rgba(51, 204, 102, 0.15)' : 'transparent',
              border: 'none', color: activeTab === 'eurekas' ? '#33cc66' : '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'eurekas' ? 'bold' : 'normal',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <Search size={18} />
            Mis Eurekas ({data.myMatches.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('avistamientos')}
            style={{ 
              padding: '10px 20px', background: activeTab === 'avistamientos' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: 'none', color: activeTab === 'avistamientos' ? '#3b82f6' : '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === 'avistamientos' ? 'bold' : 'normal',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <Eye size={18} />
            Avistamientos ({data.mySightings.length})
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando actividad...</div>
        ) : (
          <div>
            {activeTab === 'reportes' && renderGrid(data.myReports)}
            {activeTab === 'eurekas' && renderGrid(data.myMatches)}
            {activeTab === 'avistamientos' && renderGrid(data.mySightings)}
          </div>
        )}
      </section>
    </main>
  );
}
