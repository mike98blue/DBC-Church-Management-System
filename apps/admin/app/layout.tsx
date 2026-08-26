import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav
        aria-label="Admin"
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          background: '#f5f5f5',
        }}
      >
        <strong>Staff Admin</strong>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/people">People</Link>
        <Link href="/admin/households">Households</Link>
        <Link href="/admin/groups">Groups</Link>
        <Link href="/admin/events">Events</Link>
        <Link href="/admin/giving">Giving</Link>
        <Link href="/admin/directory">Directory</Link>
        <Link href="/admin/background-checks">Background Checks</Link>
        <Link href="/admin/scheduling">Scheduling</Link>
        <Link href="/admin/quickbooks">QuickBooks</Link>
      </nav>
      <section style={{ padding: '1rem' }}>{children}</section>
    </div>
  );
}
