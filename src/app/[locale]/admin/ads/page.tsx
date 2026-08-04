'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface Ad {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    category: 'PET' | 'PERSON' | 'THING' | 'GENERAL';
    priority: number;
}

export default function AdminAdsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [form, setForm] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        category: 'PET' as 'PET' | 'PERSON' | 'THING' | 'GENERAL',
        priority: 1,
    });

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ads');
            const data = await res.json();
            if (data.ads && Array.isArray(data.ads)) {
                setAds(data.ads);
            }
        } catch (err) {
            console.error('Error al obtener la lista de anuncios:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!form.title.trim() || !form.imageUrl.trim() || !form.linkUrl.trim()) {
            setMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios.' });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    imageUrl: form.imageUrl,
                    linkUrl: form.linkUrl,
                    category: form.category,
                    priority: Number(form.priority) || 1,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'No se pudo guardar el anuncio.');
            }

            setMessage({ type: 'success', text: '✅ Anuncio agregado con éxito a la plataforma.' });
            setForm({
                title: '',
                imageUrl: '',
                linkUrl: '',
                category: 'PET',
                priority: 1,
            });
            fetchAds();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error de comunicación con el servidor.' });
        } finally {
            setSubmitting(false);
        }
    };

    const categoryBadgeStyle = (category: string) => {
        switch (category) {
            case 'PET':
                return { bg: 'rgba(255, 126, 51, 0.2)', border: '#ff7e33', color: '#ff7e33', label: '🐾 Mascota (PET)' };
            case 'PERSON':
                return { bg: 'rgba(51, 153, 255, 0.2)', border: '#3399ff', color: '#3399ff', label: '👤 Persona (PERSON)' };
            case 'THING':
                return { bg: 'rgba(204, 51, 255, 0.2)', border: '#cc33ff', color: '#cc33ff', label: '📦 Objeto (THING)' };
            default:
                return { bg: 'rgba(160, 165, 177, 0.2)', border: '#a0a5b1', color: '#a0a5b1', label: '🌐 General (GENERAL)' };
        }
    };

    return (
        <main style={{ padding: '40px 20px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/panoptes_logo.png" alt="Logo Panoptes" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                        <div>
                            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>Gestión de Anuncios Patrocinados</h1>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                                Panel de administración — Panoptes Ad Manager
                            </p>
                        </div>
                    </div>
                    <Link href="/admin" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ← Volver al Panel
                    </Link>
                </div>

                {/* Subtitle description */}
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        📢 Desde este panel puedes agregar y gestionar los anuncios que se mostrarán de forma discreta y elegante en la red Panoptes según la categoría del contexto (Mascotas, Personas, Objetos o General).
                    </p>
                </div>

                {/* Form to add a new Ad */}
                <div className="glass-panel" style={{ padding: '28px', marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        ➕ Agregar Nuevo Anuncio
                    </h2>

                    {message && (
                        <div
                            style={{
                                padding: '12px 16px',
                                marginBottom: '20px',
                                borderRadius: 'var(--radius-sm)',
                                background: message.type === 'success' ? 'rgba(51, 204, 102, 0.15)' : 'rgba(255, 60, 60, 0.15)',
                                border: `1px solid ${message.type === 'success' ? '#33cc66' : '#ff3c3c'}`,
                                color: message.type === 'success' ? '#33cc66' : '#ff3c3c',
                                fontSize: '0.9rem',
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Título del Anuncio *
                                </label>
                                <input
                                    className="input-glass"
                                    type="text"
                                    placeholder="Ej: Alimento Premium para Mascotas NutriPet"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Categoría / Contexto *
                                </label>
                                <select
                                    className="input-glass"
                                    style={{ background: '#191c23', cursor: 'pointer' }}
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                                    required
                                >
                                    <option value="PET">🐾 Mascota (PET)</option>
                                    <option value="PERSON">👤 Persona (PERSON)</option>
                                    <option value="THING">📦 Objeto (THING)</option>
                                    <option value="GENERAL">🌐 General (GENERAL)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    URL de la Imagen (Banner) *
                                </label>
                                <input
                                    className="input-glass"
                                    type="url"
                                    placeholder="https://placehold.co/728x90/1a1d24/ff7e33?text=Tu+Banner"
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    URL de Destino (Enlace) *
                                </label>
                                <input
                                    className="input-glass"
                                    type="url"
                                    placeholder="https://ejemplo.com/producto"
                                    value={form.linkUrl}
                                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '18px', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Prioridad (1-10)
                                </label>
                                <input
                                    className="input-glass"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value, 10) || 1 })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-primary"
                                    type="submit"
                                    disabled={submitting}
                                    style={{ opacity: submitting ? 0.7 : 1 }}
                                >
                                    {submitting ? 'Guardando...' : '➕ Publicar Anuncio'}
                                </button>
                                <button
                                    className="input-glass"
                                    type="button"
                                    onClick={() =>
                                        setForm({
                                            title: 'Promoción de Prueba Panoptes',
                                            imageUrl: 'https://placehold.co/728x90/1a1d24/ff7e33?text=Promocion+de+Prueba',
                                            linkUrl: 'https://example.com/promo',
                                            category: 'PET',
                                            priority: 1,
                                        })
                                    }
                                    style={{ width: 'auto', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Rellenar datos de muestra
                                </button>
                            </div>
                        </div>

                        {/* Live Image Preview */}
                        {form.imageUrl && (
                            <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>Vista previa de la imagen:</p>
                                <img
                                    src={form.imageUrl}
                                    alt="Vista previa"
                                    style={{ height: '60px', maxWidth: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </form>
                </div>

                {/* Table of Ads */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>📋 Anuncios Configurados ({ads.length})</h2>
                        <button
                            className="input-glass"
                            onClick={fetchAds}
                            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            🔄 Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Cargando anuncios...
                        </div>
                    ) : ads.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No hay anuncios registrados actualmente.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid var(--border-glass)' }}>
                                        <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Vista Previa</th>
                                        <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Título</th>
                                        <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Categoría</th>
                                        <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Enlace</th>
                                        <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Prioridad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ads.map((ad, index) => {
                                        const badge = categoryBadgeStyle(ad.category);
                                        return (
                                            <tr
                                                key={ad.id}
                                                style={{
                                                    borderBottom: index < ads.length - 1 ? '1px solid var(--border-glass)' : 'none',
                                                    transition: 'background 0.2s ease',
                                                }}
                                            >
                                                <td style={{ padding: '14px 18px', width: '180px' }}>
                                                    <img
                                                        src={ad.imageUrl}
                                                        alt={ad.title}
                                                        style={{ width: '140px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-glass)', background: '#111' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/140x40/1a1d24/a0a5b1?text=Error+Imagen';
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {ad.title}
                                                    <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 400, marginTop: '2px' }}>
                                                        ID: {ad.id}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '4px 10px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            backgroundColor: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}55`,
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 18px', maxWidth: '200px' }}>
                                                    <a
                                                        href={ad.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'var(--accent-main)', textDecoration: 'underline', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}
                                                    >
                                                        {ad.linkUrl}
                                                    </a>
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    #{ad.priority}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
