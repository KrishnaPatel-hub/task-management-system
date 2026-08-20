'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';
import type { Task } from '../types';

export default function Dashboard() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const query = useQuery({
    queryKey: ['tasks', { status, priority, dueFrom, dueTo, page }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '6' });
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      if (dueFrom) params.set('dueFrom', dueFrom);
      if (dueTo) params.set('dueTo', dueTo);
      return api<{ items: Task[]; pagination: any }>(`/tasks?${params}`, {}, token!);
    },
    enabled: !!token && !!user,
  });

  if (authLoading || !user) return <main className="container"><p>Loading...</p></main>;

  return (
    <>
      <nav className="nav"><strong>Task Manager</strong><div className="row"><span>{user.name}</span><button className="btn secondary" onClick={logout}>Logout</button></div></nav>
      <main className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <div><h1>My Tasks</h1><p className="muted">Private workspace for {user.email}</p></div>
          <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ New task'}</button>
        </div>

        {showForm && <div className="card" style={{ marginBottom: 16 }}><TaskForm onSaved={() => { setShowForm(false); query.refetch(); }} /></div>}

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="toolbar">
            <select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }}><option value="">All statuses</option><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select>
            <select value={priority} onChange={e => { setPage(1); setPriority(e.target.value); }}><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
            <input type="date" value={dueFrom} onChange={e => { setPage(1); setDueFrom(e.target.value); }} />
            <input type="date" value={dueTo} onChange={e => { setPage(1); setDueTo(e.target.value); }} />
            <button className="btn secondary" onClick={() => { setStatus(''); setPriority(''); setDueFrom(''); setDueTo(''); setPage(1); }}>Reset</button>
          </div>
        </div>

        {query.isLoading && <div className="empty">Loading tasks...</div>}
        {query.isError && <div className="error">{(query.error as Error).message}</div>}
        {query.data?.items.length === 0 && <div className="empty">No tasks found. Create your first task.</div>}
        <div className="grid grid2">
          {query.data?.items.map(task => <TaskCard key={task._id} task={task} onChange={() => query.refetch()} />)}
        </div>

        {query.data?.pagination && query.data.pagination.totalPages > 0 && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
            <button className="btn secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span>Page {page} of {query.data.pagination.totalPages}</span>
            <button className="btn secondary" disabled={page >= query.data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </main>
    </>
  );
}
