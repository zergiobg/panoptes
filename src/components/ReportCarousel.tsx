"use client";

import React, { useEffect, useState } from 'react';

interface Report {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
  imageUrl?: string;
}

export default function ReportCarousel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Simulate fetching from /api/reports
    const fetchReports = async () => {
      try {
        // const res = await fetch('/api/reports');
        // const data = await res.json();
        // setReports(data);
        
        // Dummy data for visual representation
        setReports([
          {
            id: '1',
            title: 'Lost Golden Retriever',
            description: 'Friendly golden retriever lost near Central Park. Wearing a red collar.',
            date: '2026-08-01',
            status: 'Lost',
            imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800'
          },
          {
            id: '2',
            title: 'Found Keys',
            description: 'Set of car keys found at the coffee shop downtown.',
            date: '2026-07-31',
            status: 'Found',
            imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800'
          },
          {
            id: '3',
            title: 'Lost Wallet',
            description: 'Brown leather wallet lost somewhere on 5th Avenue.',
            date: '2026-07-30',
            status: 'Lost',
            imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'
          }
        ]);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };

    fetchReports();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reports.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reports.length) % reports.length);
  };

  if (reports.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando reportes...</p>
      </div>
    );
  }

  const currentReport = reports[currentIndex];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Glassmorphism Container */}
      <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          overflow: 'hidden', 
          borderRadius: 'var(--radius-lg)', 
          minHeight: '400px',
          position: 'relative'
        }}>
        
        {/* Image Section */}
        <div style={{ flex: '1 1 300px', position: 'relative', minHeight: '300px' }}>
          {currentReport.imageUrl ? (
            <img 
              src={currentReport.imageUrl} 
              alt={currentReport.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sin Imagen</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
            <span style={{
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: 'bold', 
                textTransform: 'uppercase', 
                backgroundColor: currentReport.status === 'Lost' ? 'rgba(255, 60, 60, 0.8)' : 'rgba(51, 204, 102, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(4px)'
              }}>
              {currentReport.status === 'Lost' ? 'Perdido' : 'Encontrado'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ flex: '1 1 300px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--accent-main)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
            {new Date(currentReport.date).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '15px', lineHeight: '1.2' }}>
            {currentReport.title}
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '30px' }}>
            {currentReport.description}
          </p>

          <div>
            <button className="btn-primary">
              Ver Detalles
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <button 
          onClick={prevSlide}
          style={{
            position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%',
            width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          &#10094;
        </button>
        
        <button 
          onClick={nextSlide}
          style={{
            position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%',
            width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          &#10095;
        </button>

        {/* Indicators */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {reports.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? '24px' : '10px',
                height: '10px',
                borderRadius: '10px',
                border: 'none',
                background: idx === currentIndex ? 'var(--accent-main)' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
