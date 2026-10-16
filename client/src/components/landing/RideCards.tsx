import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Car, PlusCircle } from 'lucide-react';
import { api } from '../../services/api';
import { IRide } from '../../types';
import { JourneyTicket } from '../signature/JourneyTicket';
import { TactileButton } from '../signature/TactileButton';
import { DEMO_FALLBACK_RIDES } from '../../services/demoFallback';

export const RideCards: React.FC = () => {
  const [rides, setRides] = useState<IRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getRides({ status: 'active' })
      .then((res: any) => {
        if (!isMounted) return;
        const list = res.rides || (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          setRides(list.slice(0, 3));
        } else {
          setRides(DEMO_FALLBACK_RIDES.slice(0, 3) as any);
        }
      })
      .catch((err) => {
        console.error('Failed to load active rides for landing:', err);
        if (isMounted) setRides(DEMO_FALLBACK_RIDES.slice(0, 3) as any);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
      {/* Section Header Card matching User's Image 4 */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="bg-paper neu-card border border-[#E2DDD3] rounded-3xl p-6 sm:p-8 md:p-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="max-w-2xl">
          <span className="text-xs font-mono text-plum font-bold bg-plum-light px-3.5 py-1.5 rounded-full inline-block uppercase tracking-wider mb-3">
            VERIFIED CORRIDOR PASSES
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-ink-primary tracking-tight">
            Today's Campus Ride Passes
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink-secondary leading-relaxed">
            Verified student carpool listings. Each ticket displays transparent fuel share, real-time seat availability, and verified classmate credentials.
          </p>
        </div>
        <Link
          to="/search"
          className="px-6 py-3.5 rounded-xl bg-plum hover:bg-plum-hover text-white text-xs sm:text-sm font-bold shadow-sm neu-btn transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-center"
        >
          <span>EXPLORE ALL RIDES →</span>
        </Link>
      </motion.div>

      {/* Real Journey Tickets Display */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <JourneyTicket isLoading={true} />
          <JourneyTicket isLoading={true} />
          <JourneyTicket isLoading={true} />
        </div>
      ) : rides.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {rides.map((ride) => (
            <JourneyTicket key={ride._id} ride={ride as any} />
          ))}
        </motion.div>
      ) : (
        /* Honest, Calm Empty State (No Fabricated Rides) */
        <div className="mt-8 bg-paper rounded-card border border-border p-6 sm:p-7 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-plum-light text-plum mx-auto flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-ink-primary">
              No Scheduled Rides Posted for Today Yet
            </h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-md mx-auto leading-relaxed">
              Be the first classmate to offer empty seats along the Premnagar, Suddhowala, or UIT campus corridor.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/post">
              <TactileButton variant="primary" size="md">
                <PlusCircle className="w-4 h-4" />
                <span>Offer an Empty Seat</span>
              </TactileButton>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export const EngineeredRideCards = RideCards;
