'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserItem {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    createdAt: string;
    photoUrl?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch {
            console.error('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const statusColor = (status: string) => {
        if (status === 'ACTIVE') return '#33cc66';
        if (status === 'RED_FLAG') return '#ff3333';
        if (status === 'SUSPENDED') return '#888';
        return '#ffcc00'; // PENDING
    };

    return (
        <main style={{ padding: '40px 20px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Control de Calidad: Usuarios</h1>
                    </div>
                    <Link href="/admin" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>← Volver al Dashboard</Link>
                </div>

                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
                        <h3 style={{ margin: 0 }}>Lista Completa de Usuarios Registrados</h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando usuarios...</div>
                    ) : users.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay usuarios en la base de datos.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                                        <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Nombre</th>
                                        <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Contacto</th>
                                        <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Fecha Registro</th>
                                        <th style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>Estatus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px 20px' }}>
                                                <strong>{user.name}</strong><br />
                                                <span style={{ fontSize: '0.75rem', color: '#666' }}>{user.id}</span>
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                📧 {user.email}<br />
                                                📱 {user.phone || 'N/A'}
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                    backgroundColor: `${statusColor(user.status)}22`, color: statusColor(user.status), border: `1px solid ${statusColor(user.status)}44`
                                                }}>{user.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
