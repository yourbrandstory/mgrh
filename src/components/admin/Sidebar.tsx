'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from './AdminProvider';
import Icon, { Mark, type IconName } from './Icon';

const NAV: [string, IconName, string][] = [
  ['doctors', 'doc', 'Doctors'],
  ['facilities', 'fac', 'Facilities'],
  ['events', 'ev', 'Events'],
];

export default function Sidebar() {
  const admin = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="side">
      <div className="brandrow">
        <div className="mark">
          <Mark />
        </div>
        <div>
          <b>MGRH</b>
          <small>Content admin</small>
        </div>
      </div>
      <nav className="nav" aria-label="Main">
        {NAV.map(([key, icon, label]) => {
          const active = pathname === '/admin/' + key || pathname.startsWith('/admin/' + key + '/');
          return (
            <Link
              key={key}
              href={'/admin/' + key}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="who">
        <span>
          {admin.user ? admin.user.name + ' · ' + admin.user.role : ''}
        </span>
        <button
          className="btn sm"
          type="button"
          onClick={async () => {
            await admin.logout();
            router.replace('/admin/login');
          }}
        >
          <Icon name="out" size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
