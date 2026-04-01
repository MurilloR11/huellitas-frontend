import { useEffect } from 'react';
import { PawTrail } from '../components/MouseGlow';
import { NavbarSection } from '../components/NavbarSection';
import { HeroSection } from '../components/HeroSection';
import { AboutProjectSection } from '../components/AboutProjectSection';
import { MissionVisionSection } from '../components/MissionVisionSection';
import { ObjectivesSection } from '../components/ObjectivesSection';
import { TechnologiesSection } from '../components/TechnologiesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { FeaturesGridSection } from '../components/FeaturesGridSection';
import { PublicAPISection } from '../components/PublicAPISection';
import { FooterSection } from '../components/FooterSection';

export function HomePage() {
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
    <div className="relative min-h-screen bg-white text-zinc-900">
      <PawTrail />
      <NavbarSection />
      <main>
        <HeroSection />
        <AboutProjectSection />
        <MissionVisionSection />
        <ObjectivesSection />
        <TechnologiesSection />
        <HowItWorksSection />
        <FeaturesGridSection />
        <PublicAPISection />
      </main>
      <FooterSection />
    </div>
  );
}
