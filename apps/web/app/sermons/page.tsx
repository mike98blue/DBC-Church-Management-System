import { cmsFetch } from '@/lib/cms';

export default async function SermonsPage() {
  let sermons: { id: string; title: string; description?: string }[] = [];
  try {
    const data = await cmsFetch<{ docs: { id: string; title: string; description?: string }[] }>(
      '/api/sermons?limit=20',
    );
    sermons = data.docs;
  } catch {}

  return (
    <main>
      <h1>Sermons</h1>
      {sermons.length > 0 ? (
        <ul>
          {sermons.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong> — {s.description ?? 'No description'}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Sermon metadata from Payload CMS (<code>sermons</code> collection) — video hosted on
          YouTube/Vimeo/Mux per blueprint §17. Run the CMS to see live entries.
        </p>
      )}
    </main>
  );
}
