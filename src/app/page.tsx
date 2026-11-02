import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeContent from '@/components/HomeContent';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between relative bg-white dark:bg-neutral-950">
      <div className="relative flex-grow flex flex-col">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_48px] -z-10"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[1200px] w-[1200px] rounded-full bg-neutral-400 opacity-10 blur-[100px] -z-10"></div>
        </div>

        <div className="relative z-10 flex-grow flex flex-col">
          <Navbar />
          <HomeContent />
        </div>
      </div>
      <Footer />
    </main>
  );
}