import { useSiteContent } from '../../hooks/useSiteContent';
import Reveal from '../Reveal';
import { Container, Eyebrow, PillLink } from '../ui';

export function Hero() {
  const { settings: s } = useSiteContent();
  return (
    <section id="top" className="relative overflow-hidden bg-[#EAF6F3]">
      <div className="absolute inset-0 overflow-hidden">
        <img src={s.hero_image_url} alt="" className="block h-full w-full object-cover object-[72%_64%]" />
      </div>
      {/* Readability wash: soft all-over on mobile, angled fade on desktop */}
      <div className="absolute inset-0 bg-[rgba(240,249,247,0.86)] lg:bg-transparent lg:bg-[linear-gradient(96deg,rgba(240,249,247,0.94)_0%,rgba(240,249,247,0.88)_40%,rgba(240,249,247,0.5)_52%,rgba(240,249,247,0)_64%)]" />
      {/* White curve at the bottom */}
      <div className="absolute bottom-[-2px] left-0 right-0 h-[70px] origin-bottom-left scale-x-[1.06] rounded-tl-[100%_70px] bg-white md:h-[190px] md:rounded-tl-[100%_190px]" />

      <Container className="relative z-[3] pb-[86px] pt-12 md:pb-[118px] md:pt-[74px]">
        <div className="max-w-[680px] lg:max-w-[min(46%,680px)]">
          <div className="mb-[26px] flex items-center gap-[9px] text-[14px] font-medium uppercase tracking-[0.14em] text-muted md:text-[16.5px]">
            <span>{s.short_name}</span>
            <span className="opacity-50">/</span>
            <span>{s.town}</span>
          </div>
          <h1 className="mb-[26px] text-balance text-[clamp(40px,4.6vw,74px)] font-medium leading-[0.98] tracking-[-0.035em] text-primary-deep">
            {s.hero_title}
          </h1>
          <p className="mb-10 text-[clamp(17px,1.5vw,24px)] leading-[1.5] text-body">{s.hero_subtitle}</p>
          <div className="flex flex-wrap gap-[14px]">
            <PillLink to="/facilities" arrow className="md:!px-8 md:!py-[17px] md:!text-[21px]">Our departments</PillLink>
            <PillLink to="/doctors" variant="outline" className="md:!px-8 md:!py-[17px] md:!text-[21px]">Find a doctor</PillLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function About() {
  const { settings: s, milestones } = useSiteContent();
  const years = new Date().getFullYear() - s.founded_year;

  return (
    <Reveal className="mx-auto max-w-site px-4 pt-5 sm:px-[26px]">
      <div className="grid grid-cols-1 items-start gap-[62px] lg:grid-cols-2">
        <div>
          <Eyebrow>{s.about_eyebrow}</Eyebrow>
          <h2 className="mb-[22px] max-w-[720px] text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.028em] text-primary-deep md:text-[42px]">
            {s.about_title}
          </h2>
          <p className="mb-5 max-w-[740px] text-[18px] leading-[1.62] text-body md:text-[21px]">{s.about_text}</p>
          <p className="mb-[34px] max-w-[740px] text-[18px] leading-[1.62] text-body md:text-[21px]">{s.about_text_2}</p>

          {/* Timeline */}
          <div className="relative mb-9 max-w-[700px] pl-[30px]">
            <div className="absolute bottom-[10px] left-[5px] top-[10px] w-[2px] bg-[linear-gradient(#0A8E7B,#A8D6CC)]" />
            {milestones.map((m) => (
              <div key={m.year} className="relative pb-[22px]">
                <span className="absolute left-[-30px] top-[7px] h-3 w-3 rounded-full border-[3px] border-primary bg-white" />
                <div className="mb-[3px] text-[16px] font-bold tracking-[0.06em] text-teal md:text-[17px]">{m.year}</div>
                <div className="text-[17px] leading-[1.5] text-body md:text-[19.5px]">{m.text}</div>
              </div>
            ))}
          </div>

          <PillLink to="/about" arrow>Read our history</PillLink>
        </div>

        <div>
          <div className="relative max-w-[760px]">
            <div className="aspect-[4/3] overflow-hidden border-t-4 border-emergency bg-surface">
              <img src={s.about_image_url} alt="The hospital building on Medha Road" className="block h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-[-30px] right-3 max-w-[300px] rounded-2xl border border-line bg-white px-[26px] py-[22px] shadow-[0_26px_52px_-36px_rgba(6,80,68,0.5)] md:right-[-14px]">
              <div className="mb-[7px] text-[30px] font-bold leading-none tracking-[-0.026em] text-primary-deep md:text-[34px]">{years} years</div>
              <div className="text-[16px] leading-[1.48] text-soft md:text-[17.5px]">of healthcare in {s.town}</div>
            </div>
          </div>
          <div className="mx-[2px] mt-[46px] max-w-[760px] text-[15px] text-muted md:text-[17px]">{s.about_image_caption}</div>
          <div className="mt-[30px] max-w-[760px] rounded-2xl border border-[#BEE3DB] bg-mint-2 px-6 py-6 md:px-[30px] md:py-7">
            <div className="mb-3 text-[14px] font-semibold uppercase tracking-[0.12em] text-primary-dark md:text-[15.5px]">Our promise</div>
            <p className="m-0 text-[19px] font-medium leading-[1.46] text-primary-deep md:text-[22px]">{s.promise_text}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function StatsBand() {
  const { settings: s, stats } = useSiteContent();
  return (
    <section className="relative mt-[58px] overflow-hidden bg-[#0B8574] shadow-[inset_0_26px_52px_-32px_rgba(3,42,36,0.9),inset_0_-26px_52px_-32px_rgba(3,42,36,0.75)]">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-[0.28]" style={{ backgroundImage: `url("${s.stats_background_url}")` }} />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,102,88,0.95)_0%,rgba(9,124,108,0.88)_46%,rgba(14,148,142,0.74)_78%,rgba(24,168,178,0.6)_100%)]" />
      <Container className="relative z-[2] pb-[62px] pt-[58px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:gap-11 lg:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="border-t-[3px] border-white/[0.46] pt-5">
              <div className="mb-[9px] text-[34px] font-bold leading-none tracking-[-0.026em] text-white [text-shadow:0_2px_16px_rgba(3,42,36,0.4)] md:text-[46px]">
                {st.value}
              </div>
              <div className="text-[16px] leading-[1.5] text-white md:text-[18.5px]">{st.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function EmergencyReach() {
  const { settings: s } = useSiteContent();
  const rows = [
    { label: 'Address', value: s.address_single_line },
    { label: 'Telephone', value: s.phone },
    { label: 'Email', value: s.email },
    { label: 'OPD hours', value: `${s.opd_hours_morning} and ${s.opd_hours_evening}` },
  ];

  return (
    <Reveal className="mx-auto max-w-site px-4 pt-[64px] sm:px-[26px] md:pt-20">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <div className="rounded-[18px] border border-[#F6D8D5] bg-[#FDF1F0] px-6 py-8 md:px-11 md:py-[42px]">
          <div className="mb-4 inline-flex items-center gap-[10px] text-[14px] font-semibold uppercase tracking-[0.12em] text-emergency-dark md:text-[16px]">
            <span className="h-[9px] w-[9px] animate-blink rounded-full bg-emergency" />
            Emergency &amp; casualty
          </div>
          <h3 className="mb-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.024em] text-emergency-dark md:text-[35px]">{s.emergency_title}</h3>
          <p className="mb-[30px] max-w-[620px] text-[17px] leading-[1.6] text-[#7C4741] md:text-[20px]">{s.emergency_text}</p>
          <div className="flex flex-wrap gap-[14px]">
            <PillLink to={s.phone_href} variant="danger">{s.emergency_phone}</PillLink>
            <PillLink to="/emergency" variant="danger-outline">What to expect</PillLink>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-white px-6 py-8 md:px-11 md:py-[42px]">
          <Eyebrow className="!tracking-[0.12em]">Reach the hospital</Eyebrow>
          <h3 className="mb-[22px] text-[28px] font-semibold leading-[1.12] tracking-[-0.024em] text-[#12564C] md:text-[35px]">{s.reach_title}</h3>
          <div className="mb-7 flex flex-col">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[minmax(0,100px)_1fr] items-baseline gap-4 border-b border-surface py-[13px] sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-teal md:text-[15.5px]">{r.label}</span>
                <span className="break-words text-[16px] leading-[1.5] text-[#23423B] md:text-[19.5px]">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-[14px]">
            <PillLink to="/contact">Contact &amp; directions</PillLink>
            <PillLink to={`https://wa.me/${s.whatsapp_number}`} variant="outline" className="!bg-transparent">WhatsApp us</PillLink>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
