import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { getSocket } from '../lib/socket.js';
import { Conversation, Message } from '../types/index.js';
import { MessageSquare, Send, User, ShoppingBag, CheckCircle2, Bot } from 'lucide-react';

export const SharedChat: React.FC = () => {
  const { user, role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data.data || []);
      if (res.data.data?.length > 0 && !activeConv) {
        selectConversation(res.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    try {
      const res = await api.get(`/chat/messages/${conv.id}`);
      setMessages(res.data.data || []);

      const socket = getSocket();
      socket.emit('join_conversation', conv.id);
    } catch (err) {
      console.error('Error loading conversation messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleNewMessage = (newMsg: Message) => {
      if (activeConv && newMsg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const content = text || inputContent;
    if (!content.trim() || !activeConv) return;

    try {
      const res = await api.post('/chat/messages', {
        conversationId: activeConv.id,
        content,
      });

      setMessages((prev) => [...prev, res.data.data]);
      setInputContent('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const quickTradePrompts = [
    'Can you provide 2,500 Kg ready for pickup by Thursday?',
    'What is your final farmgate rate for Grade A quality?',
    'Our logistics partner can arrange farmgate container pickup.',
    'Are quality inspection certificates available for this batch?',
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trade Messages & Direct Negotiation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Communicate in real-time with verified farmers and commercial buyers
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[650px]">
          {/* Conversation List Sidebar */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-sm text-slate-900">Conversations</h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active conversations yet. Reach out to a farmer or buyer from a listing!
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherPerson = role === 'FARMER' ? conv.buyer : conv.farmer;
                  const isSelected = activeConv?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`p-4 cursor-pointer transition-colors flex items-center gap-3 ${
                        isSelected ? 'bg-emerald-50 border-r-4 border-emerald-600' : 'hover:bg-slate-100'
                      }`}
                    >
                      <img
                        src={
                          otherPerson.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {otherPerson.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.listing ? `Produce: ${conv.listing.crop?.name}` : 'Direct Inquiries'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Message Area */}
          <div className="md:col-span-8 flex flex-col h-full bg-white">
            {activeConv ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        (role === 'FARMER' ? activeConv.buyer : activeConv.farmer).avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
                      }
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {(role === 'FARMER' ? activeConv.buyer : activeConv.farmer).name}
                      </h4>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        {activeConv.listing
                          ? `Listing: ${activeConv.listing.crop?.name} (${activeConv.listing.qualityGrade})`
                          : 'Direct Trade Channel'}
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ESCROW ACTIVE
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                            isMine
                              ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={`text-[9px] block text-right ${
                              isMine ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Negotiation Prompts */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex gap-2 scrollbar-none">
                  {quickTradePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-full text-[11px] font-medium shrink-0 transition-colors shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Controls */}
                <div className="p-3.5 bg-white border-t border-slate-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="Type a negotiation or delivery question..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputContent.trim()}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select a conversation from the left to start negotiating.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
