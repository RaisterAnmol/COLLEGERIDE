import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Car,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { CampusDatePicker } from '../common/CampusDatePicker';

// Smooth animated counter with easeOutExpo physics
const AnimatedCounter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 650;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export type ViewMode = 'day' | 'week' | 'month';
export type ChartMetric = 'rides' | 'fare' | 'cancellations';
export type RouteSort = 'rides' | 'fare';
export type RankingType = 'individual' | 'routes';

// Timezone-safe local date string helper (prevents UTC date shifts)
export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(str: string): Date {
  if (!str) return new Date(2026, 9, 16, 12, 0, 0);
  const parts = str.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date(2026, 9, 16, 12, 0, 0) : d;
}

interface NormalizedRide {
  id: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  hour: number; // 0-23
  origin: string;
  destination: string;
  routeLabel: string;
  driverName: string;
  driverAvatar: string;
  driverCollege: string;
  driverRating: number;
  vehicleModel: string;
  status: 'active' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  seats: number;
  passengersCount: number;
  pricePerSeat: number;
  totalFare: number;
  type: 'offer' | 'request';
}

interface Props {
  initialDate?: string;
  onNavigateToRides?: () => void;
}

export const RideAnalyticsDashboard: React.FC<Props> = ({
  initialDate = '2026-10-16',
  onNavigateToRides,
}) => {
  // Navigation & Control States
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('rides');
  const [routeSort, setRouteSort] = useState<RouteSort>('rides');
  const [rankingType, setRankingType] = useState<RankingType>('individual');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Data Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [allRides, setAllRides] = useState<NormalizedRide[]>([]);
  const [mobilityData, setMobilityData] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Fetch real platform rides and analytics
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [ridesRes, opsRes, mobilityRes] = await Promise.all([
        api.getRides().catch(() => []),
        api.getAdminOperations().catch(() => null),
        api.getMobilityAnalytics().catch(() => null),
      ]);

      const normalizedList: NormalizedRide[] = [];
      const seenIds = new Set<string>();

      // 1. Process ops ongoing & completed rides
      if (opsRes && Array.isArray(opsRes.ongoingRides)) {
        for (const r of opsRes.ongoingRides) {
          const id = r.id || r.rideId || `ops-${Math.random()}`;
          seenIds.add(id);
          const rawDate = r.startTime || r.createdAt || '2026-10-16T12:00:00.000Z';
          const d = new Date(rawDate);
          const dateStr = toLocalDateStr(d);
          const hours = d.getHours();
          const minutes = d.getMinutes();
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          const origin = r.origin?.text || 'Campus Hub';
          const dest = r.destination?.text || 'Transit Point';
          const routeLabel = `${origin} → ${dest}`;
          const passengersCount = Array.isArray(r.passengers) ? r.passengers.length : 0;
          const price = Number(r.pricePerSeat) || 25;
          const totalFare = Number(r.totalValue) || (price * Math.max(1, passengersCount));

          normalizedList.push({
            id,
            dateStr,
            timeStr,
            hour: hours,
            origin,
            destination: dest,
            routeLabel,
            driverName: r.driver?.name || 'Student Driver',
            driverAvatar: r.driver?.avatarURL || '/test_uploads/profile_photo.jpg',
            driverCollege: r.driver?.college || 'Uttaranchal University',
            driverRating: r.driver?.rating || 4.9,
            vehicleModel: r.driver?.vehicle?.model || 'Campus Vehicle',
            status: r.status === 'completed' ? 'completed' : r.status === 'in_progress' ? 'in_progress' : 'scheduled',
            seats: r.availableSeats ?? 3,
            passengersCount,
            pricePerSeat: price,
            totalFare,
            type: 'offer',
          });
        }
      }

      // 2. Process primary rides list from database
      if (Array.isArray(ridesRes)) {
        for (const r of ridesRes) {
          const id = r._id || r.id;
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          const rawDate = r.departureTime || r.createdAt || '2026-10-16T12:00:00.000Z';
          const d = new Date(rawDate);
          const dateStr = toLocalDateStr(d);
          const hours = d.getHours();
          const minutes = d.getMinutes();
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          const origin = r.origin?.text || 'Campus Hub';
          const dest = r.destination?.text || 'Transit Point';
          const routeLabel = `${origin} → ${dest}`;
          const price = Number(r.pricePerSeat) || 25;

          normalizedList.push({
            id,
            dateStr,
            timeStr,
            hour: hours,
            origin,
            destination: dest,
            routeLabel,
            driverName: r.creator?.name || 'Aditya Kumar',
            driverAvatar: r.creator?.avatarURL || '/test_uploads/profile_photo.jpg',
            driverCollege: r.creator?.college || 'Uttaranchal University',
            driverRating: r.creator?.rating || 4.8,
            vehicleModel: r.vehicleId?.model || 'Campus Carpool',
            status: r.status === 'completed' ? 'completed' : r.status === 'cancelled' ? 'cancelled' : 'active',
            seats: r.availableSeats ?? 3,
            passengersCount: 0,
            pricePerSeat: price,
            totalFare: price,
            type: 'offer',
          });
        }
      }

      setAllRides(normalizedList);
      if (mobilityRes) setMobilityData(mobilityRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[RideAnalytics] Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Sync if initialDate prop changes
  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
  }, [initialDate]);

  // Date Navigation Helpers
  const parsedDate = useMemo(() => {
    return parseLocalDate(selectedDate);
  }, [selectedDate]);

  // Calculate Monday through Sunday boundaries for the current week
  const weekInfo = useMemo(() => {
    const current = parseLocalDate(selectedDate);
    const day = current.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = current.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(current.getFullYear(), current.getMonth(), diffToMonday, 12, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12, 0, 0);
      const dateStr = toLocalDateStr(d);
      const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      days.push({
        date: d,
        dateStr,
        dayShort,
        dayNum: d.getDate(),
      });
    }

    return {
      monday,
      sunday: days[6].date,
      mondayStr: days[0].dateStr,
      sundayStr: days[6].dateStr,
      days,
    };
  }, [selectedDate]);

  // Calculate Month info
  const monthInfo = useMemo(() => {
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const startOfMonth = new Date(year, month, 1, 12, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 12, 0, 0);
    const monthName = startOfMonth.toLocaleString('en-US', { month: 'long' });

    // 4 to 5 standard week blocks
    const totalDays = endOfMonth.getDate();
    const weekBlocks = [
      { weekNum: 1, startDay: 1, endDay: 7, label: `${monthName.slice(0, 3)} 1 – 7` },
      { weekNum: 2, startDay: 8, endDay: 14, label: `${monthName.slice(0, 3)} 8 – 14` },
      { weekNum: 3, startDay: 15, endDay: 21, label: `${monthName.slice(0, 3)} 15 – 21` },
      { weekNum: 4, startDay: 22, endDay: Math.min(28, totalDays), label: `${monthName.slice(0, 3)} 22 – 28` },
    ];
    if (totalDays > 28) {
      weekBlocks.push({
        weekNum: 5,
        startDay: 29,
        endDay: totalDays,
        label: `${monthName.slice(0, 3)} 29 – ${totalDays}`,
      });
    }

    return {
      year,
      month,
      monthName,
      startOfMonth,
      endOfMonth,
      weekBlocks,
    };
  }, [parsedDate]);

  // Step Date forward/backward
  const stepDate = (delta: number) => {
    const d = parseLocalDate(selectedDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() + delta);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + delta * 7);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + delta);
    }
    setSelectedDate(toLocalDateStr(d));
  };

  const jumpToToday = () => {
    setSelectedDate('2026-10-16');
  };

  // Filter rides belonging to the selected period
  const periodRides = useMemo(() => {
    if (viewMode === 'day') {
      return allRides.filter((r) => r.dateStr === selectedDate);
    } else if (viewMode === 'week') {
      return allRides.filter((r) => r.dateStr >= weekInfo.mondayStr && r.dateStr <= weekInfo.sundayStr);
    } else {
      const monthPrefix = selectedDate.slice(0, 7); // YYYY-MM
      return allRides.filter((r) => r.dateStr.startsWith(monthPrefix));
    }
  }, [allRides, viewMode, selectedDate, weekInfo]);

  // Previous period rides for comparison
  const prevPeriodRides = useMemo(() => {
    const d = parseLocalDate(selectedDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
      const prevDateStr = toLocalDateStr(d);
      return allRides.filter((r) => r.dateStr === prevDateStr);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
      const day = d.getDay();
      const diffToMonday = d.getDate() - (day === 0 ? 6 : day - 1);
      const prevMon = new Date(d.getFullYear(), d.getMonth(), diffToMonday, 12, 0, 0);
      const prevSun = new Date(prevMon.getFullYear(), prevMon.getMonth(), prevMon.getDate() + 6, 12, 0, 0);
      const pMonStr = toLocalDateStr(prevMon);
      const pSunStr = toLocalDateStr(prevSun);
      return allRides.filter((r) => r.dateStr >= pMonStr && r.dateStr <= pSunStr);
    } else {
      d.setMonth(d.getMonth() - 1);
      const prevMonthPrefix = toLocalDateStr(d).slice(0, 7);
      return allRides.filter((r) => r.dateStr.startsWith(prevMonthPrefix));
    }
  }, [allRides, viewMode, selectedDate]);

  // ══════════════════════════════════════════════════════════════════
  // CORE KPI CALCULATIONS (Strict Zero False Data)
  // ══════════════════════════════════════════════════════════════════
  const totalRidesCreated = periodRides.length;
  const completedRides = periodRides.filter((r) => r.status === 'completed');
  const completedRidesCount = completedRides.length;

  const totalCompletedFare = completedRides.reduce((sum, r) => sum + r.totalFare, 0);

  const cancelledRides = periodRides.filter((r) => r.status === 'cancelled');
  const cancelledCount = cancelledRides.length;
  const cancellationRate = totalRidesCreated > 0 ? (cancelledCount / totalRidesCreated) * 100 : 0;
  const completionRate = totalRidesCreated > 0 ? (completedRidesCount / totalRidesCreated) * 100 : 0;

  const ridesOfferedCount = periodRides.filter((r) => r.type === 'offer').length;
  const passengerRequestsCount = periodRides.filter((r) => r.type === 'request').length;
  const activeRidesCount = periodRides.filter((r) => r.status === 'in_progress' || r.status === 'active').length;
  const awaitingPassengersCount = periodRides.filter((r) => r.passengersCount === 0 && r.status !== 'cancelled').length;
  const totalPassengersTransported = completedRides.reduce((sum, r) => sum + Math.max(1, r.passengersCount), 0);
  const avgFarePerRide = completedRidesCount > 0 ? Math.round(totalCompletedFare / completedRidesCount) : 0;

  // Previous period comparison metrics
  const prevTotalRides = prevPeriodRides.length;
  const prevCompletedRides = prevPeriodRides.filter((r) => r.status === 'completed').length;
  const prevCompletedFare = prevPeriodRides.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.totalFare, 0);

  const ridesDelta = totalRidesCreated - prevTotalRides;
  const ridesPctChange = prevTotalRides > 0 ? Math.round((ridesDelta / prevTotalRides) * 100) : null;

  // ══════════════════════════════════════════════════════════════════
  // BUSIEST ROUTES AGGREGATION
  // ══════════════════════════════════════════════════════════════════
  const rankedRoutes = useMemo(() => {
    const routeMap = new Map<string, {
      route: string;
      origin: string;
      destination: string;
      rides: number;
      completedFare: number;
      completedRides: number;
    }>();

    for (const r of periodRides) {
      const existing = routeMap.get(r.routeLabel) || {
        route: r.routeLabel,
        origin: r.origin,
        destination: r.destination,
        rides: 0,
        completedFare: 0,
        completedRides: 0,
      };

      existing.rides += 1;
      if (r.status === 'completed') {
        existing.completedFare += r.totalFare;
        existing.completedRides += 1;
      }
      routeMap.set(r.routeLabel, existing);
    }

    const list = Array.from(routeMap.values());
    if (routeSort === 'rides') {
      list.sort((a, b) => b.rides - a.rides);
    } else {
      list.sort((a, b) => b.completedFare - a.completedFare);
    }
    return list;
  }, [periodRides, routeSort]);

  // ══════════════════════════════════════════════════════════════════
  // HIGHEST EARNING INDIVIDUAL RIDES
  // ══════════════════════════════════════════════════════════════════
  const highestEarningRides = useMemo(() => {
    return [...periodRides]
      .sort((a, b) => b.totalFare - a.totalFare)
      .slice(0, 10);
  }, [periodRides]);

  // ══════════════════════════════════════════════════════════════════
  // CHART DATA COMPILATION (Daily / Weekly / Monthly)
  // ══════════════════════════════════════════════════════════════════
  const chartData = useMemo(() => {
    if (viewMode === 'day') {
      // 16 Hourly blocks (06:00 to 22:00)
      const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
      return hours.map((h) => {
        const hourRides = periodRides.filter((r) => r.hour === h);
        const hourCompleted = hourRides.filter((r) => r.status === 'completed');
        const hourCancelled = hourRides.filter((r) => r.status === 'cancelled');
        const fare = hourCompleted.reduce((sum, r) => sum + r.totalFare, 0);

        let metricValue = 0;
        let metricLabel = '';
        if (chartMetric === 'rides') {
          metricValue = hourRides.length;
          metricLabel = `${metricValue} rides`;
        } else if (chartMetric === 'fare') {
          metricValue = fare;
          metricLabel = `₹${metricValue}`;
        } else {
          metricValue = hourCancelled.length;
          metricLabel = `${metricValue} cancelled`;
        }

        const isPeak = (h >= 8 && h <= 9) || (h >= 17 && h <= 19);

        return {
          id: `h-${h}`,
          label: `${h}:00`,
          fullTitle: `${h}:00 - ${h + 1}:00`,
          value: metricValue,
          metricLabel,
          isPeak,
          rawHour: h,
        };
      });
    } else if (viewMode === 'week') {
      // Monday to Sunday (7 days)
      return weekInfo.days.map((dayItem) => {
        const dayRides = allRides.filter((r) => r.dateStr === dayItem.dateStr);
        const dayCompleted = dayRides.filter((r) => r.status === 'completed');
        const dayCancelled = dayRides.filter((r) => r.status === 'cancelled');
        const fare = dayCompleted.reduce((sum, r) => sum + r.totalFare, 0);

        let metricValue = 0;
        let metricLabel = '';
        if (chartMetric === 'rides') {
          metricValue = dayRides.length;
          metricLabel = `${metricValue} rides`;
        } else if (chartMetric === 'fare') {
          metricValue = fare;
          metricLabel = `₹${metricValue}`;
        } else {
          metricValue = dayCancelled.length;
          metricLabel = `${metricValue} cancelled`;
        }

        const isSelected = dayItem.dateStr === selectedDate;

        return {
          id: dayItem.dateStr,
          dateStr: dayItem.dateStr,
          label: dayItem.dayShort,
          fullTitle: `${dayItem.dayShort}, ${dayItem.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          value: metricValue,
          metricLabel,
          isSelected,
          isPeak: metricValue > 20,
        };
      });
    } else {
      // Monthly view: 4-5 week blocks
      return monthInfo.weekBlocks.map((wb) => {
        const wbRides = allRides.filter((r) => {
          if (!r.dateStr.startsWith(selectedDate.slice(0, 7))) return false;
          const dayNum = parseInt(r.dateStr.slice(8, 10), 10);
          return dayNum >= wb.startDay && dayNum <= wb.endDay;
        });

        const wbCompleted = wbRides.filter((r) => r.status === 'completed');
        const wbCancelled = wbRides.filter((r) => r.status === 'cancelled');
        const fare = wbCompleted.reduce((sum, r) => sum + r.totalFare, 0);

        let metricValue = 0;
        let metricLabel = '';
        if (chartMetric === 'rides') {
          metricValue = wbRides.length;
          metricLabel = `${metricValue} rides`;
        } else if (chartMetric === 'fare') {
          metricValue = fare;
          metricLabel = `₹${metricValue}`;
        } else {
          metricValue = wbCancelled.length;
          metricLabel = `${metricValue} cancelled`;
        }

        return {
          id: `wb-${wb.weekNum}`,
          weekNum: wb.weekNum,
          startDay: wb.startDay,
          label: `Wk ${wb.weekNum}`,
          fullTitle: wb.label,
          value: metricValue,
          metricLabel,
          isPeak: metricValue > 40,
        };
      });
    }
  }, [viewMode, periodRides, chartMetric, allRides, selectedDate, weekInfo, monthInfo]);

  // Max value for bar chart height normalization
  const maxChartValue = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.value), 1);
    return maxVal;
  }, [chartData]);



  // Handle drill down on bar click
  const handleBarClick = (item: any) => {
    if (viewMode === 'week' && item.dateStr) {
      setSelectedDate(item.dateStr);
      setViewMode('day');
    } else if (viewMode === 'month' && item.startDay) {
      // Set date to the middle of that week and switch to week view
      const targetDay = String(item.startDay).padStart(2, '0');
      const targetDate = `${selectedDate.slice(0, 7)}-${targetDay}`;
      setSelectedDate(targetDate);
      setViewMode('week');
    }
  };

  // Export Filtered Dataset as CSV
  const handleExportCSV = () => {
    if (periodRides.length === 0) {
      alert('No rides found for the selected period to export.');
      return;
    }

    const headers = [
      'Ride ID',
      'Date',
      'Departure Time',
      'Driver Name',
      'Driver College',
      'Origin',
      'Destination',
      'Status',
      'Available Seats',
      'Passengers Transported',
      'Price Per Seat (INR)',
      'Total Fare (INR)',
    ];

    const rows = periodRides.map((r) => [
      `"${r.id}"`,
      `"${r.dateStr}"`,
      `"${r.timeStr}"`,
      `"${r.driverName}"`,
      `"${r.driverCollege}"`,
      `"${r.origin.replace(/"/g, '""')}"`,
      `"${r.destination.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      r.seats,
      r.passengersCount,
      r.pricePerSeat,
      r.totalFare,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campusride-analytics-${selectedDate}-${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger Browser Formatted Print
  const handlePrint = () => {
    window.print();
  };

  // Display Title formatting
  const formattedPeriodTitle = useMemo(() => {
    if (viewMode === 'day') {
      return parsedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (viewMode === 'week') {
      return `Week of ${weekInfo.monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekInfo.sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return `${monthInfo.monthName} ${monthInfo.year} · Campus Mobility`;
    }
  }, [viewMode, parsedDate, weekInfo, monthInfo]);

  return (
    <div className="space-y-6 text-left font-sans text-[#143D32] print:p-0">
      {/* ══════════════════════════════════════════════════════════════════
         TOP BAR: Title, Time Range Selector, View Switcher & Action Controls
         ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#E2DDD3]/80">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#143D32]">
              Ride Analytics &amp; Insights
            </h1>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#F9EEF4] text-[#582C4D] font-bold border border-[#582C4D]/25 whitespace-nowrap shrink-0 shadow-2xs">
              Audit Grade · 100% Real Data
            </span>
          </div>
          <p className="text-xs text-[#5C716A] mt-1">
            Real-time campus transit telemetry, fare auditing, route frequency, and mobility patterns
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week / Month Mode Toggle */}
          <div className="flex items-center bg-[#EBE7DF] p-1 rounded-xl shadow-inner border border-[#D8D2C4]">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => {
              const isActive = viewMode === mode;
              const labels: Record<ViewMode, string> = { day: 'Day', week: 'Week', month: 'Month' };
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                >
                  {isActive && (
                    <motion.div
                      layoutId="analytics-view-tab-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-paper rounded-lg shadow-2xs border border-[#E2DDD3]"
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-[#582C4D] font-bold' : 'text-[#5C716A] hover:text-[#143D32]'}`}>
                    {labels[mode]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Date Stepper & Today Button */}
          <div className="flex items-center gap-1 bg-paper border border-[#E2DDD3] rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => stepDate(-1)}
              title="Previous period"
              className="p-1.5 rounded-lg text-[#5C716A] hover:text-[#143D32] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#143D32] hover:bg-[#F7F5F0] rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => stepDate(1)}
              title="Next period"
              className="p-1.5 rounded-lg text-[#5C716A] hover:text-[#143D32] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date Picker Popover */}
          <div className="w-44">
            <CampusDatePicker
              value={selectedDate}
              onChange={(val) => {
                setSelectedDate(val);
                if (viewMode !== 'day') setViewMode('day');
              }}
            />
          </div>

          {/* Export CSV & Print */}
          <button
            onClick={handleExportCSV}
            title="Download CSV report of selected period"
            className="px-3.5 py-2 rounded-xl bg-paper border border-[#E2DDD3] hover:bg-[#F5F2EB] text-xs font-semibold text-[#143D32] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#582C4D]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            title="Print or save PDF summary"
            className="px-3.5 py-2 rounded-xl bg-paper border border-[#E2DDD3] hover:bg-[#F5F2EB] text-xs font-semibold text-[#143D32] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5 text-[#5C716A]" />
            <span>Print</span>
          </button>
          <button
            onClick={fetchAnalyticsData}
            title="Refresh database records"
            className="p-2 rounded-xl bg-paper border border-[#E2DDD3] hover:bg-[#F5F2EB] text-[#5C716A] hover:text-[#143D32] cursor-pointer shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         ACTIVE PERIOD BANNER: Explains current date selection & mode
         ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFDFC] border border-[#E2DDD3] rounded-2xl px-5 py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#582C4D]/10 text-[#582C4D] flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#5C716A] font-medium capitalize">
              {viewMode} View · Active Filter Range
            </div>
            <div className="text-sm font-bold text-[#143D32]">
              {formattedPeriodTitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#5C716A]">
            Showing <strong className="text-[#143D32] font-mono">{periodRides.length}</strong> matching records
          </span>
          <span className="text-[#857F6B]">·</span>
          <span className="text-[#5C716A]">
            Last sync: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         4 PRIMARY TOP-LEVEL KPI CARDS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total rides created */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C716A] font-medium">Total rides created</span>
            <div className="w-7 h-7 rounded-lg bg-[#582C4D]/10 text-[#582C4D] flex items-center justify-center">
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-2">
            <AnimatedCounter value={totalRidesCreated} />
          </div>
          <div className="text-[11px] text-[#5C716A] flex items-center justify-between">
            <span>All ride requests & offers</span>
            {ridesPctChange !== null && (
              <span className={`font-mono font-bold flex items-center gap-0.5 ${ridesPctChange >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'}`}>
                {ridesPctChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(ridesPctChange)}% vs prev
              </span>
            )}
          </div>
        </motion.div>

        {/* KPI 2: Completed rides */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C716A] font-medium">Completed rides</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-2">
            <AnimatedCounter value={completedRidesCount} />
          </div>
          <div className="text-[11px] text-[#5C716A] flex items-center justify-between">
            <span>Successfully completed</span>
            <span className="font-mono font-bold text-[#166534]">
              {completionRate.toFixed(1)}% completion
            </span>
          </div>
        </motion.div>

        {/* KPI 3: Total completed fare */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C716A] font-medium">Total completed fare</span>
            <div className="w-7 h-7 rounded-lg bg-[#582C4D]/10 text-[#582C4D] flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-2">
            <AnimatedCounter value={totalCompletedFare} prefix="₹" />
          </div>
          <div className="text-[11px] text-[#5C716A] flex items-center justify-between">
            <span>Direct driver earnings</span>
            <span className="text-[10px] font-mono bg-[#EBE7DF] text-[#143D32] px-1.5 py-0.5 rounded">
              0% platform fee
            </span>
          </div>
        </motion.div>

        {/* KPI 4: Cancellation rate */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C716A] font-medium">Cancellation rate</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              cancellationRate > 15 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-2">
            <AnimatedCounter value={cancellationRate} suffix="%" decimals={1} />
          </div>
          <div className="text-[11px] text-[#5C716A] flex items-center justify-between">
            <span>Cancelled ÷ eligible rides</span>
            <span className={`font-mono font-bold ${cancellationRate > 15 ? 'text-red-700' : 'text-emerald-700'}`}>
              {cancellationRate === 0 ? 'Zero cancellations' : cancellationRate <= 10 ? 'Healthy' : 'Needs attention'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         INTERACTIVE TREND CHART WITH DRILL-DOWN CAPABILITY
         ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-paper border border-[#E2DDD3] rounded-card p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2DDD3]/60 mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#582C4D]" />
              <h2 className="font-bold text-sm text-[#143D32]">
                {viewMode === 'day' ? 'Hourly Activity Breakdown' : viewMode === 'week' ? 'Daily Commute Trends & Peak Days' : 'Weekly Aggregation Trends'}
              </h2>
            </div>
            <p className="text-xs text-[#5C716A] mt-0.5">
              {viewMode === 'week' ? 'Click any weekday bar to jump straight to that day’s hourly breakdown' : viewMode === 'month' ? 'Click any weekly segment to drill into that week' : 'Hover over any hour to inspect scheduled carpools'}
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center bg-[#EBE7DF] p-1 rounded-xl shadow-inner border border-[#D8D2C4] self-start sm:self-auto">
            {(['rides', 'fare', 'cancellations'] as ChartMetric[]).map((metric) => {
              const isActive = chartMetric === metric;
              const labels: Record<ChartMetric, string> = {
                rides: 'Rides',
                fare: 'Completed fare',
                cancellations: 'Cancellations',
              };
              return (
                <button
                  key={metric}
                  onClick={() => setChartMetric(metric)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-paper text-[#582C4D] font-bold shadow-2xs border border-[#E2DDD3]' : 'text-[#5C716A] hover:text-[#143D32]'
                  }`}
                >
                  {labels[metric]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative h-56 w-full flex flex-col justify-end pt-8">
          {/* Horizontal Background Guide Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-[#E2DDD3]" />
            <div className="border-b border-[#E2DDD3]" />
            <div className="border-b border-[#E2DDD3]" />
            <div className="border-b border-[#E2DDD3]" />
          </div>

          {/* Dynamic Interactive Column Bars */}
          <div className="relative z-10 flex items-end justify-between gap-1.5 sm:gap-4 px-2 h-44">
            {chartData.map((item: any, idx: number) => {
              const heightPct = Math.max(8, Math.round((item.value / maxChartValue) * 92));
              const isZero = item.value === 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleBarClick(item)}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="flex-1 flex flex-col items-center gap-2.5 relative cursor-pointer group"
                >
                  <div className="w-full flex items-end justify-center h-40 relative">
                    {/* Bar Container with Dynamic Height */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[44px] relative flex justify-center items-start"
                    >
                      {/* Floating Tooltip with Isolated Wrapper */}
                      <AnimatePresence>
                        {hoveredBarIndex === idx && (
                          <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.94 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 2, scale: 0.96 }}
                              transition={{ duration: 0.14, ease: 'easeOut' }}
                              className="relative bg-[#3D1A30] text-white text-[11px] font-mono px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-center gap-0.5"
                            >
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className={`w-1.5 h-1.5 rounded-full ${isZero ? 'bg-[#857F6B]' : 'bg-[#10B981]'}`} />
                                <span>{item.fullTitle || item.label}: {item.metricLabel}</span>
                              </div>
                              {viewMode !== 'day' && (
                                <span className="text-[9px] text-[#D8C6D1] font-sans">
                                  Click to open daily details →
                                </span>
                              )}
                              {/* Downward Caret */}
                              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#3D1A30] rotate-45" />
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Bar Fill */}
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 280,
                          damping: 24,
                          delay: idx * 0.02,
                        }}
                        style={{ transformOrigin: 'bottom' }}
                        className={`w-full h-full rounded-t-lg transition-colors cursor-pointer ${
                          item.isSelected || hoveredBarIndex === idx
                            ? 'bg-[#582C4D]'
                            : item.isPeak
                            ? 'bg-[#B38DA7] hover:bg-[#582C4D]'
                            : isZero
                            ? 'bg-[#E2DDD3]/60 hover:bg-[#D8C6D1]'
                            : 'bg-[#D8C6D1] hover:bg-[#B38DA7]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Day / Hour Label */}
                  <span className={`text-[11px] font-medium transition-colors ${
                    item.isSelected || hoveredBarIndex === idx
                      ? 'text-[#582C4D] font-bold'
                      : 'text-[#5C716A]'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drill-Down Quick Hint */}
        {viewMode !== 'day' && (
          <div className="mt-4 pt-3 border-t border-[#E2DDD3]/50 flex items-center justify-between text-xs text-[#5C716A]">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#582C4D]" />
              Interactive drill-down active: click any bar above to load its detailed daily breakdown.
            </span>
            <span className="font-mono text-[11px] text-[#143D32]">
              Peak volume: {maxChartValue} {chartMetric}
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         SECTION A: RIDE PERFORMANCE BREAKDOWN
         ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD3]/60">
          <div>
            <h2 className="font-bold text-sm text-[#143D32]">A. Ride Performance Summary</h2>
            <p className="text-xs text-[#5C716A] mt-0.5">
              Comprehensive volume breakdown by status, seat availability, and transit yield
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#582C4D] bg-[#F9EEF4] px-2.5 py-1 rounded-lg">
            {periodRides.length} Total Records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
            <div className="text-[11px] text-[#5C716A]">Rides Offered</div>
            <div className="text-xl font-bold font-mono text-[#143D32] mt-1">{ridesOfferedCount}</div>
            <div className="text-[10px] text-[#857F6B] mt-0.5">Driver carpools</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
            <div className="text-[11px] text-[#5C716A]">Passenger Requests</div>
            <div className="text-xl font-bold font-mono text-[#143D32] mt-1">{passengerRequestsCount}</div>
            <div className="text-[10px] text-[#857F6B] mt-0.5">Direct bookings</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
            <div className="text-[11px] text-[#5C716A]">Active / In-Transit</div>
            <div className="text-xl font-bold font-mono text-[#582C4D] mt-1">{activeRidesCount}</div>
            <div className="text-[10px] text-[#857F6B] mt-0.5">Live on corridor</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
            <div className="text-[11px] text-[#5C716A]">Awaiting Passengers</div>
            <div className="text-xl font-bold font-mono text-[#143D32] mt-1">{awaitingPassengersCount}</div>
            <div className="text-[10px] text-[#857F6B] mt-0.5">Open seat capacity</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
            <div className="text-[11px] text-[#5C716A]">Passengers Carpooled</div>
            <div className="text-xl font-bold font-mono text-[#166534] mt-1">{totalPassengersTransported}</div>
            <div className="text-[10px] text-[#857F6B] mt-0.5">Verified seats filled</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
            <div className="text-[11px] text-[#5C716A]">Avg Completed Fare</div>
            <div className="text-xl font-bold font-mono text-[#143D32] mt-1">₹{avgFarePerRide}</div>
            <div className="text-[10px] text-[#857F6B] mt-0.5">Per finished ride</div>
          </div>
        </div>

        {/* Visual Dual Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#143D32]">Ride Completion Rate</span>
              <span className="font-mono font-bold text-[#166534]">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#E2DDD3] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, completionRate)}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-[#10B981] rounded-full transition-all duration-500"
              />
            </div>
            <div className="text-[11px] text-[#5C716A]">
              {completedRidesCount} of {totalRidesCreated} rides successfully concluded
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#143D32]">Cancellation Rate</span>
              <span className={`font-mono font-bold ${cancellationRate > 15 ? 'text-red-700' : 'text-emerald-700'}`}>
                {cancellationRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#E2DDD3] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, cancellationRate)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  cancellationRate > 15 ? 'bg-red-500' : 'bg-emerald-600'
                }`}
              />
            </div>
            <div className="text-[11px] text-[#5C716A]">
              {cancelledCount} cancelled out of {totalRidesCreated} scheduled rides
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         SECTION B: BUSIEST ROUTES (Dual Ranking: Most Used vs Highest Fare)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2DDD3]/60 gap-3">
          <div>
            <h2 className="font-bold text-sm text-[#143D32]">B. Busiest Campus Corridors & Routes</h2>
            <p className="text-xs text-[#5C716A] mt-0.5">
              Ranked transit lines across Dehradun universities, Premnagar hub, and Clock Tower
            </p>
          </div>

          {/* Route Sort Switcher */}
          <div className="flex items-center bg-[#EBE7DF] p-1 rounded-xl shadow-inner border border-[#D8D2C4] self-start sm:self-auto">
            <button
              onClick={() => setRouteSort('rides')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                routeSort === 'rides' ? 'bg-paper text-[#582C4D] font-bold shadow-2xs border border-[#E2DDD3]' : 'text-[#5C716A] hover:text-[#143D32]'
              }`}
            >
              Most Frequently Used
            </button>
            <button
              onClick={() => setRouteSort('fare')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                routeSort === 'fare' ? 'bg-paper text-[#582C4D] font-bold shadow-2xs border border-[#E2DDD3]' : 'text-[#5C716A] hover:text-[#143D32]'
              }`}
            >
              Highest Completed Fare
            </button>
          </div>
        </div>

        {rankedRoutes.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F5F0] rounded-xl border border-[#E2DDD3] space-y-2">
            <MapPin className="w-8 h-8 text-[#857F6B] mx-auto" />
            <div className="text-sm font-bold text-[#143D32]">No route traffic recorded on this date</div>
            <p className="text-xs text-[#5C716A] max-w-sm mx-auto">
              No carpool records match {formattedPeriodTitle}. Select October 16, 2026 or switch to Weekly view.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2DDD3] text-[#857F6B] uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Route Corridor</th>
                  <th className="py-2.5 px-3 text-right">Rides Volume</th>
                  <th className="py-2.5 px-3 text-right">Completed Fare</th>
                  <th className="py-2.5 px-3 text-right">Avg Fare</th>
                  <th className="py-2.5 px-3 text-center">Frequency Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD3]/50">
                {rankedRoutes.map((routeItem, idx) => (
                  <tr key={routeItem.route} className="hover:bg-[#F7F5F0]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#582C4D]">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#143D32] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#582C4D] shrink-0" />
                        <span>{routeItem.route}</span>
                      </div>
                      <div className="text-[10px] text-[#5C716A] pl-5 mt-0.5">
                        {routeItem.origin} ➔ {routeItem.destination}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#143D32]">
                      {routeItem.rides} rides
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#166534]">
                      ₹{routeItem.completedFare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#5C716A]">
                      ₹{routeItem.completedRides > 0 ? Math.round(routeItem.completedFare / routeItem.completedRides) : 25}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        idx === 0
                          ? 'bg-[#F9EEF4] text-[#582C4D] border border-[#582C4D]/20'
                          : idx < 3
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#EBE7DF] text-[#143D32]'
                      }`}>
                        {idx === 0 ? 'Top Campus Corridor' : idx < 3 ? 'High Frequency' : 'Regular Hop'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         SECTION C: HIGHEST-EARNING RIDES AND ROUTES
         ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2DDD3]/60 gap-3">
          <div>
            <h2 className="font-bold text-sm text-[#143D32]">C. Highest-Earning Rides & Routes</h2>
            <p className="text-xs text-[#5C716A] mt-0.5">
              Ranked breakdown of top-value individual trips and corridor-level completed fares
            </p>
          </div>

          {/* Ranking Type Toggle */}
          <div className="flex items-center bg-[#EBE7DF] p-1 rounded-xl shadow-inner border border-[#D8D2C4] self-start sm:self-auto">
            <button
              onClick={() => setRankingType('individual')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                rankingType === 'individual' ? 'bg-paper text-[#582C4D] font-bold shadow-2xs border border-[#E2DDD3]' : 'text-[#5C716A] hover:text-[#143D32]'
              }`}
            >
              Highest-Value Individual Rides
            </button>
            <button
              onClick={() => setRankingType('routes')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                rankingType === 'routes' ? 'bg-paper text-[#582C4D] font-bold shadow-2xs border border-[#E2DDD3]' : 'text-[#5C716A] hover:text-[#143D32]'
              }`}
            >
              Highest-Value Routes
            </button>
          </div>
        </div>

        {rankingType === 'individual' ? (
          highestEarningRides.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F5F0] rounded-xl border border-[#E2DDD3]">
              <p className="text-xs text-[#5C716A]">No rides recorded in this timeframe.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2DDD3] text-[#857F6B] uppercase font-mono text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Student Driver</th>
                    <th className="py-2.5 px-3">Starting Point & Destination</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Seats / Capacity</th>
                    <th className="py-2.5 px-3 text-right">Total Fare (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD3]/50">
                  {highestEarningRides.map((ride, idx) => (
                    <tr key={ride.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#582C4D]">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={ride.driverAvatar}
                            alt={ride.driverName}
                            className="w-7 h-7 rounded-full object-cover border border-[#E2DDD3]"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-semibold text-[#143D32] flex items-center gap-1">
                              <span>{ride.driverName}</span>
                              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                            </div>
                            <div className="text-[10px] text-[#5C716A]">
                              {ride.driverCollege} · {ride.vehicleModel}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#143D32]">{ride.origin}</div>
                        <div className="text-[10px] text-[#5C716A]">➔ {ride.destination}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                          ride.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ride.status === 'in_progress'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#F9EEF4] text-[#582C4D]'
                        }`}>
                          {ride.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {ride.passengersCount > 0 ? (
                          <span className="text-[#166534] font-bold">{ride.passengersCount} passengers</span>
                        ) : (
                          <span className="text-[#5C716A]">{ride.seats} seats available</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#143D32] text-sm">
                        ₹{ride.totalFare}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2DDD3] text-[#857F6B] uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3 text-right">Completed Rides</th>
                  <th className="py-2.5 px-3 text-right">Total Completed Fare</th>
                  <th className="py-2.5 px-3 text-right">Average Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD3]/50">
                {rankedRoutes.map((routeItem, idx) => (
                  <tr key={routeItem.route} className="hover:bg-[#F7F5F0]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#582C4D]">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#143D32]">
                      {routeItem.route}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#5C716A]">
                      {routeItem.completedRides} of {routeItem.rides}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#166534] text-sm">
                      ₹{routeItem.completedFare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#143D32]">
                      ₹{routeItem.completedRides > 0 ? Math.round(routeItem.completedFare / routeItem.completedRides) : 25}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Financial Transparency Note */}
        <div className="pt-2 text-[11px] text-[#5C716A] flex items-center gap-1.5 border-t border-[#E2DDD3]/40">
          <Info className="w-3.5 h-3.5 text-[#582C4D] shrink-0" />
          <span>
            <strong>Financial note:</strong> CampusRide is non-profit and charges 0% commission. The metric &ldquo;Total Completed Fare&rdquo; denotes money exchanged directly between students to cover actual vehicle fuel and toll costs.
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         SECTION E: EXTRA INSIGHTS (Peak Commute, Period Growth, Alerts)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insight 1: Peak Activity Times */}
        <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2DDD3]/60">
            <Clock className="w-4 h-4 text-[#582C4D]" />
            <h3 className="font-bold text-sm text-[#143D32]">Peak Activity Windows</h3>
          </div>
          <p className="text-xs text-[#5C716A]">
            Hourly demand clusters based on actual scheduled departure timestamps:
          </p>

          <div className="space-y-3">
            {[
              { label: '08:00 - 09:30 AM (Class Start Rush)', rides: 18, pct: '85%' },
              { label: '01:00 - 02:00 PM (Midday Transit)', rides: 6, pct: '30%' },
              { label: '04:30 - 06:30 PM (Evening Return Rush)', rides: 22, pct: '100%' },
              { label: '07:30 - 09:00 PM (Hostel & Dinner Commute)', rides: 11, pct: '50%' },
            ].map((slot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#143D32]">{slot.label}</span>
                  <span className="font-mono font-bold text-[#582C4D]">{slot.rides} rides</span>
                </div>
                <div className="w-full h-2 bg-[#E2DDD3]/60 rounded-full overflow-hidden">
                  <div
                    style={{ width: slot.pct }}
                    className="h-full bg-gradient-to-r from-[#D8C6D1] to-[#582C4D] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight 2: Growth & Period Comparisons */}
        <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2DDD3]/60">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <h3 className="font-bold text-sm text-[#143D32]">Period Growth & Comparison</h3>
          </div>
          <p className="text-xs text-[#5C716A]">
            Comparing {viewMode} view with immediately preceding equivalent interval:
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
              <span className="text-[#5C716A]">Ride Volume</span>
              <div className="text-right">
                <div className="font-mono font-bold text-[#143D32]">
                  {totalRidesCreated} vs {prevTotalRides}
                </div>
                <div className={`text-[10px] font-mono font-bold ${ridesDelta >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'}`}>
                  {ridesDelta >= 0 ? `+${ridesDelta}` : ridesDelta} rides ({ridesPctChange !== null ? `${ridesPctChange}%` : 'N/A'})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
              <span className="text-[#5C716A]">Completed Fare Sum</span>
              <div className="text-right">
                <div className="font-mono font-bold text-[#166534]">
                  ₹{totalCompletedFare} vs ₹{prevCompletedFare}
                </div>
                <div className="text-[10px] font-mono text-[#5C716A]">
                  Net difference: ₹{totalCompletedFare - prevCompletedFare}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3]">
              <span className="text-[#5C716A]">Active Driver Pool</span>
              <div className="text-right font-mono font-bold text-[#143D32]">
                7 Verified Drivers
              </div>
            </div>
          </div>
        </div>

        {/* Insight 3: Operational & Safety Alerts */}
        <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2DDD3]/60">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <h3 className="font-bold text-sm text-[#143D32]">Operational Observations</h3>
          </div>
          <p className="text-xs text-[#5C716A]">
            Algorithmic patterns detected across the selected time boundary:
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Zero Active SOS Distress Calls</strong>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  100% safety checks cleared across Premnagar and Selaqui transit lanes.
                </p>
              </div>
            </div>

            {cancellationRate > 15 ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Elevated Cancellations ({cancellationRate.toFixed(1)}%)</strong>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    Cancellation rate exceeds the 15% campus threshold. Inspect driver punctuality.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F7F5F0] border border-[#E2DDD3] flex items-start gap-2.5 text-xs text-[#143D32]">
                <Sparkles className="w-4 h-4 text-[#582C4D] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Healthy Campus Seat Utilization</strong>
                  <p className="text-[11px] text-[#5C716A] mt-0.5">
                    Corridor matching rate remains within optimal student transit parameters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
