'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Info, CheckCircle, Eye, Search, MessageSquare, Send, Edit } from 'lucide-react';

export default function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Match Claim state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const [matchPhoto, setMatchPhoto] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sighting state
  const [showSightingModal, setShowSightingModal] = useState(false);
  const [sightingPhoto, setSightingPhoto] = useState<File | null>(null);
  const [sightingComment, setSightingComment] = useState('');
  const [isSightingUploading, setIsSightingUploading] = useState(false);
  const sightingFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setComments(data.report.comments || []);
        
        // Verify ownership
        const myReports = JSON.parse(localStorage.getItem('my_panoptes_reports') || '[]');
        if (myReports.includes(data.report.id) || myReports.includes(data.report.creatorId)) {
          setIsOwner(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/reports/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, author: 'Usuario' })
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitSighting = async () => {
    setIsSightingUploading(true);
    try {
      // Pedir ubicación
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          let uploadedPhotoUrl = null;
          if (sightingPhoto) {
            const formData = new FormData();
            formData.append('file', sightingPhoto);
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadData.url) uploadedPhotoUrl = uploadData.url;
          }

          const claimRes = await fetch(`/api/reports/${id}/sightings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude, photoUrl: uploadedPhotoUrl, comment: sightingComment })
          });
          const claimData = await claimRes.json();
          if (claimData.success) {
            // Guardar en el historial local del usuario
            const mySightings = JSON.parse(localStorage.getItem('my_panoptes_sightings') || '[]');
            if (!mySightings.includes(id)) {
              mySightings.push(id);
              localStorage.setItem('my_panoptes_sightings', JSON.stringify(mySightings));
            }

            setShowSightingModal(false);
            setSightingPhoto(null);
            setSightingComment('');
            fetchReport(); // reload
            alert('¡Gracias! El avistamiento ha sido registrado en el mapa.');
          }
          setIsSightingUploading(false);
        },
        (error) => {
          console.error(error);
          alert('Debes permitir el acceso a la ubicación para reportar un avistamiento.');
          setIsSightingUploading(false);
        }
      );
    } catch (e) {
      console.error(e);
      alert('Error al enviar avistamiento');
      setIsSightingUploading(false);
    }
  };

  const submitMatchClaim = async () => {
    if (!matchPhoto) return alert('Debes adjuntar una foto del hallazgo.');
    setIsUploading(true);

    try {
      // 1. Upload photo
      const formData = new FormData();
      formData.append('file', matchPhoto);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.url) {
        // 2. Submit Claim
        const claimRes = await fetch(`/api/reports/${id}/matches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: matchMessage, photoUrl: uploadData.url })
        });
        const claimData = await claimRes.json();
        if (claimData.success) {
          // Guardar en el historial local del usuario
          const myMatches = JSON.parse(localStorage.getItem('my_panoptes_matches') || '[]');
          if (!myMatches.includes(id)) {
            myMatches.push(id);
            localStorage.setItem('my_panoptes_matches', JSON.stringify(myMatches));
          }

          setShowMatchModal(false);
          setMatchPhoto(null);
          setMatchMessage('');
          fetchReport(); // reload to get the new claim in state
          alert('¡Probable hallazgo enviado! El creador del reporte será notificado y podrá ver la foto.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error al enviar hallazgo');
    }
    setIsUploading(false);
  };

  const handleResolveCase = async () => {
    if (!confirm('¿Estás seguro de marcar este caso como "Final Feliz"? Esto significa que lo perdido retornó a manos de su dueño. El caso se cerrará y desaparecerá del mapa.')) return;
    setIsResolving(true);
    try {
      const res = await fetch(`/api/reports/${id}/resolve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchReport();
        alert('¡Autoeureka! 🥳 El caso ha sido cerrado y marcado como recuperado por ti mismo.');
      }
    } catch (e) {
      console.error(e);
      alert('Error al cerrar el caso');
    }
    setIsResolving(false);
  };

  const handleDeleteReport = async () => {
    if (!confirm('¿Estás seguro de que deseas ELIMINAR este reporte? Esta acción es irreversible.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        // Remover de localStorage
        const myReports = JSON.parse(localStorage.getItem('my_panoptes_reports') || '[]');
        const updatedReports = myReports.filter((rId: string) => rId !== id);
        localStorage.setItem('my_panoptes_reports', JSON.stringify(updatedReports));
        
        alert('Reporte eliminado exitosamente.');
        router.push('/');
      } else {
        alert('Error al eliminar el reporte: ' + data.error);
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el reporte');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Cargando reporte...</div>;
  }

  if (!report) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Reporte no encontrado.</div>;
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ═══ NAVBAR MINIMALISTA ═══ */}
      <nav style={{
        padding: '16px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(15, 17, 21, 0.75)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <ArrowLeft size={20} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Volver</span>
        </div>
      </nav>

      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        {report.approvalStatus === 'PENDING' && isOwner && (
          <div style={{ 
            padding: '16px', borderRadius: '8px', marginBottom: '24px', 
            background: 'rgba(255,204,0,0.15)', border: '1px solid #ffcc00', color: '#ffcc00',
            display: 'flex', gap: '12px', alignItems: 'flex-start'
          }}>
            <Info size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Pendiente de Endoso y Aprobación</strong>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                Por tratarse de un elemento de alto valor ({report.category}), esta publicación está a la espera de ser validada por un superusuario o administrador antes de ser visible en el mapa público.
              </p>
            </div>
          </div>
        )}
        
        {/* ENCABEZADO */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {(report.photoUrl || (report.photoUrls && report.photoUrls.length > 0)) && (
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <img 
                src={selectedPhoto || report.photoUrl || (report.photoUrls && report.photoUrls[0])} 
                alt="Report Main" 
                onClick={() => window.open(selectedPhoto || report.photoUrl || (report.photoUrls && report.photoUrls[0]), '_blank')}
                style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', cursor: 'pointer', maxHeight: '500px' }} 
                title="Haz clic para ver la imagen completa"
              />
              {report.photoUrls && report.photoUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {report.photoUrl && (
                    <img 
                      src={report.photoUrl} 
                      alt="Thumbnail main" 
                      onClick={() => setSelectedPhoto(report.photoUrl)} 
                      style={{ 
                        height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover', 
                        border: (selectedPhoto === report.photoUrl || (!selectedPhoto && report.photoUrl)) ? '2px solid var(--accent-main)' : '1px solid rgba(255,255,255,0.1)', 
                        cursor: 'pointer', opacity: (selectedPhoto === report.photoUrl || (!selectedPhoto && report.photoUrl)) ? 1 : 0.5 
                      }} 
                    />
                  )}
                  {report.photoUrls.map((url: string, idx: number) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Thumbnail ${idx}`} 
                      onClick={() => setSelectedPhoto(url)} 
                      style={{ 
                        height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover', 
                        border: selectedPhoto === url ? '2px solid var(--accent-main)' : '1px solid rgba(255,255,255,0.1)', 
                        cursor: 'pointer', opacity: selectedPhoto === url ? 1 : 0.5 
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={{ flex: '2 1 300px' }}>
            <div style={{ 
              display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, 
              background: report.type === 'FOUND' ? 'rgba(51, 204, 102, 0.15)' : 'rgba(255, 85, 51, 0.15)',
              color: report.type === 'FOUND' ? '#33cc66' : '#ff5533', marginBottom: '10px'
            }}>
              {report.type === 'FOUND' ? 'ENCONTRADO' : 'PERDIDO'} • {report.category}
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
              {report.category === 'Mascota' ? (
                report.name ? `${report.petType || 'Mascota'}: ${report.name}` : (report.petType || 'Mascota')
              ) : report.category === 'Persona' ? (
                report.name || 'Persona sin identificar'
              ) : report.category === 'Vehículo' ? (
                report.brandModel || 'Vehículo'
              ) : (
                report.description.length > 50 ? report.description.substring(0, 50) + '...' : report.description
              )}
            </h1>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {report.location}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {new Date(report.eventDate).toLocaleString()}</span>
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--accent-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={18} /> Detalles
              </h4>
              {report.category === 'Mascota' && <p><strong>Raza:</strong> {report.breed} | <strong>Color:</strong> {report.color}</p>}
              {report.category === 'Persona' && (
                <>
                  <p><strong>Edad:</strong> {report.ageRange} | <strong>Sexo:</strong> {report.gender} | <strong>Altura:</strong> {report.height}</p>
                  <p><strong>Ropa:</strong> {report.clothing}</p>
                  <p><strong>Cognición:</strong> {report.cognitiveCondition} | <strong>Apariencia:</strong> {report.appearance}</p>
                  <p><strong>Rasgos:</strong> {report.distinctiveFeatures}</p>
                </>
              )}
              {report.category === 'Vehículo' && <p><strong>Placa:</strong> {report.licensePlate} | <strong>Color:</strong> {report.color}</p>}
              <p style={{ marginTop: '10px' }}><strong>Descripción:</strong> {report.description}</p>
            </div>

            {/* BOTONES O BANNER DE ESTADO */}
            {report.status === 'RESOLVED' ? (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(51, 204, 102, 0.15)', border: '1px solid #33cc66', borderRadius: '8px', color: '#33cc66', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={24} /> ¡Este caso ha sido resuelto felizmente!
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                {!isOwner && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowMatchModal(true)}
                    style={{ flex: 1, padding: '15px', fontSize: '1.1rem', background: '#33cc66', color: '#111', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Search size={20} /> ¡EUREKA! (Lo encontré)
                  </button>
                )}
                {report.type === 'LOST' && ['Mascota', 'Persona', 'Vehículo'].includes(report.category) && !isOwner && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowSightingModal(true)}
                    style={{ flex: 1, padding: '15px', fontSize: '1.1rem', background: '#3b82f6', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Eye size={20} /> ¡Creo que lo vi!
                  </button>
                )}
                {isOwner && report.type === 'LOST' && (
                  <button 
                    className="btn-primary" 
                    onClick={handleResolveCase}
                    disabled={isResolving}
                    style={{ flex: 1, padding: '15px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #ff9900, #ffcc00)', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(255, 204, 0, 0.3)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '12px', transition: 'all 0.3s ease' }}
                  >
                    <CheckCircle size={20} /> {isResolving ? 'Resolviendo...' : '🎯 Autoeureka (Lo encontré)'}
                  </button>
                )}
                {isOwner && (
                  <>
                    <button 
                      className="btn-primary" 
                      onClick={() => router.push(`/reporte/${id}/editar`)}
                      style={{ flex: 1, padding: '15px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Edit size={20} /> Editar Publicación
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleDeleteReport}
                      disabled={isDeleting}
                      style={{ flex: 1, padding: '15px', fontSize: '1.1rem', background: 'rgba(255,50,50,0.1)', border: '1px solid #ff3c3c', color: '#ff3c3c', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Edit size={20} /> {isDeleting ? 'Eliminando...' : 'Eliminar Reporte'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

        {/* TRAYECTORIA DE AVISTAMIENTOS (SOLO DUEÑO O INDICADOR) */}
        {report.type === 'LOST' && ['Mascota', 'Persona', 'Vehículo'].includes(report.category) && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={24} color="#3b82f6" /> Ruta de Avistamientos
              <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '1rem' }}>
                {report.sightings?.length || 0}
              </span>
            </h3>
            
            {report.sightings?.length > 0 ? (
              isOwner ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  {report.sightings.map((sighting: any, idx: number) => (
                    <div key={sighting.id} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px' }}>
                      {sighting.photoUrl && (
                        <img src={sighting.photoUrl} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      )}
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Avistamiento #{report.sightings.length - idx} • {new Date(sighting.createdAt).toLocaleString()}
                        </p>
                        <p style={{ marginTop: '5px' }}><strong>GPS:</strong> {sighting.latitude}, {sighting.longitude}</p>
                        {sighting.comment && <p style={{ marginTop: '5px' }}>{sighting.comment}</p>}
                        <a href={`https://www.google.com/maps/search/?api=1&query=${sighting.latitude},${sighting.longitude}`} target="_blank" style={{ color: '#3b82f6', fontSize: '0.85rem', marginTop: '10px', display: 'inline-block' }}>Abrir en Maps</a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                  <p>📍 Se han reportado {report.sightings.length} avistamientos en movimiento. <strong>Por motivos de seguridad, la ruta exacta solo es visible para el creador del reporte.</strong></p>
                </div>
              )
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Aún no hay avistamientos en movimiento para este caso.</p>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />
          </div>
        )}

        {/* MATCH CLAIMS (SOLO DUEÑO O INDICADOR) */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={24} color="#33cc66" /> Posibles Hallazgos
            <span style={{ background: '#ffcc00', color: '#000', padding: '2px 10px', borderRadius: '20px', fontSize: '1rem' }}>
              {report.matchClaims?.length || 0}
            </span>
          </h3>
          
          {report.matchClaims?.length > 0 ? (
            isOwner ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {report.matchClaims.map((claim: any) => (
                  <div key={claim.id} style={{ background: 'rgba(51, 204, 102, 0.1)', border: '1px solid #33cc66', padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px' }}>
                    <img src={claim.photoUrl} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(claim.createdAt).toLocaleString()}</p>
                      <p style={{ marginTop: '5px' }}>{claim.message || 'Sin mensaje'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', background: 'rgba(255,204,0,0.1)', borderLeft: '4px solid #ffcc00', borderRadius: '4px' }}>
                <p>⚠️ Se han reportado {report.matchClaims.length} probables hallazgos para este caso. <strong>Por motivos de privacidad, las fotografías aportadas solo pueden ser vistas por el creador del reporte original.</strong></p>
              </div>
            )
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Aún no hay probables hallazgos reportados para este caso.</p>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

        {/* COMENTARIOS PÚBLICOS */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} /> Comentarios
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Escribe un comentario público o pista..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePostComment}>
              <Send size={16} /> Comentar
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map((c: any) => (
              <div key={c.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  <strong>{c.author}</strong> • {new Date(c.createdAt).toLocaleString()}
                </div>
                <p style={{ margin: 0 }}>{c.text}</p>
              </div>
            ))}
            {comments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Sé el primero en comentar.</p>}
          </div>
        </div>

      </section>

      {/* MODAL AVISTAMIENTO RAPIDO (CREO QUE LO VI) */}
      {showSightingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <h2 style={{ color: '#3b82f6', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={24} /> Creo que lo vi
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Al enviar, capturaremos tu ubicación actual para crear una ruta de rastreo. Puedes agregar una foto rápida opcional.
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Foto rápida (Opcional)</label>
              <input 
                type="file" 
                accept="image/*" 
                ref={sightingFileInputRef} 
                onChange={(e) => setSightingPhoto(e.target.files?.[0] || null)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Nota (Opcional)</label>
              <textarea 
                className="input-glass"
                placeholder="Iba caminando rápido hacia el norte..."
                value={sightingComment}
                onChange={(e) => setSightingComment(e.target.value)}
                style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowSightingModal(false)}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={submitSighting}
                disabled={isSightingUploading}
                className="btn-primary"
                style={{ background: '#3b82f6', color: '#fff' }}
              >
                {isSightingUploading ? 'Obteniendo GPS y Enviando...' : 'Enviar Mi Ubicación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROBABLE HALLAZGO */}

      {showMatchModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <h2 style={{ color: '#33cc66', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={24} /> Reportar Probable Hallazgo
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Tu aporte es vital. <strong>La fotografía que subas será estrictamente confidencial</strong> y solo podrá ser vista por el dueño original del reporte para proteger la privacidad.
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Evidencia Fotográfica (Requerida)</label>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={(e) => setMatchPhoto(e.target.files?.[0] || null)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Mensaje Opcional</label>
              <textarea 
                className="input-glass"
                placeholder="Ej. Lo vi cerca del parque principal..."
                value={matchMessage}
                onChange={(e) => setMatchMessage(e.target.value)}
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowMatchModal(false)}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={submitMatchClaim}
                disabled={isUploading || !matchPhoto}
                className="btn-primary"
                style={{ background: '#33cc66', color: '#111' }}
              >
                {isUploading ? 'Enviando...' : 'Enviar Evidencia'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
