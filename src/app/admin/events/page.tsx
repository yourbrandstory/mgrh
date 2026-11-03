import AdminModule from '@/components/admin/AdminModule';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const tab = typeof params.tab === 'string' ? params.tab : 'list';
  return <AdminModule kind="events" tab={tab} />;
}
