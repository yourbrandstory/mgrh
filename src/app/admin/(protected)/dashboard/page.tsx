'use client';

import Link from 'next/link';
import { useAdmin, type Row } from '@/components/admin/AdminProvider';
import { AdminIcon } from '@/components/admin/icons';
import { StatusBadge } from '@/components/admin/ui';

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function DashboardPage() {
  const { profile, doctors, facilities, events, activity } = useAdmin();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (profile?.full_name || 'there').split(/\s+/)[0];
  const review = facilities.filter((f) => f.needs_review);
  const draftCount = [...doctors, ...facilities, ...events].filter((r) => r.status === 'draft').length;
  const drafts = [
    ...doctors.map((d): Row => ({ ...d, _type: 'Doctor', _href: `/admin/doctors?edit=${d.id}` })),
    ...facilities.map((f): Row => ({ ...f, _type: 'Facility', _href: `/admin/facilities?edit=${f.id}` })),
    ...events.map((e): Row => ({ ...e, _type: 'Event', _href: `/admin/events?edit=${e.id}` })),
  ].filter((r) => r.status === 'draft');

  const tasks = [
    {
      title: 'Doctors',
      count: `${doctors.length} doctors · ${doctors.filter((d) => d.status === 'published').length} live`,
      desc: 'Add a new doctor, change consultation timings, or update a profile photo.',
      href: '/admin/doctors',
      addHref: '/admin/doctors?new=1',
      addLabel: 'Add a doctor',
      icon: 'doctors',
      tint: '#E1F3EF',
    },
    {
      title: 'Facilities',
      count: `${facilities.length} facilities · ${facilities.filter((f) => f.status === 'published').length} live`,
      desc: 'Update department descriptions and the photos shown on the public website.',
      href: '/admin/facilities',
      addHref: '/admin/facilities?new=1',
      addLabel: 'Add a facility',
      icon: 'facilities',
      tint: '#EAF1FB',
    },
    {
      title: 'Camps & events',
      count: `${events.length} events · ${events.filter((e) => e.status === 'published').length} live`,
      desc: 'List upcoming camps, blood donation drives and school clinics.',
      href: '/admin/events',
      addHref: '/admin/events?new=1',
      addLabel: 'Add an event',
      icon: 'events',
      tint: '#FDF1E3',
    },
  ];

  return (
    <>
      <div className="mb-[26px]">
        <div className="mb-1.5 text-[15px] text-[#7A8C87]">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.015em] text-[#0B3C49] md:text-[32px]">{greet}, {firstName}.</h2>
        <p className="text-[17px] text-[#45605A] md:text-[18px]">What would you like to update on the website today?</p>
      </div>

      {review.length > 0 && (
        <div className="mb-[26px] rounded-2xl border border-[#F1DFB6] bg-[#FFF8E8] px-5 py-4">
          <div className="mb-2 flex items-center gap-2 text-[16px] font-semibold text-[#8A6A2A]">
            <AdminIcon name="activity" size={18} color="#8A6A2A" />
            {review.length} {review.length === 1 ? 'facility needs' : 'facilities need'} your review
          </div>
          <p className="mb-3 text-[15px] leading-[1.5] text-[#8A6A2A]">
            These facilities have no description yet. Add one confirmed by the hospital before publishing.
          </p>
          <div className="flex flex-wrap gap-2">
            {review.map((f) => (
              <Link key={f.id} href={`/admin/facilities?edit=${f.id}`} className="rounded-full border border-[#E7CE93] bg-white px-3.5 py-1.5 text-[14px] font-semibold text-[#7A5A1C] hover:border-[#C9A657]">
                {f.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-[26px] grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {tasks.map((t) => (
          <div key={t.title} className="flex flex-col gap-3.5 rounded-2xl border border-[#E2ECE9] bg-white p-6">
            <div className="flex items-center gap-3.5">
              <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px]" style={{ background: t.tint }}>
                <AdminIcon name={t.icon} size={24} color="#0B6558" />
              </span>
              <div>
                <div className="text-[21px] font-semibold text-[#0B3C49]">{t.title}</div>
                <div className="mt-0.5 whitespace-nowrap text-[14.5px] text-[#7A8C87]">{t.count}</div>
              </div>
            </div>
            <p className="text-[15.5px] leading-[1.55] text-[#45605A]">{t.desc}</p>
            <div className="mt-auto flex gap-2.5">
              <Link href={t.addHref} className="flex h-[46px] flex-1 items-center justify-center whitespace-nowrap rounded-[10px] bg-[#0A8E7B] text-[15.5px] font-bold text-white hover:bg-[#0B7F73] hover:text-white">
                {t.addLabel}
              </Link>
              <Link href={t.href} className="flex h-[46px] flex-1 items-center justify-center whitespace-nowrap rounded-[10px] border border-[#9FD0C7] bg-white text-[15.5px] font-semibold text-[#0B5F55] hover:border-[#0A8E7B] hover:text-[#0B5F55]">
                See all
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-[18px] xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-[#E2ECE9] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1F5F3] px-5 py-4">
            <h3 className="text-[18px] font-semibold text-[#0B3C49]">Recent activity</h3>
            <Link href="/admin/activity" className="text-[14px] font-semibold">See all</Link>
          </div>
          {activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-[15px] text-[#7A8C87]">Changes will appear here as the team edits the website.</p>
          ) : (
            <div className="divide-y divide-[#F1F5F3]">
              {activity.slice(0, 7).map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <div>
                    <div className="text-[15px] text-[#16413A]">
                      <span className="font-semibold">{a.actor_name || 'Staff'}</span> · {a.action}{' '}
                      <span className="text-[#45605A]">{a.entity_title}</span>
                    </div>
                    <div className="mt-0.5 text-[13px] text-[#7A8C87]">{a.entity_type}</div>
                  </div>
                  <span className="flex-none text-[13px] text-[#7A8C87]">{timeAgo(a.at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E2ECE9] bg-white p-5">
          <h3 className="mb-1 text-[18px] font-semibold text-[#0B3C49]">Publishing status</h3>
          <p className="mb-4 text-[14px] text-[#7A8C87]">{draftCount} item{draftCount === 1 ? '' : 's'} still in draft.</p>
          <div className="space-y-3">
            {drafts
              .slice(0, 6)
              .map((r) => (
                <Link key={`${r._type}-${r.id}`} href={r._href} className="flex items-center justify-between gap-3 rounded-lg border border-[#F1F5F3] px-3 py-2.5 hover:border-[#BFE3DB] hover:bg-[#F7FBFA]">
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-medium text-[#16413A]">{r.name || r.title}</span>
                    <span className="text-[12.5px] text-[#7A8C87]">{r._type}</span>
                  </span>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            {draftCount === 0 && <p className="text-[14.5px] text-[#7A8C87]">Everything is published.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
