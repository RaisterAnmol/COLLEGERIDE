import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck, Fuel, Users, AlertCircle, Sparkles } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'Safety' | 'Fuel & Pricing' | 'Booking & OTP' | 'Corridor';
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Safety',
    question: 'How is student identity and campus safety verified?',
    answer:
      'Every driver and passenger must verify their active university-issued .edu email, upload their physical college ID card, and pass an automated face biometric liveness check. Drivers must also provide valid driving license, vehicle registration (RC), and active insurance papers, which are reviewed by Campus Security before their first ride.',
  },
  {
    id: 'faq-2',
    category: 'Fuel & Pricing',
    question: 'How does the non-commercial fuel cost-sharing work?',
    answer:
      'CampusRide operates under strict non-commercial guidelines in accordance with Section 66/67 of the Motor Vehicles Act. Drivers do not make a commercial profit; they merely split actual petrol/EV charging expenses with peers. Prices are capped per campus corridor (typically ₹15 to ₹35 across Dehradun hubs), and CampusRide charges zero (₹0) platform commission fees.',
  },
  {
    id: 'faq-3',
    category: 'Safety',
    question: 'How does the Women-Only Commute filter work?',
    answer:
      'Female drivers have the choice to offer rides exclusively to verified female classmates. Similarly, female passengers can filter search results to display only women-driven rides. The system cryptographically anchors gender verification through university registrar enrollment records.',
  },
  {
    id: 'faq-4',
    category: 'Booking & OTP',
    question: 'What is the 4-digit in-car OTP verification?',
    answer:
      'When your ride request is accepted, the app generates a secure 4-digit numeric code. When boarding at your pickup checkpost, you share this code with your student driver. The driver enters it to officially synchronize the trip log and begin live route telemetry.',
  },
  {
    id: 'faq-5',
    category: 'Safety',
    question: 'What happens during a vehicle breakdown or safety emergency?',
    answer:
      'Every active trip includes a prominent 1-tap SOS Emergency Protocol. Pressing the button instantly transmits your real-time GPS coordinates to the Campus Safety Office dispatch desk, notifies your emergency contact via WhatsApp/SMS, and bridges directly to the National Emergency Helpline 112.',
  },
  {
    id: 'faq-6',
    category: 'Corridor',
    question: 'Can I request a stop along the way if my hostel is on the route?',
    answer:
      'Yes! Student drivers post scheduled routes along common transit corridors (such as Chakrata Highway, Premnagar Chowk, Suddhowala PG hub, and Ballupur). You can choose intermediate pickup bays or coordinate an agreed drop-off point via the in-app verified chat.',
  },
  {
    id: 'faq-7',
    category: 'Booking & OTP',
    question: 'What if a driver or passenger is delayed or needs to cancel?',
    answer:
      'We recommend a 5-minute courtesy waiting window at campus boom barriers. If you need to cancel, doing so at least 45 minutes ahead allows your classmates to arrange alternate transit. Frequent unexcused no-shows trigger automatic trust score deductions.',
  },
];

export const ExpandableFaq: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Safety', 'Fuel & Pricing', 'Booking & OTP', 'Corridor'];

  const filteredFaqs = activeCategory === 'All'
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      id="campus-faq"
      className="py-16 sm:py-24 bg-paper/60 border-t border-line-subtle relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-route-pale text-route text-xs font-mono font-bold border border-route-light/20">
            <HelpCircle className="w-3.5 h-3.5 text-route" />
            <span>Campus Transit Knowledge Base</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl mx-auto leading-relaxed">
            Everything you need to know about peer-to-peer campus ride sharing, fuel cost splitting, safety verification, and emergency protocols in Dehradun.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-route text-white shadow-xs'
                    : 'bg-canvas text-ink-muted border border-line-base hover:text-ink-primary hover:bg-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-canvas border-route/40 shadow-sm'
                    : 'bg-paper border-line-base hover:border-line-dark'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-route shrink-0" />
                    <span className="font-display font-bold text-sm sm:text-base text-ink-primary">
                      {faq.question}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="p-1 rounded-lg text-ink-muted hover:text-ink-primary shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-ink-muted leading-relaxed font-sans border-t border-line-subtle/50 mt-1 pl-10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="p-5 rounded-3xl bg-route/5 border border-route/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-ink-primary">
              Have a corridor question not answered here?
            </h4>
            <p className="text-xs text-ink-muted font-sans">
              Contact the Student Transit Support Desk or review the complete safety protocol.
            </p>
          </div>

          <a
            href="/safety"
            className="px-4 py-2.5 rounded-xl bg-route text-white font-mono text-xs font-bold hover:bg-route-light transition-all shrink-0 shadow-xs"
          >
            Review Safety Protocols →
          </a>
        </div>
      </div>
    </section>
  );
};

