import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Premium AdminPage scaffold.
 *
 * Props:
 *  title       – page title
 *  description – subtitle / one-liner
 *  tag         – role badge text  (e.g. "Administrator")
 *  icon        – lucide React component  (defaults to Construction)
 *  gradient    – Tailwind gradient classes for the icon bg  (defaults to brand blue)
 *  actions     – string[] of planned action labels
 *  stats       – array of { label, value, sub } for preview stat cards
 *
 * Once a module's real UI is ready, replace this file's import with the real page.
 * Routing, navigation, and role access are already fully wired.
 */
export default function PlaceholderPage({
  title,
  description,
  tag,
  icon: Icon = Construction,
  gradient = 'from-brand-600 to-brand-400',
  actions = [],
  stats = [],
}) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className="min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon badge */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
              style={{ boxShadow: '0 8px 24px -4px rgba(53,104,212,0.35)' }}
            >
              <Icon size={22} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
              <p className="mt-1 text-sm text-slate-500 max-w-md leading-relaxed">{description}</p>
            </div>
          </div>

          {tag && (
            <span
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, #eef4ff 0%, #d9e6ff 100%)',
                color: '#2650ab',
                border: '1px solid #c4d8ff',
              }}
            >
              <Sparkles size={11} />
              {tag}
            </span>
          )}
        </div>

        {/* Accent divider */}
        <div className="mt-5 h-px bg-gradient-to-r from-brand-200 via-slate-200 to-transparent" />
      </motion.div>

      {/* ── Preview Stats (if provided) ─────────────────────────── */}
      {stats.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/70 p-5"
              style={{ boxShadow: '0 2px 12px 0 rgba(15,25,41,0.06)' }}
            >
              {/* Shimmer overlay — hints that data is coming */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.2s linear infinite',
                }}
              />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.sub && <p className="mt-1 text-xs text-slate-400">{stat.sub}</p>}
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Main Coming-Soon Card ────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white"
        style={{ boxShadow: '0 4px 24px 0 rgba(15,25,41,0.06)' }}
      >
        {/* Subtle radial bg glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(53,104,212,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex flex-col items-center py-16 px-6 text-center">
          {/* Big animated icon */}
          <div className="relative mb-6">
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
              style={{ boxShadow: '0 16px 48px -8px rgba(53,104,212,0.4)' }}
            >
              <Icon size={34} className="text-white" strokeWidth={1.5} />
            </div>
            {/* Animated ring */}
            <div
              className="absolute -inset-3 rounded-3xl border-2 border-brand-200 opacity-60"
              style={{ animation: 'pulse 3s ease-in-out infinite' }}
            />
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 mb-4 rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Construction size={11} />
            In Development
          </span>

          <h2 className="text-lg font-bold text-slate-900">{title} is coming soon</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            The route, navigation entry, and role access for{' '}
            <span className="font-semibold text-slate-700">&ldquo;{title}&rdquo;</span> are already
            wired up. It&rsquo;s ready for the backend endpoint and real UI to be connected.
          </p>

          {/* Action chips */}
          {actions.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {actions.map((action) => (
                <span
                  key={action}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all duration-200 cursor-default group"
                >
                  <ArrowRight
                    size={12}
                    className="text-slate-400 group-hover:text-brand-500 transition-colors"
                  />
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
