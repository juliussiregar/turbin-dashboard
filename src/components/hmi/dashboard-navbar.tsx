import Link from "next/link";

type DashboardNavbarProps = {
  cancelHref?: string;
};

export function DashboardNavbar({ cancelHref }: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-sm">
            V
          </Link>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold tracking-[0.12em] text-slate-900">VOLTARA</div>
            <div className="hidden truncate text-xs text-slate-500 sm:block">PLTGU Senipah · Operations intelligence</div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-500 md:flex">
          <Link href="/" className="rounded-md px-3 py-2 hover:bg-slate-50 hover:text-blue-600">Plant overview</Link>
          <Link href="/dashboard" className="rounded-md bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100">Dashboard</Link>
          <Link href="/trending" className="rounded-md px-3 py-2 hover:bg-slate-50 hover:text-blue-600">Trending</Link>
          <Link href="/analysis" className="rounded-md px-3 py-2 hover:bg-slate-50 hover:text-blue-600">Analysis</Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className={`${cancelHref ? "hidden sm:flex" : "flex"} items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 sm:gap-2 sm:px-3`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live data
          </div>
          {cancelHref ? <Link href={cancelHref} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700">Cancel</Link> : null}
        </div>
      </div>
    </header>
  );
}
