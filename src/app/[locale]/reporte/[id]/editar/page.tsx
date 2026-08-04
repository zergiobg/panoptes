'use client';
import { useState, useRef, useEffect, use } from 'react';
import { Camera, CheckCircle, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Form state
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  // Specific fields
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [name, setName] = useState('');
  const [petType, setPetType] = useState('');
  const [breed, setBreed] = useState('');
  const [clothing, setClothing] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();
      if (data.success) {
        // Verificar si es dueño
        const myReports = JSON.parse(localStorage.getItem('my_panoptes_reports') || '[]');
        if (!myReports.includes(data.report.id) && !myReports.includes(data.report.creatorId)) {
          alert('No tienes permiso para editar este reporte.');
          router.push(`/reporte/${id}`);
          return;
        }

        setReport(data.report);
        setPhotoUrl(data.report.photoUrl || '');
        setPhotoUrls(data.report.photoUrls || []);
        setDescription(data.report.description || '');
        setColor(data.report.color || '');
        setLicensePlate(data.report.licensePlate || '');
        setBrandModel(data.report.brandModel || '');
        setName(data.report.name || '');
        setPetType(data.report.petType || '');
        setBreed(data.report.breed || '');
        setClothing(data.report.clothing || '');
        setDistinctiveFeatures(data.report.distinctiveFeatures || '');
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !report) return;

    setSaving(true);
    const maxPhotos = ['Persona', 'Vehículo', 'Mascota'].includes(report.category) ? 4 : 1;
    const currentCount = photoUrls.length + (photoUrl ? 1 : 0);
    const availableSlots = maxPhotos - currentCount;
    
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        return data.success ? data.url : null;
      });

      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter(url => url !== null) as string[];

      if (validUrls.length > 0) {
        if (!photoUrl) {
          setPhotoUrl(validUrls[0]);
          if (validUrls.length > 1) {
            setPhotoUrls(prev => [...prev, ...validUrls.slice(1)]);
          }
        } else {
          setPhotoUrls(prev => [...prev, ...validUrls]);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  const removePhoto = (idx: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
  };
  const removeMainPhoto = () => {
    if (photoUrls.length > 0) {
      setPhotoUrl(photoUrls[0]);
      setPhotoUrls(prev => prev.slice(1));
    } else {
      setPhotoUrl('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT',
          data: {
            description,
            photoUrl,
            photoUrls,
            color,
            clothing,
            name,
            distinctiveFeatures,
            petType,
            breed,
            licensePlate,
            brandModel
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/reporte/${id}`);
      } else {
        alert('Error al guardar cambios');
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar cambios');
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Cargando datos...</div>;
  }

  if (!report) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Reporte no encontrado</div>;
  }

  const isMultiPhoto = ['Persona', 'Vehículo', 'Mascota'].includes(report.category);

  return (
    <main style={{ minHeight: '100vh', padding: '100px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel animate-up" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => router.push(`/reporte/${id}`)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Editar <span style={{ color: 'var(--accent-main)' }}>Publicación</span>
          </h1>
        </div>

        {/* PHOTOS */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Fotos {isMultiPhoto ? '(Máx 4)' : '(Máx 1)'}</label>
          
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {photoUrl && (
              <div style={{ position: 'relative' }}>
                <img src={photoUrl} alt="Main" style={{ height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                <button onClick={removeMainPhoto} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
              </div>
            )}
            {photoUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt={`Extra ${i+1}`} style={{ height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
              </div>
            ))}

            {((isMultiPhoto && photoUrls.length + (photoUrl ? 1 : 0) < 4) || (!isMultiPhoto && !photoUrl)) && (
              <div 
                style={{ height: '120px', width: '120px', borderRadius: '8px', border: '2px dashed var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0, cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {saving ? '...' : <Camera size={24} />}
              </div>
            )}
          </div>
          <input type="file" accept="image/*" multiple={isMultiPhoto} ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        </div>

        {/* DETAILS */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descripción</label>
          <textarea 
            className="input-glass" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {report.category === 'Vehículo' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Placa</label>
              <input type="text" className="input-glass" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Color</label>
              <input type="text" className="input-glass" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </>
        )}

        {report.category === 'Persona' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Nombre</label>
              <input type="text" className="input-glass" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Ropa</label>
              <input type="text" className="input-glass" value={clothing} onChange={(e) => setClothing(e.target.value)} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Rasgos Distintivos</label>
              <input type="text" className="input-glass" value={distinctiveFeatures} onChange={(e) => setDistinctiveFeatures(e.target.value)} />
            </div>
          </>
        )}

        {report.category === 'Mascota' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Nombre</label>
              <input type="text" className="input-glass" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Color(es)</label>
              <input type="text" className="input-glass" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </>
        )}

        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>

      </div>
    </main>
  );
}
