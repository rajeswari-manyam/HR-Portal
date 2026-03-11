// End Of Day Update Screen
import { useState } from 'react';
export default function EndOfDayUpdate() {
  const [status, setStatus] = useState('completed');
  const [summary, setSummary] = useState('');
  const [completion, setCompletion] = useState(100);
  const [reason, setReason] = useState('');
  return (
    <div className="max-w-lg mx-auto mt-10 card p-6 space-y-6">
      <h1 className="page-title">End Of Day Update</h1>
      <div className="space-y-4">
        <div>
          <label className="label">Status</label>
          <select className="input w-full" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="completed">Completed</option>
            <option value="not_completed">Not Completed</option>
          </select>
        </div>
        <div>
          <label className="label">Work Summary</label>
          <textarea className="input w-full" value={summary} onChange={e => setSummary(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="label">Completion %</label>
          <input type="number" className="input w-full" value={completion} onChange={e => setCompletion(Number(e.target.value))} min={0} max={100} />
        </div>
        {status === 'not_completed' && (
          <div>
            <label className="label">Reason / Comment</label>
            <textarea className="input w-full" value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Waiting for API, Client delay, Bug fixing pending..." />
          </div>
        )}
        <button className="btn-primary w-full mt-4">Submit Update</button>
      </div>
    </div>
  );
}