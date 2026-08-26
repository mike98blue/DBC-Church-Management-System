import { cmsFetch } from '@/lib/cms';

export default async function AboutPage() {
  let content: string | null = null;
  try {
    const data = await cmsFetch<{ docs: { content: string }[] }>(
      '/api/pages?where[slug][equals]=about&limit=1',
    );
    content = data.docs[0]?.content ?? null;
  } catch {}

  return (
    <main>
      <h1>About</h1>
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: String(content) }} />
      ) : (
        <p>Our story — managed in Payload CMS.</p>
      )}
    </main>
  );
}
