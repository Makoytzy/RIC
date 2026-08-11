import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';

export default function GifScrollHero({ forceComplete }) {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden px-6 py-28 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(229,46,46,0.08),transparent_30%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 max-w-6xl w-full"
      >
        <div className="grid gap-12 lg:grid-cols-[0.95fr_0.8fr] items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#F59E0B] shadow-lg shadow-black/20">
              <Sparkles size={14} />
              Worldwide Custom Motorcycle Parts
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-[-0.04em] text-white">
                Build the ride that turns heads.
              </h1>
              <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Red Indian Customs brings premium components, custom styling, and detailed service together in one modern motorcycle inventory experience.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row items-start sm:items-center">
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full bg-[#E52E2E] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-red-950/40 transition hover:bg-[#ff3b3b]"
              >
                Get Started
              </button>
              <Link
                to="#products"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 hover:text-white"
              >
                Explore catalog <ChevronDown size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111827]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_25%)]" />
              <div className="relative h-96 bg-[url('https://images.unsplash.com/photo-1518118573785-26e8d70d8e9f?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950/90 to-transparent">
                <div className="text-xs uppercase tracking-[0.35em] text-[#F59E0B] mb-2">Custom Garage Essentials</div>
                <div className="text-3xl font-black text-white">Authentic parts. Bold builds.</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
