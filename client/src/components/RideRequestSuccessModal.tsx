import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RideRequestSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideName?: string;
}

const RideRequestSuccessModal: React.FC<RideRequestSuccessModalProps> = ({ isOpen, onClose, rideName }) => {
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
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', bounce: 0.15, duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 }
    }
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", bounce: 0.4, duration: 0.6 }
    }
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.4 }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const progressVariants = {
    hidden: { width: "100%" },
    visible: { 
      width: "0%",
      transition: { duration: 4, ease: "linear" }
    }
  };

  // Particles (confetti)
  const particles = Array.from({ length: 8 });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Icon & Particles */}
            <div className="relative mb-6 flex justify-center items-center w-24 h-24">
              {particles.map((_, i) => {
                const angle = (i * 360) / particles.length;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-[#10B981]"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: Math.cos((angle * Math.PI) / 180) * 60,
                      y: Math.sin((angle * Math.PI) / 180) * 60,
                      opacity: 0,
                      scale: [0, 1, 0.5]
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.1
                    }}
                  />
                );
              })}
              
              <motion.div 
                className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center z-10"
                variants={circleVariants}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M5 13L9 17L19 7"
                    stroke="#10B981"
                    strokeWidth="3"
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
                className="text-2xl font-bold text-[#143D32] mb-3"
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
                className="w-full py-3 bg-[#10B981] hover:bg-[#0e9f6e] text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#F7FAF8]"
              >
                Got it
              </motion.button>
            </motion.div>

            {/* Progress Bar */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-[#10B981]"
              variants={progressVariants}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideRequestSuccessModal;
