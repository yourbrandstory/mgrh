import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-site px-4 py-24 md:py-32">
          <div className="mb-4 text-[14px] font-semibold uppercase tracking-[0.14em] text-teal md:text-[16px]">404</div>
          <h1 className="mb-5 text-[36px] font-semibold leading-[1.08] tracking-[-0.028em] text-primary-deep md:text-[52px]">Page not found</h1>
          <p className="mb-9 max-w-[640px] text-[18px] leading-[1.6] text-body md:text-[21px]">
            We couldn’t find that page. For anything urgent, please call the hospital — casualty is open 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-[11px] rounded-full bg-primary px-6 py-[14px] text-[17px] font-bold text-white hover:bg-primary-dark hover:text-white md:px-[30px] md:py-4 md:text-[20px]"
          >
            Back to home
        </Link>
      </section>
  );
}
