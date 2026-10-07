import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Car,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'rides' | 'chats' | 'alerts'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Non-blocking for unauthenticated or dev states
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s poll fallback

    // Real-time socket events
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (notification: any) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      const handleRideRequest = (data: any) => {
        const dummyNotice = {
          _id: `notice_${Date.now()}`,
          type: 'RIDE_REQUEST',
          title: 'New Seat Request',
          body: `${data.passengerName || 'A student'} requested a seat on your ride.`,
          data: { rideId: data.rideId },
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [dummyNotice, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      const handleChatMessage = (payload: any) => {
        const msg = payload?.message || payload;
        if (!msg) return;
        const senderName = typeof msg.senderId === 'object' ? (msg.senderId?.name || 'Co-passenger') : (payload.senderName || 'Co-passenger');
        const textContent = msg.text || msg.content || 'Message';
        const chatNotice = {
          _id: `notice_chat_${Date.now()}`,
          type: 'CHAT_MESSAGE',
          title: 'New Ride Coordination Message',
          body: `${senderName}: "${textContent}"`,
          data: { rideId: payload.rideId || msg.rideId },
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [chatNotice, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);
      socket.on('ride:request:new', handleRideRequest);
      socket.on('chatMessage', handleChatMessage);

      return () => {
        clearInterval(interval);
        socket.off('notification:new', handleNewNotification);
        socket.off('ride:request:new', handleRideRequest);
        socket.off('chatMessage', handleChatMessage);
      };
    }

    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark notifications read', err);
    }
  };

  const handleItemClick = async (item: any) => {
    if (!item.readAt) {
      try {
        if (!item._id.startsWith('notice_')) {
          await api.markNotificationRead(item._id);
        }
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (_) {}
    }

    setIsOpen(false);
    if (item.data?.rideId) {
      navigate(`/rides/${item.data.rideId}`);
    } else if (item.type === 'EMERGENCY_SOS') {
      navigate('/safety');
    } else {
      navigate('/dashboard');
    }
  };

  // Filter items
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'rides') return ['RIDE_REQUEST', 'TRIP_UPDATE'].includes(n.type);
    if (activeTab === 'chats') return n.type === 'CHAT_MESSAGE';
    if (activeTab === 'alerts') return ['EMERGENCY_SOS', 'SECURITY_ALERT', 'VERIFICATION_STATUS'].includes(n.type);
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'RIDE_REQUEST':
      case 'TRIP_UPDATE':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'CHAT_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'EMERGENCY_SOS':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'VERIFICATION_STATUS':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-700" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 bg-white shadow-2xs"
        aria-label="Notifications"
        title="Recent alerts and ride updates"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-slate-900"
          >
            {/* Header */}
            <div className="p-3.5 px-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 px-3 pt-2 gap-1 text-[11px] font-bold text-slate-500 bg-white">
              {(['all', 'rides', 'chats', 'alerts'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-2.5 capitalize transition-colors relative cursor-pointer ${
                    activeTab === tab ? 'text-[#143D32] font-black' : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#143D32] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">All caught up!</p>
                  <p className="text-[11px] text-slate-400">No new alerts in this tab right now.</p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const isUnread = !item.readAt;
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleItemClick(item)}
                      className={`p-3.5 px-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                        isUnread ? 'bg-emerald-50/40' : 'bg-white'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                        {getIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {formatTimeAgo(item.createdAt || new Date().toISOString())}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard');
                }}
                className="text-[11px] font-bold text-emerald-800 hover:underline"
              >
                Go to Dashboard Activity →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

