'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, AlertTriangle, UserCheck, ShieldOff, Search, MapPin, List, Activity } from 'lucide-react';

interface UserItem {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    createdAt: string;
    photoUrl?: string;
    endorser?: { name: string; email: string; status: string };
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');

    // Para el demo usamos un admin ID fijo
    const ADMIN_ID = 'your-admin-user-id';

    const [pendingReports, setPendingReports] = useState<any[]>([]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const [resUsers, resStats, resReports] = await Promise.all([
                fetch('/api/admin/users/pending'),
                fetch('/api/admin/stats'),
                fetch('/api/admin/reports/pending')
            ]);
            const dataUsers = await resUsers.json();
            const dataStats = await resStats.json();
            const dataReports = await resReports.json();
            setUsers(dataUsers.users || []);
            setStats(dataStats);
            setPendingReports(dataReports.reports || []);
        } catch {
            console.error('Error loading admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleAction = async (targetUserId: string, action: 'APPROVE' | 'REJECT') => {
        setActionMsg('');
        try {
            const res = await fetch('/api/kyc/endorse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId, endorserId: ADMIN_ID, action })
            });
            const data = await res.json();
            setActionMsg(data.message || data.error);
            fetchPending();
        } catch {
            setActionMsg('Error procesando la accion.');
        }
    };

