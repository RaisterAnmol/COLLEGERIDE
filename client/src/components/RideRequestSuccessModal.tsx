// Ride request success confirmation - prefers-reduced-motion compliant
import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants, MotionConfig } from 'framer-motion';
import { X } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface RideRequestSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideName?: string;
}

const RideRequestSuccessModal: React.FC<RideRequestSuccessModalProps> = ({ isOpen, onClose, rideName }) => {
  const prefersReducedMotion = useReducedMotion();

  // Auto-close effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      timeout = setTimeout(() => {
        onClose();
      }, 4000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Animation variants
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.2, ease: 'easeOut' as const }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      transition: { duration: 0.15 }
    }
  };

  const checkmarkVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 0.35, ease: 'easeOut' as const, delay: 0.1 }
    }
  };

  const circleVariants: Variants = {
    hidden: { scale: 0.85, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { duration: 0.25, ease: 'easeOut' as const }
    }
  };

  const textContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const textItemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.25 }
    }
  };

  const progressVariants: Variants = {
    hidden: { width: "100%" },
    visible: { 
      width: "0%",
      transition: { duration: 4, ease: 'linear' as const }
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143D32]/75"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden bg-[#F7FAF8] rounded-2xl shadow-xl flex flex-col items-center p-8 pt-10"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Clean Static Settled Checkmark */}
              <div className="relative mb-6 flex justify-center items-center w-20 h-20">
                <motion.div 
                  className="w-20 h-20 bg-emerald-50 border border-emerald-200/80 rounded-full flex items-center justify-center z-10 shadow-xs"
                  variants={circleVariants}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path
                      d="M5 13L9 17L19 7"
                      stroke="#143D32"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={checkmarkVariants}
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Text Content */}
              <motion.div 
                className="text-center w-full"
                variants={textContainerVariants}
              >
                <motion.h2 
                  id="success-modal-title"
                  className="text-2xl font-bold text-[#143D32] mb-3 font-display"
                  variants={textItemVariants}
                >
                  Seat Request Sent!
                </motion.h2>
                <motion.p 
                  className="text-[#0F172A] opacity-80 text-sm leading-relaxed mb-8"
                  variants={textItemVariants}
                >
                  Your request {rideName ? `for ${rideName} ` : ''}has been sent. The driver will be notified shortly.
                </motion.p>
                
                <motion.button
                  variants={textItemVariants}
                  onClick={onClose}
                  className="w-full py-3 bg-[#143D32] hover:bg-[#0d2820] text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#143D32] focus:ring-offset-2 focus:ring-offset-[#F7FAF8] cursor-pointer"
                >
                  Got it
                </motion.button>
              </motion.div>

              {/* Progress Bar */}
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-[#143D32]"
                variants={progressVariants}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default RideRequestSuccessModal;
