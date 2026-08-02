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

    useEffect(() => {
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

            // Send to backend
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub }) // Add userId if auth is fully integrated
            });

            setIsSubscribed(true);
            alert('¡Alertas activadas con éxito! Recibirás notificaciones en tiempo real.');
        } catch (err) {
            console.error('Error al suscribir:', err);
            alert('Error al activar notificaciones. Asegúrate de dar permisos en tu navegador.');
        }
        setLoading(false);
    };

    if (!supported) return <p className="text-sm text-gray-500">Notificaciones Push no soportadas en este navegador.</p>;

    return (
        <div className="glass-panel p-4 flex items-center justify-between mt-4 border border-[var(--glass-border)]">
            <div>
                <h3 className="text-[var(--text-primary)] font-bold text-lg flex items-center gap-2">
                    Notificaciones en Tiempo Real
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Recibe alertas inmediatas si alguien encuentra algo cerca.
                </p>
            </div>
            <button
                onClick={handleSubscribe}
                disabled={isSubscribed || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isSubscribed 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'btn-primary'
                }`}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (isSubscribed ? <Bell size={16} /> : <BellOff size={16} />)}
                {isSubscribed ? 'Activadas' : 'Activar Alertas'}
            </button>
        </div>
    );
}
