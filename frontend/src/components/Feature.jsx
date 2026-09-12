'use client';
import React from 'react';
// Importing icons 
import { FiCalendar, FiUsers, FiRepeat, FiSettings, FiGlobe, FiLock, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';
//Counter-1
const featuresData = [
  {
    icon: <FiCalendar size={28} />,
    title: 'Automatic Scheduling',
    description: 'Intelligently creates optimized timetables based on availability, preferences, and resource constraints with instant conflict resolutions.',
  },
  {
    icon: <FiUsers size={28} />,
    title: 'Auto Substitute & Rescheduling',
    description: 'Automatically assigns substitutes, adjusts schedules, reallocates resources, and notifies stakeholders in real time with minimal disruption.',
  },
  // {
  //   icon: <FiRepeat size={28} />,
  //   title: 'Automatic Rescheduling Info',
  //   description: 'Instantly adjusts events when conflicts arise, reallocating resources and ensuring all users receive real-time notifications.',
  // },
  {
    icon: <FiSettings size={28} />,
    title: 'Easy Customization',
    description: 'Tailor the system to match unique needs by easily configuring time slots, roles, availability, and priority rules.',
  },
  {
    icon: <FiGlobe size={28} />,
    title: 'Web-Based, Access Anywhere',
    description: 'Log in from any device with real-time sync and offline caching. No software installation needed.',
  },
  {
    icon: <FiLock size={28} />,
    title: 'Secure Authentication',
    description: 'Each user logs in with unique credentials, supported by encryption and optional multi-factor authentication to protect sensitive data.',
  },
  {
    icon: <FiLayers size={28} />,
    title: 'Seamless Web Integration',
    description: 'Easily integrates with your existing systems and workflows to help different tools and services work together seamlessly.',
  },
];

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className="text-left p-8 bg-card-bg rounded-xl border border-transparent hover:border-primary/50 transition-colors h-full"
    variants={cardVariants}
  >
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
    <p className="text-text-secondary">{description}</p>
  </motion.div>
);

const Feature = React.forwardRef((props, ref) => {
  return (
    <section ref={ref} id="features" className="py-20 bg-dark-bg">
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.2 }}
      >
        <h2 className="text-4xl font-extrabold text-text-main">Why Choose SlotSmart?</h2>
        <p className="mt-4 max-w-4xl mx-auto text-lg text-text-secondary">Imagine a world where scheduling itself schedules itself — no more conflicts, no more chaos. Welcome to the future of timetables...</p>
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, index) => <FeatureCard key={index} {...feature} />)}
        </div>
      </motion.div>
    </section>
  );
});

export default Feature;
