'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const MOCK_PERSON_ID = '00000000-0000-0000-0000-000000000001';

export default function DirectoryPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q?.trim() ?? '';
  const [entries, setEntries] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [prefs, setPrefs] = useState({
    showInDirectory: false,
    showEmail: false,
    showPhone: false,
    showAddress: false,
  });
  const [personId, setPersonId] = useState(MOCK_PERSON_ID);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('personId') : null;
    if (stored) setPersonId(stored);
  }, []);

  useEffect(() => {
    apiFetch<{ id: string; firstName: string; lastName: string }[] | { data: unknown[] }>(
      q ? `/api/v1/directory?q=${encodeURIComponent(q)}` : '/api/v1/directory',
    )
      .then((data) => {
        if (Array.isArray(data))
          setEntries(data as { id: string; firstName: string; lastName: string }[]);
      })
      .catch(() => {});
    apiFetch<{
      showInDirectory?: boolean;
      showEmail?: boolean;
      showPhone?: boolean;
      showAddress?: boolean;
    } | null>(`/api/v1/directory/preferences/${personId}`)
      .then((p) => {
        if (p) setPrefs((prev) => ({ ...prev, ...p }));
      })
      .catch(() => {});
  }, [q, personId]);

  async function save() {
    setStatus(null);
    try {
      const updated = await apiFetch<{
        showInDirectory?: boolean;
        showEmail?: boolean;
        showPhone?: boolean;
        showAddress?: boolean;
      }>(`/api/v1/directory/preferences/${personId}`, {
        method: 'PUT',
        body: JSON.stringify(prefs),
      });
      if (updated) setPrefs((prev) => ({ ...prev, ...updated }));
      setStatus('Saved');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Save failed');
    }
  }

  return (
    <main>
      <h1>Directory</h1>
      <form>
        <label>
          Search: <input name="q" defaultValue={q} placeholder="name" />
        </label>{' '}
        <button type="submit">Search</button>
      </form>
      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
        <h2>Your visibility</h2>
        <label>
          <input
            type="checkbox"
            checked={prefs.showInDirectory}
            onChange={(e) => setPrefs((p) => ({ ...p, showInDirectory: e.target.checked }))}
          />{' '}
          Show me in directory
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={prefs.showEmail}
            onChange={(e) => setPrefs((p) => ({ ...p, showEmail: e.target.checked }))}
          />{' '}
          Show email
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={prefs.showPhone}
            onChange={(e) => setPrefs((p) => ({ ...p, showPhone: e.target.checked }))}
          />{' '}
          Show phone
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={prefs.showAddress}
            onChange={(e) => setPrefs((p) => ({ ...p, showAddress: e.target.checked }))}
          />{' '}
          Show address
        </label>
        <br />
        <button type="button" onClick={save}>
          Save preferences (PUT /directory/preferences/:personId)
        </button>
        {status && <span style={{ marginLeft: '0.5rem' }}>{status}</span>}
      </div>
      {entries.length > 0 ? (
        <ul>
          {entries.slice(0, 20).map((e) => (
            <li key={e.id}>
              {e.firstName} {e.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Opt-in directory — only <code>showInDirectory=true</code> entries appear. Toggle via{' '}
          <code>PUT /api/v1/directory/preferences/:personId</code> (self or{' '}
          <code>directory.manage</code>).
        </p>
      )}
      <p>
        <em>
          Private by default; respects <code>directory_preferences</code> per field.
        </em>
      </p>
    </main>
  );
}
