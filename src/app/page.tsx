import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology';
import Tangibility from '@/components/Tangibility';
import Footer from '@/components/Footer';
import MaintenancePage from '@/components/MaintenancePage';

export default function Home() {
  if (process.env.NEXT_PUBLIC_MAINTENANCE === '1') {
    return <MaintenancePage />;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Saltar para o conteúdo</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Methodology />
        <Tangibility />
      </main>
      <Footer />
    </>
  );
}
