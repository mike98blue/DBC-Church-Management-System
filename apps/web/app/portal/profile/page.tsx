import { apiFetch } from '@/lib/api';

export default async function ProfilePage() {
  // In dev, this will need a mock token with people.read; in prod, the OIDC token
  let person: { id: string; firstName: string; lastName: string } | null = null;
  try {
    const data = await apiFetch<{ data: { id: string; firstName: string; lastName: string }[] }>(
      '/api/v1/people?limit=1',
    );
    person = data.data[0] ?? null;
  } catch {
    // API not running or no auth in this render — show placeholder
  }

  return (
    <main>
      <h1>Profile</h1>
      <p>
        Update your contact information. This form PATCHes <code>/api/v1/people/:id</code>.
      </p>
      {person ? (
        <p>
          Loaded from API:{' '}
          <code>
            {person.firstName} {person.lastName}
          </code>{' '}
          ({person.id})
        </p>
      ) : (
        <p>
          <em>
            Run the API (`pnpm --filter @churchos/api dev`) and set `NEXT_PUBLIC_API_URL` to see
            live data.
          </em>
        </p>
      )}
      <form>
        <label>
          Preferred name: <input name="preferredName" defaultValue={person?.firstName ?? ''} />
        </label>
        <br />
        <button type="submit">Save</button>
      </form>
      <p>
        See <code>@churchos/domain</code> <code>displayName</code>/<code>legalName</code> for name
        handling.
      </p>
    </main>
  );
}
