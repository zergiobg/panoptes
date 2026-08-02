'use client';
import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGd9xIiNvj1TS6CLUz9SPB1Ev79WnzqhwoPoW12Ll5z6QoiYSy6-D9PBEBWRH5PG1EICQSjKg1VbR1_ikWgDQr8';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [supported, setSupported] = useState(true);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setSupported(false);
            return;
        }
        navigator.serviceWorker.ready.then((reg) => {
            reg.pushManager.getSubscription().then((sub) => {
                if (sub) setIsSubscribed(true);
            });
        });
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Retrieve userId from localStorage or cookie if auth is integrated
            const userId = localStorage.getItem('panoptes_user_id') || undefined;

            // Send to backend
            const res = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub, userId })
            });

            if (!res.ok) throw new Error('Failed to save subscription');

            setIsSubscribed(true);
            alert('¡Alertas activadas con éxito! Recibirás notificaciones en tiempo real.');
        } catch (err) {
            console.error('Error al suscribir:', err);
            if (isIOS) {
                alert('Error en iOS: Asegúrate de haber añadido Panoptes a tu "Pantalla de Inicio" antes de activar las notificaciones.');
            } else {
                alert('Error al activar notificaciones. Asegúrate de dar permisos en tu navegador.');
            }
        }
        setLoading(false);
    };

    if (!supported) return <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Notificaciones Push no soportadas en este navegador.</p>;

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ flex: '1 1 250px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={24} color="var(--accent-main)" /> Notificaciones en Tiempo Real
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Recibe alertas inmediatas si alguien encuentra o reporta algo cerca de tu ubicación.
                </p>
            </div>
            <button
                onClick={handleSubscribe}
                disabled={isSubscribed || loading}
                className={isSubscribed ? '' : 'btn-primary'}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: (isSubscribed || loading) ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                    background: isSubscribed ? 'rgba(51, 204, 102, 0.2)' : undefined,
                    color: isSubscribed ? '#33cc66' : undefined,
                    border: isSubscribed ? '1px solid rgba(51, 204, 102, 0.4)' : 'none',
                }}
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (isSubscribed ? <Bell size={20} /> : <BellOff size={20} />)}
                {isSubscribed ? 'Alertas Activadas' : 'Activar Alertas'}
            </button>

            {isIOS && !isSubscribed && (
                <div style={{ flexBasis: '100%', marginTop: '10px', padding: '12px', background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#ffaa00' }}>
                        <strong>📱 Importante en iPhone/iPad:</strong> Para poder recibir notificaciones, primero debes tocar el botón de "Compartir" de Safari y elegir <strong>"Añadir a inicio"</strong>. Luego, abre la aplicación desde tu pantalla de inicio y activa las alertas.
                    </p>
                </div>
            )}
        </div>
    );
}
