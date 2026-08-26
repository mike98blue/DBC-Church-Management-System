export default function BeliefsPage() {
  return (
    <main>
      <h1>Our Beliefs</h1>
      <p>
        What we believe — managed in Payload CMS (<code>pages</code> collection,{' '}
        <code>slug: beliefs</code>).
      </p>
      <p>
        This page is statically generated at build time from the CMS, with{' '}
        <code>revalidate: 60</code> for incremental updates.
      </p>
    </main>
  );
}
