import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import Link from 'next/link';

import { motion } from 'framer-motion';
import Image from 'next/image';


 // Ensure this path is correct



// Animation variants for the container to orchestrate children animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // This will make children animate one by one
    },
  },
};

// Animation variants for individual text/button items
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

const Hero = React.forwardRef((props, ref) => {
  return (
    <section ref={ref} id="hero" className="py-12 md:py-16 bg-dark-bg overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Section: Text and Buttons */}
        <motion.div 
          className="text-center md:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={itemVariants} className="text-primary text-lg font-semibold mb-3">Modern scheduling for education</motion.p>
          
          <motion.div variants={itemVariants}>
            <TypeAnimation
              sequence={[ 'Smarter Timetables.', 1000, 'Smarter Classrooms.', 1000 ]}
              wrapper="h1"
              speed={50}
              className="text-4xl md:text-5xl font-extrabold text-text-main leading-tight mb-6"
              repeat={Infinity}
              cursor={true}
            />
          </motion.div>
          
          <motion.p variants={itemVariants} className="mt-4 text-lg text-text-secondary">
            SlotSmart streamlines logins and puts powerful scheduling tools at your fingertips—designed for students, teachers, and admins.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/login" className="px-6 py-3 text-dark-bg bg-primary font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 ">
              Get Started
            </Link>
            <a href="https://www.youtube.com/watch?v=HpeqMzmGfqs" className="inline-flex items-center justify-center px-6 py-3 text-primary bg-transparent border border-primary font-bold rounded-lg hover:bg-primary/10 transition-colors transform hover:-translate-y-0.5">
              Demo
            </a>
          </motion.div>
        </motion.div>

        {/* Right Section: Image */}
        <motion.div 
          className="flex justify-center md:justify-end"
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Image
            src='/assets/hero.jpg' 
            alt="Modern classroom setup for scheduling"
            className="rounded-lg shadow-2xl object-cover w-full max-w-md lg:max-w-lg border border-card-bg"
            width={600}
            height={400}
          />
        </motion.div>
      </div>
    </section>
  );
});

export default Hero;






