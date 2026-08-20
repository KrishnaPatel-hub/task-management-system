'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <main className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="muted">{mode === 'login' ? 'Sign in to manage your private tasks.' : 'Create your private task workspace.'}</p>
        <form className="form" onSubmit={submit}>
          {mode === 'register' && <label>Name<input value={name} onChange={e => setName(e.target.value)} required /></label>}
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        <p className="muted">
          {mode === 'login' ? <>No account? <a href="/register">Register</a></> : <>Already registered? <a href="/login">Login</a></>}
        </p>
      </div>
    </main>
  );
}
