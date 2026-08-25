export default function DirectoryPage() {
  return (
    <main>
      <h1>Directory</h1>
      <p>
        Opt-in directory. Toggle <code>showInDirectory</code> via{' '}
        <code>PUT /api/v1/directory/preferences/:personId</code>.
      </p>
    </main>
  );
}
