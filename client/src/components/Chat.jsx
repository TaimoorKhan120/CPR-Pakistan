import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

export default function Chat({ requestId, otherName, otherPhone }) {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  // Load history
  useEffect(() => {
    if (!requestId || !token) return;
    fetch(`/api/chat/request/${requestId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((msgs) => { if (Array.isArray(msgs)) setMessages(msgs); })
      .catch(() => {});
  }, [requestId, token]);

  // Real-time messages
  useEffect(() => {
    if (!socket) return;
    const onMessage = (msg) => {
      if (msg.request_id !== requestId) return;
      setMessages((prev) => [...prev, msg]);
      if (!open) setUnread((n) => n + 1);
    };
    socket.on('new_message', onMessage);
    return () => socket.off('new_message', onMessage);
  }, [socket, requestId, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const send = () => {
    const msg = input.trim();
    if (!msg || !socket) return;
    socket.emit('send_message', { requestId, message: msg });
    setInput('');
  };

  const callOther = () => { window.location.href = `tel:${otherPhone}`; };
  const whatsappOther = () => { window.open(`https://wa.me/${otherPhone?.replace(/^0/, '92')}`, '_blank'); };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 bg-pakistan-green text-white rounded-full shadow-xl flex items-center justify-center relative"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-emergency text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: '420px' }}>
          {/* Header */}
          <div className="bg-pakistan-green text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <div className="font-bold text-sm">{otherName}</div>
              <div className="text-xs text-green-200">Live Chat</div>
            </div>
            <div className="flex items-center gap-2">
              {otherPhone && (
                <>
                  <button onClick={callOther} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  </button>
                  <button onClick={whatsappOther} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.528 5.858L.05 23.5l5.793-1.448A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.375l-.36-.214-3.726.931.978-3.605-.234-.371A9.818 9.818 0 1112 21.818z" />
                    </svg>
                  </button>
                </>
              )}
              <button onClick={() => setOpen(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-xs text-gray-400 pt-8">
                <div className="text-2xl mb-2">💬</div>
                <p>Start chatting with {otherName}</p>
                <p className="urdu mt-1">بات چیت شروع کریں</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-pakistan-green text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'}`}>
                    <p className="leading-snug">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2 bg-white shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pakistan-green"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-10 h-10 bg-pakistan-green text-white rounded-xl flex items-center justify-center disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
