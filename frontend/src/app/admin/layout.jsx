'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiGrid,
  FiUsers,
  FiBook,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiArrowRight,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi';
import { apiCall } from '../../lib/backendFetch';

// ─────────────────────────────────────────────
// Sidebar Link
// ─────────────────────────────────────────────
const SidebarLink = ({ href, icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary text-dark-bg shadow-md shadow-primary/30'
          : 'text-text-secondary hover:bg-dark-bg hover:text-text-main'
      }`}
    >
      <span
        className={`text-base transition-transform duration-200 group-hover:scale-110 ${
          isActive ? 'text-dark-bg' : 'text-primary'
        }`}
      >
        {icon}
      </span>
      {label}
      {isActive && <FiChevronRight className="ml-auto text-dark-bg/60" size={14} />}
    </Link>
  );
};

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
const Sidebar = ({ isSidebarOpen, closeSidebar, onLogout }) => (
  <>
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
        onClick={closeSidebar}
      />
    )}
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-card-bg border-r border-white/5 p-5 z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
            <span className="text-dark-bg font-black text-sm">S</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-text-main">SlotSmart</h1>
        </div>
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-dark-bg text-text-secondary transition"
        >
          <FiX size={16} />
        </button>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary/50 px-4 mb-2">
        Admin Panel
      </p>

      <nav className="space-y-1 flex-1">
        <SidebarLink href="/admin/dashboard"  icon={<FiGrid />}         label="Dashboard"  onClick={closeSidebar} />
        <SidebarLink href="/admin/students"   icon={<FiUsers />}        label="Students"   onClick={closeSidebar} />
        <SidebarLink href="/admin/courses"    icon={<FiBook />}         label="Subjects"   onClick={closeSidebar} />
        <SidebarLink href="/admin/messages"   icon={<FiMessageSquare />} label="Messages"  onClick={closeSidebar} />
        <SidebarLink href="/admin/settings"   icon={<FiSettings />}    label="Settings"   onClick={closeSidebar} />
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 w-full"
      >
        <FiLogOut size={16} />
        Logout
      </button>
    </aside>
  </>
);

// ─────────────────────────────────────────────
// Avatar color helper — consistent per sender
// ─────────────────────────────────────────────
const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // purple
];

const getAvatarColor = (name = '') => {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ─────────────────────────────────────────────
// Relative time helper
// ─────────────────────────────────────────────
const relativeTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000)     return 'just now';
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const d = Math.floor(diff / 86_400_000);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
};

// ─────────────────────────────────────────────
// Message / Notification Item
// ─────────────────────────────────────────────
const MessageItem = ({ msg, onReplySent, onDismiss, onMarkRead }) => {
  const id = msg._id ?? msg.msg_Id;

  const [replyOpen, setReplyOpen] = useState(false);
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  // Local read state for instant UI — initialised from prop
  const [isRead, setIsRead]       = useState(!!msg.is_Read);
  const inputRef = useRef(null);

  const senderName  = msg.username ?? msg.sender ?? 'Unknown';
  const firstLetter = senderName.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(senderName);
  const timeLabel   = relativeTime(msg.timestamp ?? msg.created_at);
  const canReply    = msg.can_Reply !== false;
  const isUnread    = !isRead;

  useEffect(() => {
    if (replyOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [replyOpen]);

  // ── Send reply ──
  const sendReply = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await apiCall('/reply_msg', {
        method: 'POST',
        body: JSON.stringify({
          parent_Msg_Id: id,
          receiver_Gmail: msg.sender_Gmail,
          message: text.trim(),
        }),
      });
      setText('');
      setSent(true);
      setReplyOpen(false);
      setTimeout(() => setSent(false), 2500);
      onReplySent?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // ── Mark as read (optimistic) ──
  const markAsRead = async () => {
    if (isRead) return;

    setIsRead(true);                        // 1️⃣ local instant
    const revert = onMarkRead?.(id);        // 2️⃣ parent instant (badge -1), returns revert fn

    try {
      await apiCall('/read_msg', {          // 3️⃣ sync backend
        method: 'POST',
        body: JSON.stringify({ msg_Id: id }),
      });
    } catch (err) {
      console.error('markAsRead failed — reverting:', err);
      setIsRead(false);
      revert?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
    if (e.key === 'Escape') setReplyOpen(false);
  };

  const lastReply = msg.replies?.length > 0 ? msg.replies[msg.replies.length - 1] : null;

  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/2 transition-colors duration-150 ${
        isUnread ? 'bg-blue-500/4' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5 select-none"
        style={{ backgroundColor: avatarColor }}
      >
        {firstLetter}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">

        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[12px] font-semibold text-white truncate">{senderName}</span>
            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {timeLabel && <span className="text-[10px] text-gray-500">{timeLabel}</span>}
            <button
              onClick={() => onDismiss?.(id)}
              title="Remove"
              className="w-5 h-5 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/10 transition"
            >
              <FiX size={11} />
            </button>
          </div>
        </div>

        {/* Subject */}
        <p className="text-[12px] font-semibold text-gray-200 mt-0.5 truncate">{msg.subject}</p>

        {/* Message preview */}
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{msg.message}</p>

        {/* Last thread reply preview */}
        {lastReply && !replyOpen && (
          <p className="text-[10px] text-gray-500 mt-1.5 truncate">
            <span className="text-indigo-400 font-medium">{lastReply.sender}</span>: {lastReply.message}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-2">
          {canReply && (
            <button
              onClick={() => setReplyOpen((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition"
            >
              {sent ? (
                <span className="text-emerald-400">✓ Sent</span>
              ) : (
                <>
                  {replyOpen ? 'Cancel' : 'Reply'}
                  {!replyOpen && (
                    <FiChevronDown
                      size={11}
                      className={`transition-transform duration-200 ${replyOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </>
              )}
            </button>
          )}

          {isUnread && (
            <button
              onClick={markAsRead}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition"
            >
              Mark read
            </button>
          )}
        </div>

        {/* Collapsible reply box */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            replyOpen ? 'max-h-36 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/5 rounded-xl border border-white/10 p-2.5">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a reply… (Enter to send)"
              rows={2}
              className="w-full bg-transparent text-[11px] text-gray-200 outline-none resize-none placeholder:text-gray-600 leading-relaxed"
            />
            <div className="flex justify-end mt-1.5">
              <button
                onClick={sendReply}
                disabled={sending || !text.trim()}
                className="px-3 py-1 text-[11px] font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Top Header
// ─────────────────────────────────────────────
const TopHeader = ({ openSidebar }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages]       = useState([]);
  const [dismissed, setDismissed]     = useState(new Set());
  const [showBox, setShowBox]         = useState(false);
  const boxRef = useRef(null);

  // ── Data fetchers ──
  const fetchNotification = async () => {
    try {
      const data = await apiCall('/get_notification', { method: 'GET' });
      setUnreadCount(data?.unread_count ?? 0);
    } catch (err) {
      console.error('fetchNotification:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiCall('/get_user_messages', { method: 'GET' });
      const msgs = Array.isArray(data)
        ? data
        : data && typeof data === 'object'
        ? Object.values(data).flat()
        : [];
      setMessages([...msgs].reverse());
    } catch (err) {
      console.error('fetchMessages:', err);
    }
  };

  // ── Poll every 10 s ──
  useEffect(() => {
    fetchNotification();
    fetchMessages();
    const interval = setInterval(() => {
      fetchNotification();
      fetchMessages();
    }, 300_000);
    return () => clearInterval(interval);
  }, []);

  // ── Close on outside click ──
  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowBox(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Handlers ──
  const handleDismiss = (id) =>
    setDismissed((prev) => new Set([...prev, id]));

  /**
   * Optimistically marks a message read in parent state + unread count.
   * Returns a revert function so MessageItem can roll back on backend failure.
   */
  const handleMarkRead = (id) => {
    setMessages((prev) =>
      prev.map((m) => (m._id ?? m.msg_Id) === id ? { ...m, is_Read: true } : m)
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    return () => {
      setMessages((prev) =>
        prev.map((m) => (m._id ?? m.msg_Id) === id ? { ...m, is_Read: false } : m)
      );
      setUnreadCount((prev) => prev + 1);
    };
  };

  const visibleMessages = messages.filter(
    (m) => !dismissed.has(m._id ?? m.msg_Id)
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-card-bg/80 backdrop-blur-md border-b border-white/5">
      {/* Mobile hamburger */}
      <button
        onClick={openSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-dark-bg text-text-secondary transition"
      >
        <FiMenu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">

        {/* ── Bell + Notification Dropdown ── */}
        <div className="relative" ref={boxRef}>
          <button
            onClick={() => setShowBox((prev) => !prev)}
            className="relative p-2 rounded-xl hover:bg-dark-bg text-text-secondary hover:text-text-main transition-all duration-200"
            aria-label="Notifications"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── Dropdown Panel ── */}
          <div
            className={`absolute right-0 mt-2 z-50 origin-top-right transition-all duration-200
              ${showBox
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            style={{ width: '22rem' }}
          >
            <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                <span className="text-[13px] font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Message list */}
              <div className="max-h-128 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {visibleMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <FiBell size={24} className="text-gray-600" />
                    <p className="text-[12px] text-gray-500">You're all caught up</p>
                  </div>
                ) : (
                  visibleMessages.slice(0, 8).map((msg) => (
                    <MessageItem
                      key={msg._id ?? msg.msg_Id}
                      msg={msg}
                      onReplySent={fetchMessages}
                      onDismiss={handleDismiss}
                      onMarkRead={handleMarkRead}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/[0.07]">
                <Link
                  href="/admin/messages"
                  onClick={() => setShowBox(false)}
                  className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  View all messages <FiArrowRight size={12} />
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* ── Admin Avatar ── */}
        <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/30 hover:ring-primary/60 transition cursor-pointer">
          <Image
            src="/assets/person1.jpeg"
            alt="admin avatar"
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
// Main Layout
// ─────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch('/api/logout', { method: 'POST' }); } catch (_) {}
    router.replace('/');
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <TopHeader openSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}