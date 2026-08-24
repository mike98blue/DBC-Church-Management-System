import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to DBC Church — join us this Sunday.',
};

export default function HomePage() {
  return (
    <main>
      <h1>DBC Church</h1>
      <p>
        Welcome — we&apos;re a church-owned community building a platform for ministries, groups,
        events, and giving. This site is the public front door (blueprint Epic D).
      </p>
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href="/ministries">Ministries</a>
          </li>
          <li>
            <a href="/sermons">Sermons</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/visit">Visit / New Here</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
