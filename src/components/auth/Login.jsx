'use client'; // This component needs to run on the client

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent SSR issues with Firebase
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything during SSR to avoid Firebase errors
  if (!isClient) {
    return <div className="p-4 border rounded animate-pulse">Loading authentication...</div>;
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Ensure Firebase is configured before calling this
      if (!auth.app.options.apiKey) {
         throw new Error("Firebase is not configured. Please add credentials to .env.local");
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email login successful:', userCredential.user);
      // TODO: Redirect user or update UI state upon successful login
    } catch (err) {
      console.error("Email login error:", err);
      setError(err.message || 'Failed to login with email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
       // Ensure Firebase is configured before calling this
      if (!auth.app.options.apiKey) {
         throw new Error("Firebase is not configured. Please add credentials to .env.local");
      }
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user);
       // TODO: Handle first login - check if user exists in Firestore, if not, create profile and credit $10,000
      // TODO: Redirect user or update UI state upon successful login
    } catch (err) {
      console.error("Google login error:", err);
       // Handle specific errors like popup closed by user
       if (err.code === 'auth/popup-closed-by-user') {
         setError('Google sign-in cancelled.');
       } else {
         setError(err.message || 'Failed to login with Google.');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account or use Google.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleEmailLogin}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign in with Email'}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button" disabled={loading}>
            {loading ? '...' : 'Sign in with Google'}
          </Button>
        </CardFooter>
      </form>
       {/* TODO: Add link/button for Sign Up */}
    </Card>
  );
}
