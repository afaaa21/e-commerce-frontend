import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.2),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">TechStore PC Components</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Bangun setup PC terbaik dengan komponen yang tepat.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              TechStore menyediakan komponen PC pilihan mulai dari CPU, GPU, motherboard, RAM, storage, PSU, sampai casing dengan katalog yang mudah dicari.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                Lihat Produk
              </Link>
              <Link to="/builder" className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-100 transition-colors hover:bg-slate-900">
                PC Builder
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-blue-950/30">
            <div className="grid gap-4 sm:grid-cols-2">
              {['CPU', 'GPU', 'RAM', 'Storage'].map(item => (
                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-sm font-bold text-blue-300 ring-1 ring-blue-500/20">
                    {item.slice(0, 2)}
                  </div>
                  <p className="font-semibold text-white">{item}</p>
                  <p className="mt-1 text-sm text-slate-400">Komponen pilihan untuk performa harian sampai gaming.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">Katalog lengkap</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Cari berdasarkan kategori</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Filter produk berdasarkan komponen PC supaya pembelian lebih cepat dan tepat.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">PC Builder</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Rakit sesuai kebutuhan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Pilih komponen bertahap untuk membantu menyusun konfigurasi PC yang sesuai.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">Manajemen pesanan</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Checkout dan pantau order</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Kelola keranjang, buat pesanan, dan lihat status pembelian dari dashboard akun.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
