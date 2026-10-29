'use client';

import { useEffect } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function AboutPage() {
  const { settings: s, milestones } = useSiteContent();

  useEffect(() => {
    document.title = `About Us | ${s.hospital_name}`;
  }, [s.hospital_name]);

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-site px-4 pt-[46px] pb-[70px] sm:px-[26px]">
          <div className="mb-6 text-[15px] font-medium text-muted">
            <a href="/" className="text-muted hover:text-primary-dark">Home</a> <span className="mx-2">/</span> <span className="text-ink">About Us</span>
          </div>
          <h1 className="mb-8 text-[36px] font-medium leading-[1.02] tracking-[-0.03em] text-primary-deep md:text-[56px] lg:text-[66px]">
            About <span className="font-bold">Us</span>
          </h1>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-[28px] font-semibold text-primary-deep md:text-[33px]">Who we are</h2>
              <p className="mb-5 text-[18px] leading-[1.6] text-body md:text-[21px]">Serving Mahabaleshwar <span className="font-bold text-primary-deep">since {s.founded_year}</span></p>
              <p className="mb-4 text-[18px] leading-[1.6] text-body md:text-[22px]">{s.about_text}</p>
              <p className="mb-8 text-[18px] leading-[1.6] text-body md:text-[22px]">{s.about_text_2}</p>
              <div className="relative mb-10 pl-8">
                <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary to-[#A8D6CC]" />
                {milestones.map((m) => (
                  <div key={m.year} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-8 top-1 h-3 w-3 rounded-full border-[3px] border-primary bg-white" />
                    <div className="text-[17px] font-bold text-teal">{m.year}</div>
                    <div className="text-[18px] leading-[1.5] text-body md:text-[19.5px]">{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-4 overflow-hidden rounded-xl border-t-4 border-emergency">
                <img src={s.about_image_url} alt={s.about_image_caption} className="h-full w-full object-cover" />
              </div>
              <div className="mb-6 text-[16px] text-muted">{s.about_image_caption}</div>
              <div className="rounded-2xl border border-line bg-[#E8F6F3] p-6 md:p-8">
                <div className="mb-2 text-[15px] font-semibold uppercase tracking-[0.12em] text-teal">Our promise</div>
                <p className="text-[20px] font-medium leading-[1.46] text-primary-deep md:text-[22px]">{s.promise_text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
