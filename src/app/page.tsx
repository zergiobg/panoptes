'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Map, ShieldAlert, LogIn, Megaphone, MapPin, Clock, Briefcase, Plus, Shield, Bell } from 'lucide-react';

import ReportCarousel from '../components/ReportCarousel';

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    fetchReports();
    checkPendingApprovals();
  }, [categoryFilter]);

  const checkPendingApprovals = async () => {
    try {
      const res = await fetch('/api/admin/reports/pending');
      const data = await res.json();
      if (data.success && data.reports) {
        setPendingApprovals(data.reports.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?`;
      if (categoryFilter === 'Todos') {
        url += `date=today`;
      } else {
        url += `category=${encodeURIComponent(categoryFilter)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 30px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(15, 17, 21, 0.75)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Fallback image style in case logo is missing */}
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-main), #ffcc00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>P</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.5px' }} className="hide-on-mobile">Panoptes</span>
        </div>
        <div className="mobile-nav-gap" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/notificaciones" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Bell size={16} /> <span className="hide-on-mobile">Notificaciones</span>
          </Link>
          <Link href="/mi-actividad" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Briefcase size={16} /> <span className="hide-on-mobile">Actividad</span>
          </Link>
          <Link href="/map" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Map size={16} /> <span className="hide-on-mobile">Mapa</span>
          </Link>
          <Link href="/admin" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', position: 'relative' }}>
            <Shield size={16} /> 
            <span className="hide-on-mobile">Admin</span>
            {pendingApprovals > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                background: '#ff3333', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px rgba(255,51,51,0.6)'
              }}>
                {pendingApprovals > 9 ? '9+' : pendingApprovals}
              </span>
            )}
          </Link>
          <Link href="/admin/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <LogIn size={16} /> <span className="hide-on-mobile">Acceso</span>
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Unirse
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="mobile-padding hero-padding" style={{
        paddingTop: '140px', paddingBottom: '60px', paddingLeft: '20px', paddingRight: '20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Ambient light effects */}
        <div style={{
          position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,126,51,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        <div className="animate-in" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <img 
            src="/panoptes_logo.png" 
            alt="Panoptes Logo" 
            style={{ 
              width: '120px', 
              height: '120px', 
              objectFit: 'contain', 
              marginBottom: '20px',
              filter: 'drop-shadow(0 0 20px rgba(255, 126, 51, 0.4))'
            }} 
          />
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-1.5px',
            lineHeight: 1.15, maxWidth: '700px', margin: '0 auto 20px auto'
          }}>
            Miles de ojos.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-main), #ffcc00)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Una sola misión.</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.7,
            maxWidth: '560px', margin: '0 auto 40px auto'
          }}>
            La red comunitaria de búsqueda pasiva. Reporta lo que encontraste o lo que perdiste y ayudemos juntos.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
            <Link href="/reportar" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(255, 126, 51, 0.4)', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <Plus size={20} /> Reportar Hallazgo / Pérdida
            </Link>
          </div>

          {/* Quick Categories */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
            {[
              { cat: 'Persona', icon: '👤', bg: 'rgba(255,51,51,0.1)', color: '#ff3333' },
              { cat: 'Mascota', icon: '🐕', bg: 'rgba(255,170,0,0.1)', color: '#ffaa00' },
              { cat: 'Vehículo', icon: '🚗', bg: 'rgba(51,153,255,0.1)', color: '#3399ff' },
              { cat: 'Otro', icon: '📦', bg: 'rgba(255,255,255,0.1)', color: '#aaaaaa' }
            ].map((item) => (
              <Link key={item.cat} href={`/reportar?cat=${item.cat}`} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '16px', background: item.bg,
                  border: `1px solid ${item.color}40`, cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s'
                }} className="glass-panel" onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: item.color }}>{item.cat}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Carousel Section */}
          <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Casos Destacados
            </h2>
            <ReportCarousel />
          </div>
        </div>
      </section>

      {/* ═══ FEED TABS ═══ */}
      <section style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>

        {/* CATEGORY FILTERS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {['Todos', 'Persona', 'Mascota', 'Vehículo', 'Dispositivos', 'Documento', 'Otro'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s',
                background: categoryFilter === cat ? 'var(--accent-main)' : 'rgba(0,0,0,0.3)',
                color: categoryFilter === cat ? '#000' : 'var(--text-secondary)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FEED GRID (Pinterest style) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <div className="pulse" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Cargando reportes...</div>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <p>No hay reportes recientes.</p>
          </div>
        ) : (
          <div className="grid-mobile-1col" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px',
          minHeight: '400px'
        }}>
            {reports.map((report: any, i: number) => (
              <Link key={report.id} href={`/reporte/${report.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass-panel animate-in" style={{ 
                  overflow: 'hidden', padding: 0, animationDelay: `${i * 0.05}s`,
                  transition: 'transform 0.2s', cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {report.photoUrl && (
                    <img 
                      src={report.photoUrl} 
                      alt={report.category} 
                      style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', display: 'block' }} 
                    />
                  )}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, 
                        background: report.type === 'FOUND' ? 'rgba(51, 204, 102, 0.15)' : 'rgba(255, 85, 51, 0.15)',
                        color: report.type === 'FOUND' ? '#33cc66' : '#ff5533', marginBottom: '8px'
                      }}>
                        {report.type === 'FOUND' ? 'HALLAZGO' : 'PERDIDO'} • {report.category}
                      </div>
                      
                      {/* Match Indicator */}
                      {report.matchClaims?.length > 0 && (
                        <div title='Probables hallazgos reportados' style={{ color: '#ffcc00', fontSize: '1.2rem' }}>
                          ⚠️ {report.matchClaims.length}
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', lineHeight: 1.4, wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                      {report.category === 'Mascota' ? (
                        report.name ? `${report.petType || 'Mascota'}: ${report.name}` : (report.petType || 'Mascota')
                      ) : report.category === 'Persona' ? (
                        report.name || 'Persona sin identificar'
                      ) : report.category === 'Vehículo' ? (
                        report.brandModel || 'Vehículo'
                      ) : (
                        report.description.length > 80 ? report.description.substring(0, 80) + '...' : report.description
                      )}
                    </h3>
                    
                    {/* Detalles Específicos */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-main)', marginBottom: '10px' }}>
                      {report.category === 'Mascota' && [report.breed, report.color].filter(Boolean).join(' • ')}
                      {report.category === 'Persona' && [report.ageRange, report.gender].filter(Boolean).join(' • ')}
                      {report.category === 'Vehículo' && report.licensePlate && `Placa: ${report.licensePlate}`}
                      {report.category !== 'Mascota' && report.category !== 'Persona' && report.category !== 'Vehículo' && report.color && `Color: ${report.color}`}
                    </div>

                    {/* Descripción Breve (solo si ya no se usó como título) */}
                    {(report.category === 'Mascota' || report.category === 'Persona' || report.category === 'Vehículo') && report.description && (
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                         {report.description.length > 60 ? report.description.substring(0, 60) + '...' : report.description}
                       </p>
                    )}

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} /> {report.location || 'Ubicación desconocida'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {new Date(report.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: '24px 20px', textAlign: 'center', marginTop: '60px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: 'var(--text-secondary)', fontSize: '0.8rem'
      }}>
        <p>© 2024 Panoptes by Bochica Network — Todos los ojos, una misión.</p>
      </footer>

    </main>
  );
}
