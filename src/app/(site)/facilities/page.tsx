import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import DraftBanner from '@/components/DraftBanner';
import { settings } from '@/data/siteContent';
import { getFacilities, type PublicFacility } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Facilities & Services | ${settings.hospital_name}`,
};

function anchor(name: string) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function FacilityCard({ facility }: { facility: PublicFacility }) {
  return (
    <article id={anchor(facility.name)} className="scroll-mt-[150px] overflow-hidden rounded-2xl border border-line bg-white">
      <div className="aspect-[16/10] bg-surface">
        <img
          src={facility.coverImageUrl || '/images/hospital-building.jpg'}
          alt={facility.images[0]?.alt || facility.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-6">
        {facility.subcategory && (
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">{facility.subcategory}</div>
        )}
        <h3 className="text-[22px] font-semibold leading-[1.25] text-primary-deep md:text-[24px]">{facility.name}</h3>
        <p className="mt-3 text-[17px] leading-[1.6] text-body">{facility.shortDescription || facility.fullDescription}</p>
        {facility.fullDescription && facility.shortDescription && (
          <p className="mt-2 text-[16px] leading-[1.6] text-body">{facility.fullDescription}</p>
        )}
        {facility.subitems.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {facility.subitems.map((u, i) => (
              <li key={`${u.name}-${i}`} className="text-[16px] leading-[1.55] text-body">
                <span className="font-semibold text-primary-deep">{u.name}</span>
                {u.text ? <span className="text-muted"> — {u.text}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: { preview?: string };
}) {
  const preview = searchParams.preview === '1';
  const result = await getFacilities(preview);

  const groups: { category: string; items: PublicFacility[] }[] = [];
  result.rows.forEach((facility) => {
    const group = groups.find((g) => g.category === facility.category);
    if (group) group.items.push(facility);
    else groups.push({ category: facility.category, items: [facility] });
  });

  return (
    <>
      {result.preview && <DraftBanner />}
      <section className="bg-white">
        <Container className="pt-[46px] pb-[60px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <Link href="/" className="text-muted hover:text-primary-dark">Home</Link> <span className="mx-2">/</span> <span className="text-ink">Facilities</span>
          </div>
          <h1 className="mb-5 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[48px] lg:text-[56px]">
            Our Facilities <span className="font-bold">and Services</span>
          </h1>
          <p className="max-w-[880px] text-[18px] leading-[1.6] text-body md:text-[21px]">{settings.facilities_intro}</p>
        </Container>
      </section>

      {groups.length === 0 ? (
        <section className="bg-[#F4FAF8]">
          <Container className="py-16">
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[17px] text-muted">
              No facilities are published yet.
            </div>
          </Container>
        </section>
      ) : (
        <>
          <section className="border-y border-[#E6EFEC] bg-[#F4FAF8]">
            <Container className="flex flex-wrap items-center gap-2 py-4">
              <span className="mr-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Jump to a section</span>
              {groups.map((g) => (
                <a key={g.category} href={`#${anchor(g.category)}`} className="rounded-full border border-[#D2E8E3] bg-white px-4 py-2 text-[14px] font-medium text-[#1F3A34] hover:border-primary hover:text-primary-dark">
                  {g.category}
                </a>
              ))}
            </Container>
          </section>

          {groups.map((group, index) => (
            <section key={group.category} id={anchor(group.category)} className={`scroll-mt-[150px] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F7FBFA]'}`}>
              <Container className="py-14 md:py-16">
                <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-[27px] font-semibold text-[#12564C] md:text-[31px]">{group.category}</h2>
                  <span className="text-[15px] text-muted">
                    {group.items.length} {group.items.length === 1 ? 'service' : 'services'}
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {group.items.map((facility) => (
                    <FacilityCard key={facility.id} facility={facility} />
                  ))}
                </div>
              </Container>
            </section>
          ))}
        </>
      )}

      <section className="bg-gradient-to-r from-[#0A8E7B] via-[#0C9497] to-[#38ADBE]">
        <Container className="py-12">
          <h3 className="mb-2 text-[25px] font-semibold text-white">Not sure which department you need?</h3>
          <p className="max-w-[760px] text-[17px] leading-[1.6] text-white/90">
            Come to the OPD counter or call the hospital office and the staff will guide you to the right doctor or department.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-lg bg-white px-5 py-3 text-[16px] font-bold text-primary">Contact the hospital</Link>
            <a href={settings.phone_href} className="rounded-lg border border-white/60 px-5 py-3 text-[16px] font-semibold text-white hover:bg-white/10">
              Call {settings.phone}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
