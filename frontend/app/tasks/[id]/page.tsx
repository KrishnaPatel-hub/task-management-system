'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import TaskForm from '../../../components/TaskForm';
import type { Task, Weather } from '../../../types';

export default function TaskDetailPage() {
  const { token, user, loading } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState('');

  async function load() {
    if (!token) return;
    try { setTask(await api<Task>(`/tasks/${params.id}`, {}, token)); }
    catch (e: any) { setError(e.message); }
  }

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  useEffect(() => { load(); }, [token, params.id]);

  if (loading || !user) return <main className="container"><p>Loading...</p></main>;
  if (error) return <main className="container"><div className="error">{error}</div></main>;
  if (!task) return <main className="container"><p>Loading task...</p></main>;

  return (
    <main className="container">
      <div className="row" style={{ marginBottom: 16 }}><a href="/dashboard">← Back</a></div>
      <div className="card">
        <h1>{task.title}</h1>
        <p className="muted">{task.description}</p>
        <p>Status: <strong>{task.status}</strong> · Priority: <strong>{task.priority}</strong></p>
        {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
        {task.location && <p>Location: 📍 {task.location}</p>}

        <h3>Attachments</h3>
        {task.attachments?.length ? task.attachments.map(a => (
          <div key={a._id}><a href={a.url} target="_blank" rel="noreferrer">{a.originalName}</a></div>
        )) : <p className="muted">No attachments.</p>}

        {task.location && <div style={{ marginTop: 16 }}>
          <button className="btn secondary" onClick={async () => setWeather(await api<Weather>(`/tasks/${task._id}/weather`, {}, token!))}>Refresh weather</button>
          {weather && <p>🌤️ {weather.temperature}°C · {weather.description} · feels like {weather.feelsLike}°C · humidity {weather.humidity}%</p>}
        </div>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Edit task</h2>
        <TaskForm existing={task} onSaved={async () => { await load(); }} />
      </div>
    </main>
  );
}
