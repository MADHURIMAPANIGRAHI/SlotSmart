'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  { question: 'Is SlotSmart free to use?', answer: 'Yes, we offer a generous free plan for individual teachers and small schools. For larger institutions, we have affordable premium plans with advanced features.' },
  { question: 'How does it handle complex scheduling conflicts?', answer: 'Our smart algorithm automatically detects and flags potential conflicts, such as double-booking a teacher or a classroom, allowing you to resolve them easily.' },
  { question: 'Can I integrate it with other tools?', answer: 'Absolutely. SlotSmart offers integrations with popular tools like Google Calendar, Microsoft Teams, and various Learning Management Systems (LMS).' },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div variants={itemVariants} className="border-b border-card-bg">
      <button onClick={onClick} className="w-full text-left py-5 flex justify-between items-center hover:bg-card-bg/50 px-2 rounded-md transition-colors">
        <span className="text-lg font-medium text-text-main">{question}</span>
        <motion.span 
          className="transform text-primary"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="pb-5 px-2 text-text-secondary">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = React.forwardRef((props, ref) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section ref={ref} id="faq" className="py-20 bg-dark-bg">
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.2 }}
      >
        <motion.p variants={itemVariants} className="text-primary text-lg font-semibold mb-3">Frequently Asked Questions</motion.p>
        <motion.h2 variants={itemVariants} className="text-4xl font-extrabold text-text-main">Have Questions? We've Got You Covered</motion.h2>
        <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Find answers to common questions about SlotSmart and how it can help streamline your scheduling process.</motion.p>
        <div className="mt-12 max-w-3xl mx-auto">
          {faqData.map((faq, index) => (
            <AccordionItem key={index} {...faq} isOpen={openIndex === index} onClick={() => handleToggle(index)} />
          ))}
        </div>
      </motion.div>
    </section>
  );
});

export default FAQ;
