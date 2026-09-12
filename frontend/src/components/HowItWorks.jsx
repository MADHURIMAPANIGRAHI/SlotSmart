// 'use client';
// import React from 'react';
// import Link from 'next/link';
// import { motion } from 'framer-motion';

// const stepsData = [
//   { number: '1', title: 'Create Your Account', description: 'Sign up for free and set up your school or institution profile in minutes.' },
//   { number: '2', title: 'Build Schedules', description: 'Use our simple drag-and-drop calendar to create and manage timetables effortlessly.' },
//   { number: '3', title: 'Collaborate & Share', description: 'Invite teachers and staff to collaborate, and publish schedules for students and parents.' },
// ];

// // Animation variants for each step
// const stepVariants = {
//   hidden: { x: -50, opacity: 0 },
//   visible: {
//     x: 0,
//     opacity: 1,
//     transition: { duration: 0.6, ease: "easeOut" }
//   }
// };

// const HowItWorks = React.forwardRef((props, ref) => {
//   return (
//     <section ref={ref} id="how-it-works" className="py-20 bg-dark-bg">
//       <motion.div
//         className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.2 }}
//         transition={{ staggerChildren: 0.2 }}
//       >
//         <h2 className="text-4xl font-extrabold text-text-main">How It Works</h2>
//         <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Get started in just a few simple steps.</p>
//         <div className="mt-12 max-w-2xl mx-auto text-left space-y-8">
//           {stepsData.map((step) => (
//             <motion.div variants={stepVariants} className="flex items-start" key={step.number}>
//               <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
//                 {step.number}
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-xl font-bold text-text-main">{step.title}</h3>
//                 <p className="mt-1 text-text-secondary">{step.description}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//         <motion.div variants={stepVariants} className="mt-20">
//           <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
//             <p className="text-xl font-semibold text-gray-800">
//               Ready to create your first timetable?
//             </p>
//             <Link href="/signup"
//               className="px-6 py-3 text-white font-bold rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 flex-shrink-0"
//             >
//               Try Now for Free
//             </Link>
//           </div>
//           <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-8 text-text-secondary">
//             <div className="flex items-center gap-2">
//               <span className="h-2 w-2 rounded-full bg-green-400"></span>
//               <span>5-Minute Setup</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="h-2 w-2 rounded-full bg-blue-400"></span>
//               <span>No Installation Needed</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="h-2 w-2 rounded-full bg-purple-400"></span>
//               <span>Free Plan Available</span>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// });

// export default HowItWorks;


'use client';
import React from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const stepsData = [
  {
    number: '1',
    title: 'Create Your Account',
    description: 'Sign up for free and set up your school or institution profile in minutes.',
  },
  {
    number: '2',
    title: 'Build Schedules',
    description: 'Use our simple drag-and-drop calendar to create and manage timetables effortlessly.',
  },
  {
    number: '3',
    title: 'Collaborate & Share',
    description: 'Invite teachers and staff to collaborate, and publish schedules for students and parents.',
  },
];

const HowItWorks = React.forwardRef((props, ref) => {
  return (
    <section ref={ref} id="how-it-works" className="py-20 bg-dark-bg relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-extrabold text-text-main">How It Works</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
          Get started in just a few simple steps.
        </p>

        <div className="mt-12 max-w-2xl mx-auto text-left space-y-20 relative">
          {stepsData.map((step, index) => {
            const controls = useAnimation();
            const [ref, inView] = useInView({ threshold: 0.3 });

            React.useEffect(() => {
              if (inView) {
                controls.start({ opacity: 1 });
              } else {
                controls.start({ opacity: 0 });
              }
            }, [inView, controls]);

            return (
              <div key={step.number} className="relative">
                {/* Vertical line between steps */}
                {index < stepsData.length - 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: inView ? '80px' : '0px' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-5 top-10 w-1 bg-primary"
                  />
                )}

                {/* Step content */}
                <motion.div
                  ref={ref}
                  animate={controls}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold z-10">
                    {step.number}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold text-text-main">{step.title}</h3>
                    <p className="mt-1 text-text-secondary">{step.description}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xl font-semibold text-gray-800">
              Ready to create your first timetable?
            </p>
            <Link
              href="/signUp"
              className="px-6 py-3 text-white font-bold rounded-lg shadow-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              Try Now for Free
            </Link>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-8 text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              <span>5-Minute Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              <span>No Installation Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span>
              <span>Free Plan Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HowItWorks;