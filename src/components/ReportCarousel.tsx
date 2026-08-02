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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const currentReport = reports[currentIndex];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Glassmorphism Container */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl transition-all duration-500 hover:bg-white/15">
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-64 md:h-96 relative overflow-hidden group">
            {currentReport.imageUrl ? (
              <img 
                src={currentReport.imageUrl} 
                alt={currentReport.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <span className="text-slate-500">No Image</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                currentReport.status === 'Lost' ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'
              }`}>
                {currentReport.status}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center space-y-6 relative">
            <div className="space-y-2">
              <p className="text-emerald-400 text-sm font-medium tracking-wide">
                {new Date(currentReport.date).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <h2 className="text-3xl font-bold text-white leading-tight">
                {currentReport.title}
              </h2>
            </div>
            
            <p className="text-slate-300 leading-relaxed">
              {currentReport.description}
            </p>

            <button className="self-start mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10 backdrop-blur-sm flex items-center gap-2">
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {reports.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-emerald-400 w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
