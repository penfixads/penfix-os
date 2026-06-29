export default function Home() {
  const portals = [
    { label: 'CEO Dashboard', url: 'https://admin.penfixads.com', who: 'Boss Allen', color: '#4A0000', text: '#C9A84C' },
    { label: 'Job Orders', url: 'https://jobs.penfixads.com', who: 'GAs / Treasury', color: '#1a3a1a', text: '#7fc97f' },
    { label: 'Production', url: 'https://prod.penfixads.com', who: 'Fabricators', color: '#1a1a3a', text: '#7f9fc9' },
    { label: 'Tools Inventory', url: 'https://tools.penfixads.com', who: 'Fabricators + Ann', color: '#3a2a1a', text: '#c9a87f' },
    { label: 'HR & Skills', url: 'https://hr.penfixads.com', who: 'Boss Allen + Team Leads', color: '#2a1a3a', text: '#c97fc9' },
    { label: 'Client Portal', url: 'https://shop.penfixads.com', who: 'Clients (Phase 2)', color: '#1a2a3a', text: '#7fc9c9' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white tracking-wide">PENFIX OS</h1>
        <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">Penfix Advertising &amp; Business Solutions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {portals.map((p) => (
          <a
            key={p.url}
            href={p.url}
            className="rounded-xl p-6 flex flex-col gap-2 hover:scale-105 transition-transform shadow-lg"
            style={{ backgroundColor: p.color }}
          >
            <span className="text-xs uppercase tracking-widest" style={{ color: p.text }}>{p.who}</span>
            <span className="text-white text-xl font-bold">{p.label}</span>
            <span className="text-xs text-white/40">{p.url}</span>
          </a>
        ))}
      </div>

      <p className="mt-12 text-xs text-gray-600">
        Penfix OS v1.0 — Phase 1 Shell
      </p>
    </main>
  )
}
