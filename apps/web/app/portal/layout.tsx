import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav
        aria-label="Portal"
        style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ddd' }}
      >
        <Link href="/portal">Dashboard</Link>
        <Link href="/portal/profile">Profile</Link>
        <Link href="/portal/household">Household</Link>
        <Link href="/portal/groups">Groups</Link>
        <Link href="/portal/events">Events</Link>
        <Link href="/portal/giving">Giving</Link>
        <Link href="/portal/directory">Directory</Link>
      </nav>
      <section style={{ padding: '1rem' }}>{children}</section>
    </div>
  );
}
