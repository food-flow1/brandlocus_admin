'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ICONS } from '@/constants';
import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/hooks/useAuth';
import { LuEye, LuEyeClosed } from 'react-icons/lu';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // const [rememberMe, setRememberMe] = useState(false);
  const loginMutation = useLogin();

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // User is already logged in, redirect to dashboard
      router.replace(ROUTES.dashboard);
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      // If remember me is checked, the token is already stored in localStorage
      // You can add additional logic here if needed
    } catch (error) {
      // Error is handled by the mutation
      console.error('Login failed:', error);
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">
      {/* Animated Background Lighting Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large animated gradient orb 1 - Top Left */}
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
        
        {/* Large animated gradient orb 2 - Bottom Right */}
        <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl animation-delay-2000"></div>
        
        {/* Medium animated gradient orb 3 - Center */}
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 blur-3xl animation-delay-4000"></div>
        
        {/* Small accent orb - Top Right */}
        <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animation-delay-1000"></div>
        
        {/* Moving light ray effect */}
        <div className="absolute left-0 top-0 h-full w-1/3 animate-slide-right bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        {/* Additional subtle light sweep */}
        <div className="absolute right-0 top-0 h-full w-1/4 animate-slide-left bg-gradient-to-l from-transparent via-white/3 to-transparent animation-delay-3000"></div>
        
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Content */}
      <div className="mirror-container relative z-10 w-full max-w-lg rounded-lg p-8">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white">
              <Image
                src={ICONS.logo}
                alt="Brand Locus Logo"
                width={40}
                height={40}
                className="h-10 w-10"
                priority
              />
            </div>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">
            Login to Brand Locus Admin
          </h1>
          <p className="text-sm font-normal text-white/80">
            Enter your username and password to log in to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-normal text-white"
            >
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full rounded-lg border-0 bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-normal text-white"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border-0 bg-[#1a1a1a] px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer bg-black/40 text-white rounded-lg p-2 right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                 <LuEye />
                ) : (
                  <LuEyeClosed />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          {/* <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-[#1a1a1a] transition-colors peer-checked:bg-blue-500">
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
                </div>
              </div>
              <span className="text-sm font-normal text-white">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm font-normal text-blue-400 hover:text-blue-300"
            >
              Forgot Password?
            </a>
          </div> */}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-white cursor-pointer px-4 mt-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Log in'}
          </button>
          
          {/* Error Message */}
          {loginMutation.isError && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {loginMutation.error instanceof Error 
                ? loginMutation.error.message 
                : 'Login failed. Please check your credentials.'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;