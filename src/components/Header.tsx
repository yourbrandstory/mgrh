import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteContent } from '../hooks/useSiteContent';
import { AlertCircle, CloseIcon, MenuIcon } from './Icons';

export function TopBand() {
  const { settings } = useSiteContent();
  return (
    <div className="bg-primary-dark text-white">
      <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-x-5 gap-y-1.5 px-4 py-[11px] text-[14px] font-medium sm:px-[26px] md:text-[16.5px]">
        <span>{settings.top_band_text}</span>
        <span className="inline-flex flex-wrap items-center gap-[22px]">
          <Link href="/contact" className="text-[#C7EDE6] hover:text-white">Contact</Link>
          <Link href="/support" className="text-[#C7EDE6] hover:text-white">Support us</Link>
          <a href={settings.phone_href} className="font-bold text-white hover:text-white">{settings.phone}</a>
        </span>
      </div>
    </div>
  );
}

export function Header() {
  const { settings, navItems } = useSiteContent();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const navClass = (href: string) =>
    `flex-none whitespace-nowrap rounded-md px-[15px] py-[9px] font-medium transition-colors hover:bg-mint-2 ${
      pathname === href ? 'text-primary' : 'text-nav hover:text-primary-dark'
    }`;

  return (
    <header className="sticky top-0 z-[60] border-b border-line-2 bg-white">
      <div className="mx-auto flex max-w-site items-center justify-between gap-6 px-4 py-[10px] sm:px-[26px] xl:py-[14px]">
        <Link href="/" className="block flex-none" aria-label={`${settings.hospital_name} — home`}>
          <img src={settings.logo_url} alt={settings.hospital_name} className="block h-[72px] w-auto md:h-[96px] xl:h-[132px]" />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-end xl:flex" aria-label="Main">
          <div className="ml-auto flex min-w-0 items-center text-[24px]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/emergency"
            className="ml-[14px] inline-flex flex-none items-center gap-2 whitespace-nowrap rounded-md bg-emergency px-5 py-3 text-[22px] font-bold text-white transition-colors hover:bg-[#C42A21] hover:text-white"
          >
            <AlertCircle /> Emergency
          </Link>
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
          <Link
            href="/emergency"
            className="inline-flex items-center gap-1.5 rounded-md bg-emergency px-3 py-2.5 text-[15px] font-bold text-white hover:text-white sm:px-4 sm:text-[17px]"
          >
            <AlertCircle size={16} /> Emergency
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-line-2"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] xl:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 animate-veil bg-[rgba(9,45,40,0.62)] backdrop-blur-[3px]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[min(86vw,360px)] animate-pop flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface px-5 py-4">
              <img src={settings.logo_url} alt="" className="h-14 w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line-2"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col overflow-y-auto px-3 py-3 text-[19px]" aria-label="Mobile">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={navClass(item.href)}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t border-surface p-5">
              <a href={settings.phone_href} className="flex items-center justify-center rounded-full bg-primary px-5 py-3.5 text-[18px] font-bold text-white hover:text-white">
                Call {settings.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
