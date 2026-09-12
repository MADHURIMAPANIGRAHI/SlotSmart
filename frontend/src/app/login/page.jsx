'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    gmail: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /*AUTO LOGIN CHECK */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
          cache: 'no-store', 
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!data?.role) return;

        if (data.role === 'teacher') {
          router.replace('/teacher/dashboard');
        } else if (data.role === 'student') {
          router.replace('/student/dashboard');
        } else {
          router.replace('/admin/dashboard');
        }
      } catch {
       console.alert('No active session found.'); 
      }
    };

    checkSession();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      // Redirect using BACKEND role
      if (data.role === 'teacher') {
        router.replace('/teacher/dashboard');
      } else if (data.role === 'student') {
        router.replace('/student/dashboard');
      } else {
        router.replace('/admin/dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card-bg p-10 rounded-xl shadow-lg space-y-6">

        <h2 className="text-center text-3xl font-bold text-text-main">
          Log in to your account
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            name="gmail"
            type="email"
            required
            value={formData.gmail}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md"
          />

          <input
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-3 py-2 bg-dark-bg text-text-main rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-dark-bg rounded-md font-medium"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-text-secondary">Don't have an account? </span>
          <Link href="/signUp" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
