'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Task, Weather } from '../types';

export default function TaskCard({ task, onChange }: { task: Task; onChange: () => void }) {
  const { token } = useAuth();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  async function loadWeather() {
    setLoadingWeather(true);
    try { setWeather(await api<Weather>(`/tasks/${task._id}/weather`, {}, token!)); }
    catch (e) { setWeather(null); }
    finally { setLoadingWeather(false); }
  }

  async function remove() {
    if (!confirm('Delete this task?')) return;
    await api(`/tasks/${task._id}`, { method: 'DELETE' }, token!);
    onChange();
  }

  return (
    <article className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3 className="task-title">{task.title}</h3>
        <span className="badge">{task.priority}</span>
      </div>
      <p>{task.description || <span className="muted">No description</span>}</p>
      <div className="row">
        <span className="badge">{task.status}</span>
        {task.dueDate && <span className="muted">Due {new Date(task.dueDate).toLocaleDateString()}</span>}
        {task.location && <span className="muted">📍 {task.location}</span>}
      </div>
      {task.attachments?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <strong>Attachments</strong>
          {task.attachments.map(a => <div key={a._id}><a href={a.url} target="_blank" rel="noreferrer">{a.originalName}</a></div>)}
        </div>
      )}
      {task.location && (
        <div style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={loadWeather} disabled={loadingWeather}>
            {loadingWeather ? 'Loading weather...' : 'Show live weather'}
          </button>
          {weather && <p>🌤️ {weather.temperature}°C, {weather.description} · feels like {weather.feelsLike}°C · humidity {weather.humidity}%</p>}
        </div>
      )}
      <div className="row" style={{ marginTop: 14 }}>
        <a className="btn secondary" href={`/tasks/${task._id}`}>Details</a>
        <button className="btn danger" onClick={remove}>Delete</button>
      </div>
    </article>
  );
}
