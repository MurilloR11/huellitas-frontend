import { useEffect } from 'react';
import { NavbarSection }       from '../components/NavbarSection';
import { HeroSection }          from '../components/HeroSection';
import { HowItWorksSection }    from '../components/HowItWorksSection';
import { ForFoundationsSection } from '../components/ForFoundationsSection';
import { PublicAPISection }     from '../components/PublicAPISection';
import { FeaturesGridSection }  from '../components/FeaturesGridSection';
import { TestimonialsSection }  from '../components/TestimonialsSection';
import { LostAnimalsSection }   from '../components/LostAnimalsSection';
import { FinalCTASection }      from '../components/FinalCTASection';
import { FooterSection }        from '../components/FooterSection';

export function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <NavbarSection />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ForFoundationsSection />
        <PublicAPISection />
        <FeaturesGridSection />
        <TestimonialsSection />
        <LostAnimalsSection />
        <FinalCTASection />
      </main>
      <FooterSection />
    </div>
  );
}
