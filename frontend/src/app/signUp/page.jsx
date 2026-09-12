// 'use client'; // This page must be a client component for hooks and interactivity

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // 1. Import useRouter from next/navigation

// const SignupPage = () => {
//   // 2. Initialize the router using the correct hook
//   const router = useRouter();
  
//   // State to manage form inputs
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     role: 'teacher', // Default role
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSignup = (event) => {
//     event.preventDefault();
//     // This is a simulation. In a real app, you'd send data to your backend here.
//     console.log('Signing up with:', formData);
    
//     // After a successful signup, redirect to the login page
//     alert('Signup successful! Please log in.');
//     router.push('/login'); // 3. Use router.push() to navigate
//   };

//   return (
//     <div className="min-h-screen bg-dark-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-card-bg p-10 rounded-xl shadow-lg">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-text-main">
//             Create your free account
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSignup}>
//           <div className="space-y-4">
//             <div>
//               <label htmlFor="fullName" className="sr-only">Full Name</label>
//               <input 
//               id="fullName" 
//               name="fullName" 
//               type="text" 
//               required value={formData.fullName} 
//               onChange={handleChange} 
//               className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md" 
//               placeholder="Full Name" 
//               />
//             </div>
//             <div>
//               <label htmlFor="email" className="sr-only">Email address</label>
//               <input 
//               id="email" 
//               name="email" 
//               type="email" 
//               required value={formData.email} 
//               onChange={handleChange} 
//               className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md" 
//               placeholder="Email address" 
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">Password</label>
//               <input 
//               id="password" 
//               name="password" 
//               type="password" 
//               required value={formData.password} 
//               onChange={handleChange} 
//               pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$' 
//               className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md" 
//               placeholder="Password" 
//               />
//             </div>
//              <div>
//               <label htmlFor="role" className="sr-only">Role</label>
//               <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md">
//                 <option value="teacher">Teacher</option>
//                 <option value="student">Student</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <button type="submit" className="w-full flex justify-center py-2 px-4 rounded-md text-dark-bg bg-primary font-medium">
//               Sign up
//             </button>
//           </div>
//         </form>
//         <div className="text-sm text-center">
//           <span className="text-text-secondary">Already have an account? </span>
//           <Link href="/login" className="font-medium text-primary hover:underline">
//             Log in
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    user_name: '',
    gmail: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('📤 JSON being sent:', formData);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
        if (res.status === 409) {
      setError(data.message || 'User already exists');
      return;
    }

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      alert('Signup successful! Please log in.');
      router.push('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-card-bg p-10 rounded-xl shadow-lg space-y-6">

        <h2 className="text-center text-3xl font-extrabold text-text-main">
          Create your free account
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            name="user_name"
            type="text"
            required
            value={formData.user_name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md"
            placeholder="Full Name"
          />

          <input
            name="gmail"
            type="email"
            required
            value={formData.gmail}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md"
            placeholder="Email address"
          />

          <input
  name="password"
  type="password"
  required
  value={formData.password}
  onChange={handleChange}
  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
  title="Password must be at least 8 characters, include uppercase, lowercase, and a number"
  className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md"
  placeholder="Password"
/>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-primary text-dark-bg font-medium"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>

        </form>

        <div className="text-sm text-center">
          <span className="text-text-secondary">Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
