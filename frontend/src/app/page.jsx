'use client'; 

import React, { useRef } from 'react';

// Import all landing page components
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Feature from '@/components/Feature';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

//main component for landing page
export default function HomePage() {
  // Create refs for each section to enable smooth scrolling
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const faqRef = useRef(null);
  const contactRef = useRef(null);

  // A single function to handle all scroll events
  const handleScrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // We use a React Fragment <>...</> because the root layout is handled by layout.jsx
    <>
      <Header
        onScrollToHero={() => handleScrollTo(heroRef)}
        onScrollToFeatures={() => handleScrollTo(featuresRef)}
        onScrollToHowItWorks={() => handleScrollTo(howItWorksRef)}
        onScrollToFAQ={() => handleScrollTo(faqRef)}
        onScrollToContact={() => handleScrollTo(contactRef)}
      />
      <main>
        <Hero ref={heroRef} />
        <Feature ref={featuresRef} />
        <HowItWorks ref={howItWorksRef} />
        <FAQ ref={faqRef} />
        <ContactForm ref={contactRef} />
      </main>
      <Footer />
    </>
  );
}
