'use client';

import { FormEvent, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Task } from '../types';

export default function TaskForm({
  existing,
  onSaved,
}: { existing?: Task; onSaved: () => void }) {
  const { token } = useAuth();
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [status, setStatus] = useState(existing?.status || 'TODO');
  const [priority, setPriority] = useState(existing?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(existing?.dueDate?.slice(0,10) || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError('Title is required');
    setError(''); setBusy(true);
    try {
      const payload = { title, description, status, priority, dueDate: dueDate || undefined, location: location || undefined };
      const task = existing
        ? await api<Task>(`/tasks/${existing._id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token!)
        : await api<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) }, token!);

      if (file) {
        const fd = new FormData(); fd.append('file', file);
        await api(`/tasks/${task._id}/attachments`, { method: 'POST', body: fd }, token!);
      }
      onSaved();
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>Title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={150} required /></label>
      <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
      <div className="grid grid2">
        <label>Status<select value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option>
        </select></label>
        <label>Priority<select value={priority} onChange={e => setPriority(e.target.value as any)}>
          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
        </select></label>
      </div>
      <div className="grid grid2">
        <label>Due date<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></label>
        <label>Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bengaluru" /></label>
      </div>
      <label>Attachment<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Saving...' : existing ? 'Save changes' : 'Create task'}</button>
    </form>
  );
}
