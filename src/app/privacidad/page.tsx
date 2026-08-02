import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <nav className="p-4 md:px-8 flex items-center bg-[rgba(15,17,21,0.75)] border-b border-[rgba(255,255,255,0.05)] sticky top-0 backdrop-blur-md z-10">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <ArrowLeft size={20} />
                    <span className="font-bold text-lg">Volver</span>
                </Link>
            </nav>

            <section className="max-w-4xl mx-auto p-6 md:p-12 w-full text-[var(--text-secondary)] leading-relaxed">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-8">
                    AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES
                </h1>
                
                <p className="mb-8 text-[var(--text-primary)]">
                    <strong>PANOPTES BOCHICA NETWORKS</strong><br /><br />
                    De conformidad con lo dispuesto en la Ley Estatutaria 1581 de 2012 de Protección de Datos Personales y sus decretos reglamentarios, con la aceptación de este documento y/o el marcado de la casilla de verificación (checkbox) en el proceso de registro, manifiesto de manera libre, previa, expresa, voluntaria e informada que autorizo a <strong>Panoptes Bochica Networks</strong> (en adelante, "El Responsable"), para que realice la recolección, almacenamiento, uso, circulación, supresión y en general, el tratamiento de mis datos personales en la plataforma Panoptes Bochica Networks.
                </p>

                <h2 className="text-2xl font-bold text-[var(--accent-main)] mt-10 mb-4">1. Finalidades del Tratamiento</h2>
                <p className="mb-4">Los datos personales recolectados serán utilizados para las siguientes finalidades:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                    <li><strong>Gestión de Usuarios y Cuentas:</strong> Crear, verificar, autenticar y administrar mi perfil de usuario y credenciales de acceso dentro de la red social.</li>
                    <li><strong>Operación de la Plataforma:</strong> Permitir la interacción social, publicación de contenidos, conexión entre usuarios, mensajería y funcionalidad propia de Panoptes Bochica Networks.</li>
                    <li><strong>Personalización y Experiencia:</strong> Adaptar el contenido, algoritmos de recomendación, feeds y funciones según mis preferencias y actividad dentro de la red.</li>
                    <li><strong>Seguridad e Identidad:</strong> Monitorear la plataforma para prevenir accesos no autorizados, suplantación de identidad, spam, fraudes y garantizar el cumplimiento de los Términos y Condiciones.</li>
                    <li><strong>Comunicaciones:</strong> Enviar notificaciones del sistema, alertas de seguridad, novedades, actualizaciones del servicio y soporte técnico.</li>
                    <li><strong>Análisis y Mejora:</strong> Elaborar métricas, estadísticas de uso e investigación de desarrollo para optimizar el rendimiento y las características de la red social.</li>
                </ul>

                <h2 className="text-2xl font-bold text-[var(--accent-main)] mt-10 mb-4">2. Tratamiento de Datos Sensibles y de Menores de Edad</h2>
                <div className="space-y-4 mb-8">
                    <p><strong>Datos Sensibles:</strong> Se me ha informado que la entrega de datos sensibles (aquellos que afectan la intimidad del Titular o cuyo uso indebido puede generar su discriminación, tales como fotos de perfil, biometría, opiniones políticas, convicciones religiosas o datos de salud) es de carácter facultativo y opcional. Al publicar deliberadamente este tipo de información en mi perfil o contenidos, otorgo mi consentimiento explícito para su visualización por otros usuarios según la configuración de privacidad que elija.</p>
                    <p><strong>Menores de Edad:</strong> El uso de Panoptes Bochica Networks está restringido a mayores de 14 años.</p>
                </div>

                <h2 className="text-2xl font-bold text-[var(--accent-main)] mt-10 mb-4">3. Derechos del Titular de los Datos</h2>
                <p className="mb-4">Como titular de los datos personales, de acuerdo con el Artículo 8 de la Ley 1581 de 2012, tengo derecho a:</p>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                    <li>Conocer, actualizar y rectificar mis datos personales frente a El Responsable.</li>
                    <li>Solicitar prueba de la autorización otorgada.</li>
                    <li>Ser informado previa solicitud, respecto del uso que se le ha dado a mis datos personales.</li>
                    <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a lo dispuesto en la ley.</li>
                    <li>Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.</li>
                    <li>Acceder en forma gratuita a mis datos personales que hayan sido objeto de Tratamiento.</li>
                </ul>

                <h2 className="text-2xl font-bold text-[var(--accent-main)] mt-10 mb-4">4. Canales para el Ejercicio de Derechos</h2>
                <p className="mb-4">Para ejercer cualquiera de mis derechos (hábeas data), realizar consultas, peticiones o reclamos, podré contactar al área encargada de la protección de datos a través de los siguientes canales:</p>
                <ul className="list-none mb-8 space-y-2">
                    <li><strong>Correo Electrónico:</strong> <a href="mailto:ai@bochica.network" className="text-blue-400 hover:underline">ai@bochica.network</a></li>
                    <li><strong>Sitio Web:</strong> <Link href="/contacto" className="text-blue-400 hover:underline">Formulario de Contacto</Link></li>
                    <li><strong>Dirección Física:</strong> Cra 2a # 72-30</li>
                </ul>

                <h2 className="text-2xl font-bold text-[var(--accent-main)] mt-10 mb-4">5. Política de Tratamiento de la Información (PTI)</h2>
                <p className="mb-12">
                    Declaro que se me ha informado que la Política de Tratamiento de la Información (PTI) completa de Panoptes Bochica Networks, donde se detallan los procedimientos para el ejercicio de mis derechos, se encuentra disponible para su consulta permanente en el sitio web: <Link href="/privacidad" className="text-blue-400 hover:underline">https://bochica.network/politica-de-privacidad</Link>.
                </p>
            </section>
        </main>
    );
}
