import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Trash2, AlertCircle } from 'lucide-react';

/**
 * Premium Modal Component
 * Reusable modal for success, error, and confirmation messages
 */
export default function PremiumModal({ isOpen, onClose, type = 'success', title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  const configs = {
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-200',
      bg: 'from-emerald-50 to-teal-50',
    },
    error: {
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      gradient: 'from-red-600 to-rose-600',
      border: 'border-red-200',
      bg: 'from-red-50 to-rose-50',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      gradient: 'from-amber-600 to-orange-600',
      border: 'border-amber-200',
      bg: 'from-amber-50 to-orange-50',
    },
    delete: {
      icon: Trash2,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      gradient: 'from-red-600 to-rose-600',
      border: 'border-red-200',
      bg: 'from-red-50 to-rose-50',
    },
  };

  const config = configs[type] || configs.success;
  const Icon = config.icon;
  const isConfirmation = type === 'delete' || type === 'warning';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shadow-lg`}>
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-slate-700 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex justify-end gap-3">
            {isConfirmation ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all`}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all`}
              >
                Close
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
