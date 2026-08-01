'use client';

import { useState, useEffect, CSSProperties } from 'react';

export interface Ad {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    category: 'PET' | 'PERSON' | 'THING' | 'GENERAL';
    priority: number;
}

export interface AdBannerProps {
    context?: 'PET' | 'PERSON' | 'THING' | 'GENERAL';
    style?: CSSProperties;
    className?: string;
}

export default function AdBanner({ context = 'GENERAL', style, className }: AdBannerProps) {
    const [ads, setAds] = useState<Ad[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchAds = async () => {
            setLoading(true);
            try {
                const url = context ? `/api/ads?context=${encodeURIComponent(context)}` : '/api/ads';
                const res = await fetch(url);
                const data = await res.json();
                if (isMounted && data.ads && Array.isArray(data.ads) && data.ads.length > 0) {
                    setAds(data.ads);
                    setCurrentIndex(0);
                }
            } catch (err) {
                console.error('Error al cargar anuncios para el banner:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAds();

        return () => {
            isMounted = false;
        };
    }, [context]);

    // Timer for cycling ads every 8 seconds with fade transition
    useEffect(() => {
        if (ads.length <= 1) return;

        const timer = setInterval(() => {
            setFade(false); // Begin fade out
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % ads.length);
                setImageError(false);
                setFade(true); // Fade back in
            }, 350);
        }, 8000);

        return () => clearInterval(timer);
    }, [ads.length]);

    if (loading) {
        return (
            <div
                className={`glass-panel ${className || ''}`}
                style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    minHeight: '110px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    ...style,
                }}
            >
                Cargando publicidad...
            </div>
        );
    }

    if (ads.length === 0) {
        return null; // Return nothing if no ads available
    }

    const currentAd = ads[currentIndex];

    const categoryLabel: Record<string, string> = {
        PET: '🐾 Mascotas',
        PERSON: '👤 Personas',
        THING: '📦 Objetos',
        GENERAL: '🌐 Red Panoptes',
    };

    return (
        <div
            className={`glass-panel ${className || ''}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                background: 'rgba(25, 28, 35, 0.65)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                transition: 'border-color 0.3s ease',
                ...style,
            }}
        >
            {/* Header sub-bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    fontSize: '0.75rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            background: 'rgba(255, 126, 51, 0.15)',
                            color: 'var(--accent-main)',
                            border: '1px solid rgba(255, 126, 51, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                        }}
                    >
                        Patrocinado
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {categoryLabel[currentAd.category] || currentAd.category}
                    </span>
                </div>

                {/* Dot navigation indicators */}
                {ads.length > 1 && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {ads.map((ad, idx) => (
                            <button
                                key={ad.id}
                                onClick={() => {
                                    setFade(false);
                                    setTimeout(() => {
                                        setCurrentIndex(idx);
                                        setImageError(false);
                                        setFade(true);
                                    }, 200);
                                }}
                                title={`Anuncio ${idx + 1}: ${ad.title}`}
                                style={{
                                    width: idx === currentIndex ? '16px' : '6px',
                                    height: '6px',
                                    borderRadius: '3px',
                                    backgroundColor: idx === currentIndex ? 'var(--accent-main)' : 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Main banner link & content */}
            <a
                href={currentAd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    opacity: fade ? 1 : 0,
                    transform: fade ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out',
                }}
            >
                {!imageError ? (
                    <div
                        style={{
                            width: '100%',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            marginBottom: '8px',
                            background: '#15181e',
                        }}
                    >
                        <img
                            src={currentAd.imageUrl}
                            alt={currentAd.title}
                            onError={() => setImageError(true)}
                            style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px border var(--border-glass)',
                            marginBottom: '8px',
                            textAlign: 'center',
                        }}
                    >
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            {currentAd.title}
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <p
                        style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {currentAd.title}
                    </p>
                    <span
                        style={{
                            fontSize: '0.78rem',
                            color: 'var(--accent-main)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        Ver más →
                    </span>
                </div>
            </a>
        </div>
    );
}
