export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
      <div className="max-w-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Website ready · draft mode
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Your website is live on Vercel.
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          This is the starter. Ask Business Brain to generate designs, or edit the content directly in <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">app/page.tsx</code>.
        </p>
        <div className="flex flex-col gap-3 text-left sm:flex-row sm:justify-center">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:max-w-xs">
            <div className="mb-1 text-sm font-semibold text-slate-900">Next step</div>
            <div className="text-xs text-slate-600">Ask the AI: <em>&quot;Show me 3 design options for this site&quot;</em></div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:max-w-xs">
            <div className="mb-1 text-sm font-semibold text-slate-900">When you&apos;re ready</div>
            <div className="text-xs text-slate-600">Tell the AI <em>&quot;go live&quot;</em> — add a domain + analytics.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
