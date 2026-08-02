import ReportCarousel from '../components/ReportCarousel';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4 pt-12">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Recent Reports
          </h1>
          <p className="text-slate-400 text-lg">
            Stay updated with the latest community findings and lost-and-found items.
          </p>
        </header>

        <section className="py-8">
          <ReportCarousel />
        </section>
      </div>
    </main>
  );
}
