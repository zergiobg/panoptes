import ReportCarousel from '../components/ReportCarousel';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '60px 20px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Header Section */}
        <header style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/panoptes_logo.png" alt="Panoptes Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px', color: 'var(--text-primary)' }}>
            Reportes Recientes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Mantente informado con los hallazgos y elementos perdidos reportados por la red Panoptes.
          </p>
          
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link href="/reportar" className="btn-primary" style={{ textDecoration: 'none' }}>
              Reportar Hallazgo / Pérdida
            </Link>
            <Link href="/map" className="glass-panel" style={{ padding: '12px 24px', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              Ver Mapa
            </Link>
          </div>
        </header>

        {/* Carousel Section */}
        <section style={{ padding: '40px 0' }}>
          <ReportCarousel />
        </section>
      </div>
    </main>
  );
}
