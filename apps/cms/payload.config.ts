import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';

export default buildConfig({
  serverURL: process.env.CMS_SERVER_URL ?? 'http://localhost:3002',
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-in-production',
  admin: { meta: { titleSuffix: '— ChurchOS CMS', title: 'ChurchOS CMS' } },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.CMS_DATABASE_URL ??
        process.env.DATABASE_URL ??
        'postgresql://churchos:churchos@localhost:5432/churchos',
    },
  }),
  collections: [
    {
      slug: 'pages',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'excerpt', type: 'textarea' },
        { name: 'content', type: 'richText' },
        { name: 'seoTitle', type: 'text' },
        { name: 'seoDescription', type: 'textarea' },
        { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
      ],
    },
    {
      slug: 'ministries',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
        { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
      ],
    },
    {
      slug: 'staff-profiles',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'bio', type: 'textarea' },
        { name: 'order', type: 'number' },
      ],
    },
    {
      slug: 'sermon-series',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      slug: 'sermons',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
        { name: 'date', type: 'date', required: true },
        { name: 'series', type: 'relationship', relationTo: 'sermon-series' },
        { name: 'speaker', type: 'relationship', relationTo: 'speakers' },
        { name: 'videoProvider', type: 'select', options: ['youtube', 'vimeo', 'mux'] },
        { name: 'videoId', type: 'text' },
        { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
      ],
    },
    {
      slug: 'speakers',
      admin: { useAsTitle: 'name' },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    {
      slug: 'announcements',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
        { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
      ],
    },
  ],
  // Boundaries: Events/groups/giving are ChurchOS domains, not CMS (ADR 0005)
  typescript: { outputFile: 'payload-types.ts' },
});
