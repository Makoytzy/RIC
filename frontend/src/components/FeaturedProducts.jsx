import { motion } from 'framer-motion';
import { Sparkles, Star, Compass, ChevronRight } from 'lucide-react';

const featureItems = [
  {
    title: 'Curated Collections',
    description: 'Engineered parts selected for premium custom motorcycles.',
    icon: Sparkles
  },
  {
    title: 'Fast Support',
    description: 'Guided ordering and product assistance for every build.',
    icon: Compass
  },
  {
    title: 'Warranty Ready',
    description: 'Quality components backed by reliable trust and service.',
    icon: Star
  }
];

export default function FeaturedProducts({ onInquire }) {
  return (
    <section className="relative z-20 bg-[#090A0F] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div className="grid gap-12 lg:grid-cols-[0.95fr_0.9fr] items-center" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-mono uppercase tracking-[0.35em] text-[#F59E0B] border border-white/10">
              <Sparkles size={14} /> Featured Products
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Gear up with confidence.</h2>
            <p className="max-w-2xl text-sm text-slate-300 leading-relaxed">
              Our curated selection brings together performance, style, and durability for builders who choose the best.
            </p>
            <button
              type="button"
              onClick={onInquire}
              className="inline-flex items-center gap-2 rounded-full bg-[#E52E2E] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-red-950/40 hover:bg-[#ff3b3b]"
            >
              <span>Inquire now</span>
              <ChevronRight size={16} />
            </button>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            {featureItems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-[#111827]/85 p-6 shadow-xl shadow-black/20">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                  <item.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
