import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

/**
 * Toast Notification Component
 * 
 * A production-ready, accessible, and fully responsive toast notification system
 * that supports success, error, warning, and info message types.
 * 
 * @param {Object} props
 * @param {string} props.type - Message type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.title - Toast title (optional)
 * @param {string} props.message - Toast message content
 * @param {boolean} props.visible - Controls toast visibility
 * @param {function} props.onClose - Callback when toast is closed
 * @param {number} props.duration - Auto-dismiss duration in ms (default: 5000, 0 to disable)
 * @param {boolean} props.pauseOnHover - Pause auto-dismiss on hover (default: true)
 * @param {string} props.position - Toast position: 'top-right' | 'top-center' | 'center' (default: 'top-right')
 */
export default function Toast({
  type = 'info',
  title,
  message,
  visible = false,
  onClose,
  duration = 5000,
  pauseOnHover = true,
  position = 'top-right'
}) {
  const timerRef = useRef(null);
  const isPausedRef = useRef(false);

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const config = {
    success: {
      icon: CheckCircle,
      title: title || 'Success',
      colorClasses: 'border-emerald-400/40 bg-emerald-500/95',
      iconColor: 'text-white',
      textColor: 'text-white'
    },
    error: {
      icon: AlertCircle,
      title: title || 'Error',
      colorClasses: 'border-rose-400/40 bg-rose-500/95',
      iconColor: 'text-white',
      textColor: 'text-white'
    },
    warning: {
      icon: AlertTriangle,
      title: title || 'Warning',
      colorClasses: 'border-amber-400/40 bg-amber-500/95',
      iconColor: 'text-white',
      textColor: 'text-white'
    },
    info: {
      icon: Info,
      title: title || 'Information',
      colorClasses: 'border-blue-400/40 bg-blue-500/95',
      iconColor: 'text-white',
      textColor: 'text-white'
    }
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  // ============================================================
  // ANIMATION VARIANTS
  // ============================================================

  const getVariants = () => {
    // Desktop animations
    const desktop = {
      topRight: {
        hidden: { opacity: 0, x: 100, scale: 0.95 },
        visible: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 50, scale: 0.95 }
      },
      topCenter: {
        hidden: { opacity: 0, y: -50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -30, scale: 0.95 }
      },
      center: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      }
    };

    // Mobile uses slide down from top for all positions
    const mobile = {
      hidden: { opacity: 0, y: -50, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -30, scale: 0.95 }
    };

    // Return desktop variants for larger screens, mobile for smaller
    return typeof window !== 'undefined' && window.innerWidth < 640
      ? mobile
      : desktop[position.replace('top-', '').replace('-', '')] || desktop.topRight;
  };

  // ============================================================
  // POSITIONING CLASSES
  // ============================================================

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'fixed top-4 right-4 sm:top-6 sm:right-6 safe-top safe-right',
      'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 sm:top-6 safe-top',
      'center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    };

    return positions[position] || positions['top-right'];
  };

  // ============================================================
  // AUTO-DISMISS LOGIC
  // ============================================================

  useEffect(() => {
    if (visible && duration > 0) {
      timerRef.current = setTimeout(() => {
        if (!isPausedRef.current && onClose) {
          onClose();
        }
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [visible, duration, onClose]);

  // ============================================================
  // PAUSE/RESUME ON HOVER
  // ============================================================

  const handleMouseEnter = () => {
    if (pauseOnHover && timerRef.current) {
      isPausedRef.current = true;
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && duration > 0) {
      isPausedRef.current = false;
      timerRef.current = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, duration);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          className={`toast-container ${getPositionClasses()} z-[100] w-[calc(100%-2rem)] sm:w-auto sm:max-w-md pointer-events-auto`}
          variants={getVariants()}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <motion.div
            className={`
              ${currentConfig.colorClasses}
              ${currentConfig.textColor}
              rounded-2xl border backdrop-blur-xl
              shadow-2xl
              px-4 py-3.5
              sm:px-5 sm:py-4
            `}
            animate={{
              boxShadow: [
                '0 10px 40px rgba(0, 0, 0, 0.3)',
                '0 15px 50px rgba(0, 0, 0, 0.35)',
                '0 10px 40px rgba(0, 0, 0, 0.3)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <motion.div
                className="flex-shrink-0 mt-0.5"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  delay: 0.1
                }}
              >
                <Icon 
                  size={20} 
                  className={`${currentConfig.iconColor} drop-shadow-lg sm:w-[22px] sm:h-[22px]`}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Content */}
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.15,
                  duration: 0.3
                }}
              >
                {/* Title */}
                {currentConfig.title && (
                  <p className="text-sm sm:text-base font-bold leading-tight mb-1 drop-shadow-md">
                    {currentConfig.title}
                  </p>
                )}

                {/* Message */}
                {message && (
                  <p className="text-xs sm:text-sm font-medium leading-snug drop-shadow-md break-words">
                    {message}
                  </p>
                )}
              </motion.div>

              {/* Close Button */}
              <motion.button
                type="button"
                onClick={onClose}
                className="
                  flex-shrink-0 rounded-lg
                  p-1.5 sm:p-2
                  min-w-[44px] min-h-[44px]
                  sm:min-w-0 sm:min-h-0
                  flex items-center justify-center
                  transition-all
                  hover:bg-white/20
                  active:scale-95
                  focus:outline-none
                  focus:ring-2
                  focus:ring-white/50
                  focus:ring-offset-2
                  focus:ring-offset-transparent
                "
                aria-label="Close notification"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  delay: 0.2
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X 
                  size={16} 
                  className="text-white drop-shadow-md sm:w-[18px] sm:h-[18px]"
                  aria-hidden="true"
                />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
