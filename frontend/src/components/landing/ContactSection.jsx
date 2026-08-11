import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="relative z-20 bg-[#0B0D14] border-t border-white/5 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div className="grid gap-10 lg:grid-cols-[0.95fr_0.55fr] items-start" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-mono uppercase tracking-[0.35em] text-[#F59E0B] border border-white/10">
              Contact
            </div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black text-white">Let’s make your next build legendary.</h2>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 leading-relaxed">
              Reach out for product inquiries, custom build support, or premium parts for your shop.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111827]/85 p-8 shadow-2xl shadow-black/20">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-2xl bg-[#3B82F6]/10 p-3 text-[#3B82F6]">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="mt-1 text-base font-semibold text-white">+63 951 233 5791</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-2xl bg-[#E52E2E]/10 p-3 text-[#E52E2E]">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="mt-1 text-base font-semibold text-white">sales@redindiancustom-motorcycles.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-2xl bg-[#F59E0B]/10 p-3 text-[#F59E0B]">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="mt-1 text-base font-semibold text-white">Mandaue City, Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
