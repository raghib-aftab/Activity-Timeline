import React, { useState } from 'react';

function App() {
  const [entityId, setEntityId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventTypes, setEventTypes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      entity_id: entityId,
      start_date: startDate || null,
      end_date: endDate || null,
      event_types: eventTypes ? eventTypes.split(',').map(s => s.trim()) : null
    };
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Entity Activity Timeline</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div>
          <label>Entity ID</label><br />
          <input value={entityId} onChange={e => setEntityId(e.target.value)} required />
        </div>
        <div>
          <label>Start Date</label><br />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date</label><br />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Event Types (comma-separated)</label><br />
          <input value={eventTypes} onChange={e => setEventTypes(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Generating...' : 'Generate Timeline'}
        </button>
      </form>

      {result && (
        <div>
          {result.error && <div style={{ color: 'red' }}>{String(result.error)}</div>}
          {result.inactivity_flag && <div style={{ color: 'orange' }}>Inactivity gap detected (>7 days)</div>}
          <h2>Event Counts</h2>
          <pre>{JSON.stringify(result.event_counts, null, 2)}</pre>
          <h2>Predicted Next</h2>
          <div>{result.predicted_next || 'Insufficient data'}</div>
          <h2>Anomalies</h2>
          <pre>{JSON.stringify(result.anomalies, null, 2)}</pre>
          <h2>Timeline</h2>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                {result.timeline && result.timeline.length > 0 && Object.keys(result.timeline[0]).map(k => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.timeline && result.timeline.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default App;
