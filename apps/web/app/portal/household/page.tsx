'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const MOCK_PERSON_ID = '00000000-0000-0000-0000-000000000001';

export default function HouseholdPage() {
  const [household, setHousehold] = useState<{
    id: string;
    name: string;
    members?: { personId: string; role: string }[];
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const personId =
      typeof window !== 'undefined'
        ? (localStorage.getItem('personId') ?? MOCK_PERSON_ID)
        : MOCK_PERSON_ID;
    apiFetch<{ id: string; name: string }[]>(`/api/v1/households?personId=${personId}`)
      .then(async (list) => {
        const first = Array.isArray(list)
          ? ((list[0] as { id: string; name: string }) ?? null)
          : null;
        if (first) {
          try {
            const detail = await apiFetch<{
              household: { id: string; name: string };
              members: { personId: string; role: string }[];
            }>(`/api/v1/households/${first.id}`);
            setHousehold({ ...detail.household, members: detail.members });
          } catch {
            setHousehold(first as { id: string; name: string });
          }
        } else {
          setStatus('No household found for current user');
        }
      })
      .catch((e) => setStatus(e instanceof Error ? e.message : 'Failed to load household'));
  }, []);

  return (
    <main>
      <h1>Household</h1>
      {household ? (
        <>
          <p>
            Household from API (live, scoped to your <code>personId</code>):{' '}
            <code>{household.name}</code> ({household.id})
          </p>
          {household.members && household.members.length > 0 && (
            <ul>
              {household.members.map((m) => (
                <li key={m.personId}>
                  {m.personId} — {m.role}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>
          {status ?? (
            <>
              View your household. Live fetch via <code>GET /api/v1/households?personId=</code>.
            </>
          )}
        </p>
      )}
    </main>
  );
}
