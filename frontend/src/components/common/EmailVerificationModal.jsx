import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, X } from 'lucide-react';
import Button from './Button.jsx';

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export default function EmailVerificationModal({ isOpen, onClose, email }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10"
            variants={modalVariants}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Animated rings */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Main icon */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/30">
                  <Mail className="h-10 w-10 text-white" />
                  
                  {/* Check mark badge */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                  >
                    <CheckCircle className="h-4 w-4 text-white" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-center">
              {/* Title */}
              <motion.h2
                className="text-2xl font-bold tracking-tight text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Check Your Email
              </motion.h2>

              {/* Message */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm leading-relaxed text-slate-200">
                  We've sent a verification link to
                </p>
                
                <div className="inline-block rounded-xl bg-white/10 px-4 py-2 backdrop-blur-xl">
                  <p className="text-sm font-semibold text-white">
                    {email}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-300">
                  Click the link in the email to verify your account and complete the registration process.
                </p>
              </motion.div>

              {/* Instructions */}
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-2 text-left">
                  <p className="text-xs font-semibold text-slate-200">
                    What's next?
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        1
                      </span>
                      <span>Check your email inbox</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        2
                      </span>
                      <span>Click the verification link</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        3
                      </span>
                      <span>Return here and log in</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Didn't receive email? */}
              <motion.p
                className="text-xs text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Didn't receive the email? Check your spam folder or contact support.
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40"
                >
                  Got it, thanks!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
