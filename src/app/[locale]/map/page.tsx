'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Carga dinámica para evitar errores de SSR con Leaflet
const PanoptesMap = dynamic(() => import('@/components/PanoptesMap'), {
    ssr: false, loading: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            Cargando mapa de vigilancia...
        </div>
    )
});

export default function MapPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);
    const [userLat, setUserLat] = useState<number>(4.6097);
    const [userLng, setUserLng] = useState<number>(-74.0817);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLat(pos.coords.latitude);
                    setUserLng(pos.coords.longitude);
                },
                (err) => console.log('Geolocation disabled')
            );
        }
    }, []);

    useEffect(() => {
        fetch(`/api/events/nearby?lat=${userLat}&lng=${userLng}`)
            .then(res => res.json())
            .then(data => {
                setReports(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [userLat, userLng]);

    const urgencyColor = (category: string) => {
        if (category === 'Mascota' || category === 'Persona') return '#ff3333';
        if (category === 'Vehículo' || category === 'Dispositivos') return '#ffaa00';
        return '#3399ff';
    };

    return (
        <main className="map-layout">
            {/* Sidebar izquierdo: Lista de eventos */}
            <div className="map-sidebar">
                {/* Header Sidebar */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <img src="/panoptes_logo.png" alt="Logo" style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Red Activa</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href="/reportar" style={{ flex: 1 }}>
                            <button className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>
                                + Nuevo Reporte
                            </button>
                        </Link>
                        <Link href="/">
                            <button style={{ padding: '10px', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer' }}>
                                ←
                            </button>
                        </Link>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Escaneando tu área...
                        </div>
                    ) : reports.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '2rem' }}>✅</p>
                            <p>No hay alertas activas en tu zona.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} onClick={() => setSelected(report)} style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--border-glass)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                background: selected?.id === report.id ? 'rgba(255,126,51,0.08)' : 'transparent',
                                borderLeft: `3px solid ${selected?.id === report.id ? urgencyColor(report.category) : 'transparent'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{report.category} - {report.location.split(',')[0]}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                                    {report.description?.slice(0, 80)}{report.description?.length > 80 ? '...' : ''}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#555' }}>
                                        {new Date(report.createdAt).toLocaleDateString('es-CO')}
                                    </span>
                                    {selected?.id === report.id && (
                                        <Link href={`/sighting?reportId=${report.id}`}>
                                            <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                                                + Avistamiento
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Columna derecha: Mapa */}
            <div className="map-container">
                <PanoptesMap reports={reports} centerLat={selected?.latitude || userLat} centerLng={selected?.longitude || userLng} />

                {/* Panel de detalle del evento seleccionado en overlay móvil */}
                {selected && (
                    <div className="glass-panel animate-up" style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '400px',
                        padding: '15px',
                        zIndex: 1000,
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>{selected.category}</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Último avistamiento hace poco</p>
                        </div>
                        <Link href={`/sighting?reportId=${selected.id}`}>
                            <button className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                                Reportar
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