    const handleReportAction = async (reportId: string, action: 'APPROVE' | 'REJECT') => {
        setActionMsg('');
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                setActionMsg(`Reporte ${action === 'APPROVE' ? 'aprobado' : 'rechazado'} con éxito.`);
            } else {
                setActionMsg(data.error);
            }
            fetchPending();
        } catch {
            setActionMsg('Error procesando la accion del reporte.');
        }
    };

    const statusColor = (status: string) => {
        if (status === 'ACTIVE') return '#33cc66';
        if (status === 'RED_FLAG') return '#ff3333';
        if (status === 'SUSPENDED') return '#888';
        return '#ffcc00'; // PENDING
    };

    return (
        <main style={{ padding: '40px 20px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/panoptes_logo.png" alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                        <div>
                            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Panel de Control</h1>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Red Panoptes — Gestor de Identidades</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Link href="/admin/ads" style={{ color: 'var(--accent-main)', fontSize: '0.9rem' }}>Gestionar Ads</Link>
                        <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>← Volver</Link>
                    </div>
                </div>

                {/* Stats row - Users */}
                {stats && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} /> Identidades (Usuarios)
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid var(--accent-main)' }}>
                                <p style={{ color: 'var(--accent-main)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.users.TOTAL}</p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Total Registrados</p>
                            </div>
                            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid #33cc66' }}>
                                <p style={{ color: '#33cc66', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.users.ACTIVE}</p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Activos</p>
                            </div>
                            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid #ffcc00' }}>
                                <p style={{ color: '#ffcc00', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.users.PENDING}</p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Pendientes (KYC)</p>
                            </div>
                            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderLeft: '4px solid #ff4444' }}>
                                <p style={{ color: '#ff4444', fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.users.RED_FLAG}</p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Red Flags</p>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '1.2rem', margin: '30px 0 15px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> Elementos y Sucesos
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                            {/* Perdidos vs Encontrados */}
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Distribución</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: '#ff4444' }}>🔴 Perdidos</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{stats.reports.byType.LOST || 0}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#33cc66' }}>🟢 Encontrados (Hallazgos)</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{stats.reports.byType.FOUND || 0}</strong>
                                </div>
                            </div>
                            
                            {/* Categorías */}
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Por Categoría</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                    {stats.reports.byCategory.map((cat: any) => (
                                        <div key={cat.category} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px', flex: 1, minWidth: '100px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{cat.count}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.category}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Demografía de Personas */}
                        <h2 style={{ fontSize: '1.2rem', margin: '30px 0 15px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={20} /> Demografía de Casos (Personas)
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Por Género</h3>
                                {stats.reports.demographics?.gender?.length === 0 && <span style={{ color: '#555' }}>Sin datos</span>}
                                {stats.reports.demographics?.gender?.map((g: any) => (
                                    <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                        <span>{g.name}</span>
                                        <strong style={{ color: 'var(--accent-main)' }}>{g.count}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Por Rango de Edad</h3>
                                {stats.reports.demographics?.ageRange?.length === 0 && <span style={{ color: '#555' }}>Sin datos</span>}
                                {stats.reports.demographics?.ageRange?.map((g: any) => (
                                    <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                        <span>{g.name}</span>
                                        <strong style={{ color: '#3b82f6' }}>{g.count}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Condición Cognitiva</h3>
                                {stats.reports.demographics?.cognitive?.length === 0 && <span style={{ color: '#555' }}>Sin datos</span>}
                                {stats.reports.demographics?.cognitive?.map((g: any) => (
                                    <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                        <span>{g.name}</span>
                                        <strong style={{ color: '#ffcc00' }}>{g.count}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Ciudad / País</h3>
                                {stats.reports.demographics?.location?.length === 0 && <span style={{ color: '#555' }}>Sin datos</span>}
                                {stats.reports.demographics?.location?.map((g: any) => (
                                    <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                        <span>{g.name}</span>
                                        <strong style={{ color: '#ff7e33' }}>{g.count}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action feedback */}
                {actionMsg && (
                    <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', background: 'rgba(255,126,51,0.1)', border: '1px solid var(--accent-main)' }}>
                        {actionMsg}
                    </div>
                )}

                {/* Users table */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
                        <h3 style={{ margin: 0 }}>Usuarios en Revisión KYC</h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando identidades...</div>
                    ) : users.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            ✅ No hay usuarios pendientes de revisión en este momento.
                        </div>
                    ) : (
                        users.map((user, i) => (
                            <div key={user.id} style={{
                                padding: '20px',
                                borderBottom: i < users.length - 1 ? '1px solid var(--border-glass)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                            backgroundColor: `${statusColor(user.status)}22`, color: statusColor(user.status), border: `1px solid ${statusColor(user.status)}44`
                                        }}>{user.status}</span>
                                        <strong>{user.name}</strong>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0' }}>📧 {user.email} {user.phone ? `| 📱 ${user.phone}` : ''}</p>
                                    {user.endorser && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '2px 0' }}>
                                            🔗 Endosador: {user.endorser.name} ({user.endorser.status})
                                        </p>
                                    )}
                                    <p style={{ color: '#555', fontSize: '0.75rem', margin: '2px 0' }}>ID: {user.id}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleAction(user.id, 'APPROVE')}
                                        style={{ padding: '8px 16px', background: 'rgba(51,204,102,0.2)', border: '1px solid #33cc66', color: '#33cc66', borderRadius: '6px', cursor: 'pointer' }}>
                                        Aprobar
                                    </button>
                                    <button onClick={() => handleAction(user.id, 'REJECT')}
                                        style={{ padding: '8px 16px', background: 'rgba(255,60,60,0.2)', border: '1px solid #ff3c3c', color: '#ff3c3c', borderRadius: '6px', cursor: 'pointer' }}>
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reports table */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginTop: '30px' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
                        <h3 style={{ margin: 0 }}>Reportes de Alto Valor Pendientes</h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando reportes...</div>
                    ) : pendingReports.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            ✅ No hay reportes pendientes de aprobación en este momento.
                        </div>
                    ) : (
                        pendingReports.map((report, i) => (
                            <div key={report.id} style={{
                                padding: '20px',
                                borderBottom: i < pendingReports.length - 1 ? '1px solid var(--border-glass)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
                            }}>
                                <div style={{ flex: 1, display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden',
                                        background: 'rgba(255,255,255,0.05)', flexShrink: 0
                                    }}>
                                        {report.photoUrl ? (
                                            <img src={report.photoUrl} alt="Reporte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                                                📷
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: `rgba(255,204,0,0.2)`, color: '#ffcc00', border: `1px solid rgba(255,204,0,0.4)`
                                            }}>{report.category}</span>
                                            <strong>{report.description.substring(0, 80)}{report.description.length > 80 ? '...' : ''}</strong>
                                        </div>
                                        {report.brandModel && <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: '2px 0', fontWeight: 500 }}>🚙 {report.brandModel} {report.color && `(${report.color})`} {report.licensePlate && `[${report.licensePlate}]`}</p>}
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0' }}>📍 {report.location} | 🗓️ {new Date(report.eventDate).toLocaleDateString()}</p>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                            <p style={{ color: '#555', fontSize: '0.75rem', margin: 0 }}>ID: {report.id}</p>
                                            <a href={`/reporte/${report.id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-main)', fontSize: '0.75rem', textDecoration: 'underline' }}>Ver detalle ↗</a>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleReportAction(report.id, 'APPROVE')}
                                        style={{ padding: '8px 16px', background: 'rgba(51,204,102,0.2)', border: '1px solid #33cc66', color: '#33cc66', borderRadius: '6px', cursor: 'pointer' }}>
                                        Aprobar Publicación
                                    </button>
                                    <button onClick={() => handleReportAction(report.id, 'REJECT')}
                                        style={{ padding: '8px 16px', background: 'rgba(255,60,60,0.2)', border: '1px solid #ff3c3c', color: '#ff3c3c', borderRadius: '6px', cursor: 'pointer' }}>
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
