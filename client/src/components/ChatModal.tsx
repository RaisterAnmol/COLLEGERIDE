import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getSocket, joinConversationRoom } from '../services/socket';
import { IConversation, IMessage } from '../types';
import { X, Send, MessageSquare, Shield, Clock } from 'lucide-react';

interface ChatModalProps {
  rideId: string;
  onClose: () => void;
  title?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ rideId, onClose, title = 'Ride Coordination Chat' }) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadChat() {
      try {
        setLoading(true);
        const data = await api.getConversation(rideId);
        const conv = data?.conversation || data;
        if (isMounted && conv) {
          setConversation(conv);
          setMessages(conv.messages || []);
          joinConversationRoom(conv._id);
        }
      } catch (err) {
        console.error('[ChatModal] Failed to load conversation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChat();

    const socket = getSocket();
    const handleNewMessage = (msg: IMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chatMessage', handleNewMessage);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      socket.off('chatMessage', handleNewMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rideId, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation?._id || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.sendMessage(conversation._id, textToSend);
      const newMsg = res?.message || res;
      if (newMsg) {
        setMessages((prev) => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
      // Socket event will automatically broadcast and append message to list
    } catch (err) {
      console.error('[ChatModal] Send message failed:', err);
      // Fallback: restore input if failed
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#143D32]/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col h-[550px] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#143D32] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 id="chat-modal-title" className="font-bold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-emerald-200/80 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Verified Campus Ride Channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
              Loading ride conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No messages yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Coordinate pickup location, landmarks, or exact departure timing here!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
              const senderName = typeof msg.senderId === 'object' ? msg.senderId?.name : 'Member';
              const isMe = senderId === user?._id;

              return (
                <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 px-1 mb-0.5 font-medium">
                    {isMe ? 'You' : senderName}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content || msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isMe ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(msg.createdAt || msg.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message (e.g. 'I am standing near Gate 1 ATM')..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

