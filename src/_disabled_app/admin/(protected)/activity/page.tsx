'use client';

import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminProvider';
import { AdminIcon } from '@/components/admin/icons';

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ActivityPage() {
  const { activity } = useAdmin();
  const [filter, setFilter] = useState('all');

  const types = useMemo(() => Array.from(new Set(activity.map((a) => a.entity_type))).sort(), [activity]);
  const rows = filter === 'all' ? activity : activity.filter((a) => a.entity_type === filter);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[15px] text-[#5A6A66]">Every add, edit, publish and delete is recorded here.</p>
          <p className="mt-1 text-[13.5px] text-[#7A8C87]">{activity.length} recent entries</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setFilter('all')} className={`rounded-full border px-3.5 py-1.5 text-[13.5px] font-semibold ${filter === 'all' ? 'border-[#0A8E7B] bg-[#E1F3EF] text-[#0B6558]' : 'border-[#D5E2DE] bg-white text-[#5A6A66]'}`}>All</button>
          {types.map((t) => (
            <button key={t} type="button" onClick={() => setFilter(t)} className={`rounded-full border px-3.5 py-1.5 text-[13.5px] font-semibold ${filter === t ? 'border-[#0A8E7B] bg-[#E1F3EF] text-[#0B6558]' : 'border-[#D5E2DE] bg-white text-[#5A6A66]'}`}>{t}</button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5E2DE] bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F8F6] text-[#0A8E7B]"><AdminIcon name="activity" size={24} /></div>
          <h3 className="text-[19px] font-semibold text-[#0B3C49]">No activity yet</h3>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] leading-[1.6] text-[#5A6A66]">Changes made in the editor will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white">
          <div className="divide-y divide-[#F1F5F3]">
            {rows.map((a) => (
              <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#F1F8F6] text-[#0A8E7B]"><AdminIcon name="activity" size={17} /></span>
                  <div>
                    <div className="text-[15px] text-[#16413A]">
                      <span className="font-semibold">{a.actor_name || 'Staff'}</span> · {a.action}{' '}
                      {a.entity_title && <span className="text-[#45605A]">“{a.entity_title}”</span>}
                    </div>
                    <div className="mt-0.5 text-[13px] text-[#7A8C87]">{a.entity_type}</div>
                  </div>
                </div>
                <span className="text-[13px] text-[#7A8C87]">{formatWhen(a.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
