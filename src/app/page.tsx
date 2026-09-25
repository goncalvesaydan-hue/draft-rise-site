import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology';
import Tangibility from '@/components/Tangibility';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Methodology />
      <Tangibility />
      <Footer />
    </main>
  );
}