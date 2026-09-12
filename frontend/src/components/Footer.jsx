'use client';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark-bg border-t border-card-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-text-main">SlotSmart</div>
          <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} SlotSmart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;