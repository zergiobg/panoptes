'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { Camera, CheckCircle, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function ReportarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [type, setType] = useState('FOUND'); // 'FOUND' or 'LOST'
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Nuevos campos
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [vehicleType, setVehicleType] = useState('Automóvil');
  const [name, setName] = useState('');
  const [petType, setPetType] = useState('Perro');
  const [breed, setBreed] = useState('');
  const [clothing, setClothing] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');
  const [cognitiveCondition, setCognitiveCondition] = useState('Normal');
  const [appearance, setAppearance] = useState('Normal');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Masculino');

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) {
      setCategory(cat);
      if (cat === 'Vehículo' || cat === 'Persona' || cat === 'Mascota') {
         setType('LOST'); // Usually reports from quick menu are LOST by default
      }
    }
  }, [searchParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    
    // Si la categoría soporta múltiples imágenes y aún caben más
    const maxPhotos = ['Persona', 'Vehículo', 'Mascota'].includes(category) ? 4 : 1;
    const currentCount = photoUrls.length + (photoUrl ? 1 : 0);
    const availableSlots = maxPhotos - currentCount;
    
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // En Vercel, el sistema de archivos es read-only.
        // Solución robusta para MVP: Comprimir y usar Base64 directamente en BD.
        const base64 = await compressImage(file);
        return base64;
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
      console.error('Error compressing/uploading image:', error);
    }
    setLoading(false);
  };

  const checkAiCategory = async () => {
    if (category === 'Otro') {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: photoUrl, description })
        });
        const data = await res.json();
        if (data.success) {
          setAiSuggestedCategory(data.suggestedCategory);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    setStep(4);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const finalCategory = category === 'Otro' ? (customCategory || aiSuggestedCategory || 'Otro') : category;

    try {
      // Generar un ID único para el creador del reporte
      const creatorId = crypto.randomUUID();

      let finalLat = latitude;
      let finalLng = longitude;

      // Si no tenemos lat/lng pero el usuario escribió una dirección, intentamos geocodificarla
      if ((finalLat === null || finalLng === null) && location.trim() !== '') {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            finalLat = parseFloat(geoData[0].lat);
            finalLng = parseFloat(geoData[0].lon);
          }
        } catch (e) {
          console.error('Error geocoding:', e);
        }
      }

      // Añadir un pequeño offset (aprox 100m = ~0.0009 grados) para proteger la privacidad
      if (finalLat !== null && finalLng !== null) {
        finalLat += (Math.random() - 0.5) * 0.0018;
        finalLng += (Math.random() - 0.5) * 0.0018;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category: finalCategory,
          description,
          location,
          latitude: finalLat,
          longitude: finalLng,
          eventDate: eventDate || new Date().toISOString(),
          photoUrl,
          photoUrls,
          aiSuggestedCategory: category === 'Otro' ? aiSuggestedCategory : null,
          color,
          licensePlate,
          brandModel: category === 'Vehículo' ? `${vehicleType} - ${brandModel}` : brandModel,
          name,
          petType,
          breed,
          clothing,
          ageRange,
          distinctiveFeatures,
          cognitiveCondition,
          height,
          gender,
          appearance,
          creatorId
        })
      });
      const data = await res.json();
      if (data.success) {
        // Guardar la propiedad en LocalStorage (un simple array de IDs)
        const myReports = JSON.parse(localStorage.getItem('my_panoptes_reports') || '[]');
        myReports.push(data.report.id);
        localStorage.setItem('my_panoptes_reports', JSON.stringify(myReports));

        router.push('/');
      } else {
        console.error(data.error);
        alert('Error al publicar: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error inesperado al publicar.');
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel animate-up" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
      
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px', textAlign: 'center' }}>
        Reportar un <span style={{ color: 'var(--accent-main)' }}>Evento</span>
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="radio" name="type" checked={type === 'FOUND'} onChange={() => setType('FOUND')} />
          <span style={{ fontWeight: type === 'FOUND' ? 700 : 400, color: type === 'FOUND' ? 'var(--accent-main)' : 'var(--text-secondary)' }}>Encontré algo</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="radio" name="type" checked={type === 'LOST'} onChange={() => setType('LOST')} />
          <span style={{ fontWeight: type === 'LOST' ? 700 : 400, color: type === 'LOST' ? 'var(--accent-main)' : 'var(--text-secondary)' }}>Perdí algo</span>
        </label>
      </div>

      {/* STEP 1: CATEGORY */}
      {step === 1 && (
        <div className="animate-in">
          <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Paso 1: Categoría</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>¿Qué tipo de hallazgo/pérdida es?</label>
            <select 
              className="input-glass"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Selecciona una opción</option>
              {['Persona', 'Mascota', 'Vehículo', 'Llaves', 'Dispositivos', 'Artículo personal', 'Ropa', 'Documento', 'Otro'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%' }} 
            disabled={!category}
            onClick={() => setStep(2)}
          >
            Continuar <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 2: PHOTO & SPECIFIC FIELDS */}
      {step === 2 && (
        <div className="animate-in">
          <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Paso 2: Foto y Datos Específicos</h2>
          
          <div 
            style={{ 
              border: '2px dashed var(--border-glass)', borderRadius: '12px', padding: '40px', 
              textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', marginBottom: '24px',
              transition: 'border-color 0.3s'
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
          >
            {loading ? (
              <div className="pulse">Subiendo imagen...</div>
            ) : photoUrl ? (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                <img src={photoUrl} alt="Preview" style={{ height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                {photoUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Preview ${i+1}`} style={{ height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                ))}
                {['Persona', 'Vehículo', 'Mascota'].includes(category) && (photoUrls.length + (photoUrl ? 1 : 0) < 4) && (
                   <div style={{ height: '120px', width: '120px', borderRadius: '8px', border: '1px dashed var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                     + Agregar
                   </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                <Camera size={48} style={{ margin: '0 auto 10px' }} />
                Haz clic para subir foto {['Persona', 'Vehículo', 'Mascota'].includes(category) ? '(Máx 4)' : '(Opcional)'}
              </div>
            )}
          </div>
          <input type="file" accept="image/*" multiple={['Persona', 'Vehículo', 'Mascota'].includes(category)} ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          
          {category === 'Vehículo' && (
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#ffaa00' }}>Detalles del Vehículo</h3>
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Tipo de Vehículo</label>
                 <select className="input-glass" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                   <option value="Automóvil">Automóvil</option>
                   <option value="Bicicleta">Bicicleta</option>
                   <option value="Moto">Moto</option>
                   <option value="Scooter">Scooter</option>
                 </select>
               </div>
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Placa</label>
                 <input type="text" className="input-glass" placeholder="Ej. ABC-123 (Vacío si no aplica)" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
               </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Marca y Modelo</label>
                <input type="text" className="input-glass" placeholder="Ej. Toyota Corolla" value={brandModel} onChange={(e) => setBrandModel(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Color</label>
                <input type="text" className="input-glass" placeholder="Ej. Rojo" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
          )}

          {category === 'Mascota' && (
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#ff3333' }}>Detalles de la Mascota</h3>
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Tipo de Mascota</label>
                 <select className="input-glass" value={petType} onChange={(e) => setPetType(e.target.value)}>
                   <option value="Perro">Perro</option>
                   <option value="Gato">Gato</option>
                   <option value="Ave">Ave</option>
                   <option value="Otro">Otro</option>
                 </select>
               </div>
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Nombre (Si lo sabes)</label>
                 <input type="text" className="input-glass" placeholder="Ej. Firulais" value={name} onChange={(e) => setName(e.target.value)} />
               </div>
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Raza</label>
                 <input type="text" className="input-glass" placeholder="Ej. Labrador" value={breed} onChange={(e) => setBreed(e.target.value)} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Color(es)</label>
                 <input type="text" className="input-glass" placeholder="Ej. Blanco con manchas negras" value={color} onChange={(e) => setColor(e.target.value)} />
               </div>
             </div>
          )}

          {category === 'Persona' && (
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#ff3333' }}>Detalles de la Persona</h3>
               
               <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Nombre</label>
                   <input type="text" className="input-glass" placeholder="Opcional" value={name} onChange={(e) => setName(e.target.value)} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Sexo</label>
                   <select className="input-glass" value={gender} onChange={(e) => setGender(e.target.value)}>
                     <option value="Masculino">Masculino</option>
                     <option value="Femenino">Femenino</option>
                     <option value="Otro">Otro</option>
                   </select>
                 </div>
               </div>

               <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Rango de Edad</label>
                   <input type="text" className="input-glass" placeholder="Ej. 70-80 años" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Estatura</label>
                   <input type="text" className="input-glass" placeholder="Ej. 1.70m" value={height} onChange={(e) => setHeight(e.target.value)} />
                 </div>
               </div>

               <div style={{ marginBottom: '12px' }}>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Ropa que llevaba puesta</label>
                 <input type="text" className="input-glass" placeholder="Ej. Chaqueta azul, pantalón negro" value={clothing} onChange={(e) => setClothing(e.target.value)} />
               </div>

               <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Condición Cognitiva</label>
                   <select className="input-glass" value={cognitiveCondition} onChange={(e) => setCognitiveCondition(e.target.value)}>
                     <option value="Normal">Ninguna / Normal</option>
                     <option value="Neurodivergente">Neurodivergente</option>
                     <option value="Síndrome de Down">Síndrome de Down</option>
                     <option value="Demencia">Demencia</option>
                     <option value="Alzheimer">Alzheimer</option>
                     <option value="Otra">Otra</option>
                   </select>
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Apariencia (Movilidad)</label>
                   <select className="input-glass" value={appearance} onChange={(e) => setAppearance(e.target.value)}>
                     <option value="Normal">Normal</option>
                     <option value="Discapacidad Motriz">Discapacidad Motriz</option>
                   </select>
                 </div>
               </div>

               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Rasgos Distintivos</label>
                 <input type="text" className="input-glass" placeholder="Ej. Tatuaje en el brazo, cicatriz, etc." value={distinctiveFeatures} onChange={(e) => setDistinctiveFeatures(e.target.value)} />
               </div>
             </div>
          )}

          {category !== 'Vehículo' && category !== 'Mascota' && category !== 'Persona' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Color principal (Opcional)</label>
                 <input type="text" className="input-glass" placeholder="Ej. Negro con blanco" value={color} onChange={(e) => setColor(e.target.value)} />
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Marca (Opcional)</label>
                 <input type="text" className="input-glass" placeholder="Ej. Apple, Samsung, Ray-Ban..." value={brandModel} onChange={(e) => setBrandModel(e.target.value)} />
               </div>
             </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: '#fff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Atrás
            </button>
            <button className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(3)}>
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS & LOCATION */}
      {step === 3 && (
        <div className="animate-in">
          <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Paso 3: Detalles y Ubicación</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descripción</label>
            <textarea 
              className="input-glass" 
              placeholder="Describe detalles adicionales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Ubicación (Ciudad, País)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                className="input-glass" 
                style={{ flex: 1 }}
                placeholder="Ej. Bogotá, Colombia"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button 
                className="btn-primary" 
                style={{ padding: '0 16px', fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)' }}
                onClick={() => {
                  if (navigator.geolocation) {
                    setLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        try {
                          setLatitude(pos.coords.latitude);
                          setLongitude(pos.coords.longitude);
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                          const data = await res.json();
                          const address = data.address;
                          const street = address.road || address.pedestrian || address.street || '';
                          const houseNumber = address.house_number || '';
                          const city = address.city || address.town || address.village || 'Ciudad desconocida';
                          const country = address.country || 'País desconocido';
                          
                          const fullAddress = [street, houseNumber, city, country].filter(Boolean).join(', ');
                          setLocation(fullAddress);
                        } catch (err) {
                          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                        }
                        setLoading(false);
                      },
                      (err) => {
                        alert('No pudimos acceder a tu ubicación');
                        setLoading(false);
                      }
                    );
                  } else {
                    alert('Tu navegador no soporta geolocalización');
                  }
                }}
                disabled={loading}
                title="Usar GPS actual"
              >
                📍
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Fecha y Hora</label>
            <input 
              type="datetime-local"
              className="input-glass" 
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: '#fff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(2)}>
              <ArrowLeft size={16} /> Atrás
            </button>
            <button className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={checkAiCategory}>
              Revisar y Enviar <CheckCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="animate-in">
          <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Paso 4: Confirmación</h2>

          {category === 'Otro' && aiSuggestedCategory && (
            <div style={{ background: 'rgba(51, 153, 255, 0.1)', border: '1px solid rgba(51, 153, 255, 0.3)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0' }}>🤖 Nuestra IA sugiere que esto podría ser: <strong style={{ color: '#3399ff' }}>{aiSuggestedCategory}</strong></p>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Puedes usar la sugerencia o escribir la tuya:</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="Categoría personalizada..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Tipo:</strong> {type === 'FOUND' ? 'Me encontré algo' : 'Perdí algo'}</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>Categoría:</strong> {category === 'Otro' ? (customCategory || aiSuggestedCategory || 'Otro') : category}</p>
            {category === 'Vehículo' && (
              <>
                <p style={{ margin: '0 0 8px 0' }}><strong>Placa:</strong> {licensePlate}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Marca:</strong> {brandModel}</p>
              </>
            )}
            {category === 'Mascota' && (
              <>
                <p style={{ margin: '0 0 8px 0' }}><strong>Tipo:</strong> {petType}</p>
                {name && <p style={{ margin: '0 0 8px 0' }}><strong>Nombre:</strong> {name}</p>}
                {breed && <p style={{ margin: '0 0 8px 0' }}><strong>Raza:</strong> {breed}</p>}
              </>
            )}
            {category === 'Persona' && (
              <>
                {name && <p style={{ margin: '0 0 8px 0' }}><strong>Nombre:</strong> {name}</p>}
                <p style={{ margin: '0 0 8px 0' }}><strong>Sexo:</strong> {gender}</p>
                {ageRange && <p style={{ margin: '0 0 8px 0' }}><strong>Edad:</strong> {ageRange}</p>}
                {height && <p style={{ margin: '0 0 8px 0' }}><strong>Estatura:</strong> {height}</p>}
                {clothing && <p style={{ margin: '0 0 8px 0' }}><strong>Ropa:</strong> {clothing}</p>}
                <p style={{ margin: '0 0 8px 0' }}><strong>Condición Cognitiva:</strong> {cognitiveCondition}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Apariencia (Movilidad):</strong> {appearance}</p>
                {distinctiveFeatures && <p style={{ margin: '0 0 8px 0' }}><strong>Rasgos:</strong> {distinctiveFeatures}</p>}
              </>
            )}
            {color && <p style={{ margin: '0 0 8px 0' }}><strong>Color:</strong> {color}</p>}
            {brandModel && category !== 'Vehículo' && <p style={{ margin: '0 0 8px 0' }}><strong>Marca:</strong> {brandModel}</p>}
            <p style={{ margin: '0 0 8px 0' }}><strong>Ubicación:</strong> {location || 'No especificada'}</p>
            <p style={{ margin: '0' }}><strong>Descripción:</strong> {description}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: '#fff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setStep(3)}>
              <ArrowLeft size={16} /> Editar
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 2, background: 'linear-gradient(135deg, var(--accent-main), #ffaa00)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Publicando...' : <><Send size={16} /> Publicar Reporte</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ReportarPage() {
  return (
    <main className="hero-padding mobile-padding" style={{ minHeight: '100vh', padding: '100px 20px', display: 'flex', justifyContent: 'center' }}>
      <Suspense fallback={<div style={{ padding: '100px', color: 'white' }}>Cargando formulario...</div>}>
        <ReportarForm />
      </Suspense>
    </main>
  );
}
