'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('sergio@bochica.network');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();

  const handleLoginOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMsg('Verificando cuenta...');

    try {
      // 1. Obtener opciones de autenticación
      const authGenRes = await fetch('/api/auth/webauthn/auth/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const authGenData = await authGenRes.json();

      if (!authGenRes.ok) {
        throw new Error(authGenData.error || 'Error al conectar con la cuenta');
      }

      // Si el usuario ya tiene autenticadores registrados, iniciar flujo de autenticación (Passkey)
      if (authGenData.hasAuthenticators && authGenData.allowCredentials?.length > 0) {
        setStatusMsg('Por favor confirma con tu Huella / FaceID / Passkey...');
        const authResponse = await startAuthentication({ optionsJSON: authGenData });

        setStatusMsg('Verificando credenciales...');
        const authVerifyRes = await fetch('/api/auth/webauthn/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, response: authResponse }),
        });

        const authVerifyData = await authVerifyRes.json();

        if (!authVerifyRes.ok || !authVerifyData.verified) {
          throw new Error(authVerifyData.error || 'Error en la verificación de Passkey');
        }

        setStatusMsg('¡Autenticado con éxito! Redirigiendo...');
        router.push('/admin');
        return;
      }

      // 2. Si no tiene passkeys registrados, iniciar registro del nuevo Passkey
      setStatusMsg('Registrando nuevo Passkey para Genesis Admin...');
      const regGenRes = await fetch('/api/auth/webauthn/register/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const regGenData = await regGenRes.json();

      if (!regGenRes.ok) {
        throw new Error(regGenData.error || 'Error al generar opciones de registro');
      }

      setStatusMsg('Interactúa con tu dispositivo para registrar tu Passkey...');
      const regResponse = await startRegistration({ optionsJSON: regGenData });

      setStatusMsg('Guardando Passkey en la base de datos...');
      const regVerifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: regResponse }),
      });

      const regVerifyData = await regVerifyRes.json();

      if (!regVerifyRes.ok || !regVerifyData.verified) {
        throw new Error(regVerifyData.error || 'Error al guardar la Passkey');
      }

      // Ahora que se registró, hacer login de inmediato
      setStatusMsg('Passkey registrada. Iniciando sesión...');
      const authGenRes2 = await fetch('/api/auth/webauthn/auth/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const authGenData2 = await authGenRes2.json();

      if (!authGenRes2.ok) {
        throw new Error(authGenData2.error || 'Error al generar login posterior al registro');
      }

      const authResponse2 = await startAuthentication({ optionsJSON: authGenData2 });
      const authVerifyRes2 = await fetch('/api/auth/webauthn/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: authResponse2 }),
      });

      const authVerifyData2 = await authVerifyRes2.json();
      if (authVerifyRes2.ok && authVerifyData2.verified) {
        setStatusMsg('¡Bienvenido Genesis Admin! Redirigiendo...');
        router.push('/admin');
      } else {
        throw new Error('Error al iniciar sesión después del registro');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f1115',
      color: '#f2f3f5',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '8px'
          }}>🔑</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Panoptes Genesis Admin</h1>
          <p style={{ color: '#a0a5b1', fontSize: '0.9rem', marginTop: '6px' }}>
            Autenticación segura mediante Passkeys (WebAuthn)
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {statusMsg && !error && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#93c5fd',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '20px'
          }}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleLoginOrRegister}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: '#a0a5b1' }}>
              Correo de Administrador Genesis
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#ff7e33',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Procesando...' : 'Iniciar Sesión con Passkey'}
          </button>
        </form>
      </div>
    </div>
  );
}
