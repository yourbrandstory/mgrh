import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import DraftBanner from '@/components/DraftBanner';
import { settings } from '@/data/siteContent';
import { getCategories, getDoctors } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Doctors / Our Medical Team | ${settings.hospital_name}`,
};

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { preview?: string; speciality?: string };
}) {
  const preview = searchParams.preview === '1';
  const [result, categories] = await Promise.all([
    getDoctors(preview),
    getCategories('doctors'),
  ]);
  const active = searchParams.speciality || '';
  const doctors = active ? result.rows.filter((d) => d.speciality === active) : result.rows;

  return (
    <>
      {result.preview && <DraftBanner />}
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <Link href="/" className="text-muted hover:text-primary-dark">Home</Link> <span className="mx-2">/</span> <span className="text-ink">Doctors</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[56px] lg:text-[66px]">
            Our <span className="font-bold">Medical Team</span>
          </h1>
          <p className="mb-8 max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[21px]">
            Meet our resident medical officers and visiting specialists. You do not need to request a specific doctor — register at the OPD counter and staff will direct you.
          </p>

          {categories.length > 0 && (
            <div className="mb-9 flex flex-wrap gap-2">
              <Link
                href={preview ? '/doctors?preview=1' : '/doctors'}
                className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition-colors ${
                  active ? 'border-[#9FD0C7] bg-white text-[#0B5F55]' : 'border-primary bg-primary text-white'
                }`}
              >
                All specialities
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/doctors?${preview ? 'preview=1&' : ''}speciality=${encodeURIComponent(c)}`}
                  className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition-colors ${
                    active === c ? 'border-primary bg-primary text-white' : 'border-[#9FD0C7] bg-white text-[#0B5F55] hover:border-primary'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}

          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[17px] text-muted">
              No doctors are published yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {doctors.map((d) => (
                <div key={d.id} className="rounded-2xl border border-line bg-white p-6">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-mint-2 text-[20px] font-bold text-primary">
                    {initials(d.name)}
                  </div>
                  <div className="mb-1 text-[20px] font-semibold text-primary-deep md:text-[24px]">{d.name}</div>
                  <div className="mb-2 text-[17px] text-body">{d.designation}</div>
                  <div className="text-[16px] font-semibold text-teal">{d.speciality}</div>
                  {d.showContact && d.contact && (
                    <div className="mt-2 text-[15px] text-muted">{d.contact}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
