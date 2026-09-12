'use client';
import React, { useState } from 'react';

const ContactForm = React.forwardRef((props, ref) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section ref={ref} className="py-20 bg-dark-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-primary text-lg font-semibold mb-3">GET IN TOUCH</p>
        <h2 className="text-4xl font-extrabold text-text-main">Contact Us</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Still have questions about EduScheduler? Our team is here to help you create the perfect schedule for your institution.</p>
        <form onSubmit={handleSubmit} className="mt-12 max-w-2xl mx-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-card-bg border border-transparent rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-card-bg border border-transparent rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main"/>
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="message" className="block text-sm font-medium text-text-secondary">Message</label>
            <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 bg-card-bg border border-transparent rounded-md shadow-sm focus:ring-primary focus:border-primary text-text-main"></textarea>
          </div>
          <div className="mt-6 text-center">
            <button type="submit" className="px-8 py-3 text-dark-bg bg-primary font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all transform hover:-translate-y-0.5">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
});

export default ContactForm;