/**
 * Payload CMS scaffold — collections per blueprint Section 14 and ADR 0005.
 *
 * This file defines the content architecture as typed interfaces. The next
 * step (D-01) installs Payload CMS and turns these into live collections
 * with admin UI (Page, Ministry, StaffProfile, Sermon, etc.).
 *
 * Boundaries enforced:
 * - Events come from ChurchOS events domain, not CMS.
 * - Groups shown publicly come from a public projection.
 * - Giving pages are ChurchOS pages that start a hosted checkout.
 */

export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: unknown;
  seoTitle?: string;
  seoDescription?: string;
  openGraphImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
}

export interface Ministry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  leaderIds?: string[];
  status: 'draft' | 'published';
}

export interface StaffProfile {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  photoUrl?: string;
  order?: number;
}

export interface SermonSeries {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface Speaker {
  id: string;
  name: string;
  bio?: string;
}

export interface Sermon {
  id: string;
  title: string;
  slug: string;
  description?: string;
  date: string;
  seriesId?: string;
  speakerId?: string;
  scriptureRefs?: string[];
  videoProvider?: 'youtube' | 'vimeo' | 'mux';
  videoId?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  status: 'draft' | 'published';
}

export interface Announcement {
  id: string;
  title: string;
  body?: string;
  startsAt?: string;
  endsAt?: string;
  status: 'draft' | 'published';
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface Navigation {
  id: string;
  name: string;
  items: NavigationItem[];
}

export interface Redirect {
  from: string;
  to: string;
  type: 301 | 302;
}

export type CmsCollection =
  | 'pages'
  | 'ministries'
  | 'staffProfiles'
  | 'sermonSeries'
  | 'speakers'
  | 'sermons'
  | 'announcements'
  | 'navigation'
  | 'redirects';

/** Registry used by the web app to know which collections are CMS-owned. */
export const CMS_COLLECTIONS: CmsCollection[] = [
  'pages',
  'ministries',
  'staffProfiles',
  'sermonSeries',
  'speakers',
  'sermons',
  'announcements',
  'navigation',
  'redirects',
];
