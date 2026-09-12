'use client';
import React from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion'; // 1. Import motion

const Header = ({ onScrollToHero, onScrollToFeatures, onScrollToHowItWorks, onScrollToFAQ, onScrollToContact }) => {
  const linkStyles = `
    relative font-medium text-text-secondary cursor-pointer
    transition-colors duration-300 ease-out
    hover:text-primary
    after:content-[''] after:absolute after:bottom-[-4px] after:left-0
    after:w-full after:h-[2px] after:bg-primary
    after:origin-left after:scale-x-0
    after:transition-transform after:duration-300 after:ease-out
    hover:after:scale-x-100
  `;

  return (
    // 2. Wrap header in a motion component for animation
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-sm border-b border-card-bg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-between h-16">
          <button onClick={onScrollToHero} className="text-3xl font-extrabold text-text-main ">
            SlotSmart
          </button>
          
          <nav className="hidden md:flex space-x-8">
            <button onClick={onScrollToFeatures} className={linkStyles}>Features</button>
            <button onClick={onScrollToHowItWorks} className={linkStyles}>How It Works</button>
            <button onClick={onScrollToFAQ} className={linkStyles}>FAQ</button>
            <button onClick={onScrollToContact} className={linkStyles}>Contact</button>
          </nav>

          <Link href="/login" className="px-5 py-2 text-dark-bg bg-primary font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5">
            Login
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;


