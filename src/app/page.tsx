import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology';
import Tangibility from '@/components/Tangibility';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Saltar para o conteúdo</a>
      <Navbar />
      <main id="main-content" className="min-h-screen overflow-hidden">
        <Hero />
        <Methodology />
        <Tangibility />
      </main>
      <Footer />
    </>
  );
}
