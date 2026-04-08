'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useConversations, useConversation, useSendMessage } from '@/hooks/useChat';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import type { Conversation, ChatMessage } from '@/lib/types';
import { format } from 'date-fns';

function ChatContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get('conversation');
  const { activeConversationId, setActiveConversation } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convId = activeConversationId || preselected || '';
  const { data: conversations, isLoading: loadingConvs } = useConversations();
  const { data: activeConv } = useConversation(convId);
  const sendMessage = useSendMessage(convId);

  useEffect(() => {
    if (preselected && !activeConversationId) {
      setActiveConversation(preselected);
    }
  }, [preselected, activeConversationId, setActiveConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = () => {
    if (!message.trim() || !convId) return;
    sendMessage.mutate(message.trim());
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Conversation list */}
        <div className="border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-gray-900">Conversations</h3>
          </div>
          {loadingConvs ? (
            <div className="p-4 text-gray-500 text-sm">Loading...</div>
          ) : !conversations?.length ? (
            <div className="p-4 text-gray-500 text-sm">No conversations yet.</div>
          ) : (
            conversations.map((conv: Conversation) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  convId === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conv.participants
                    ?.filter((p) => p.id !== user?.id)
                    .map((p) => p.name)
                    .join(', ') || 'Conversation'}
                </p>
                {conv.listing && (
                  <p className="text-xs text-blue-600 mt-0.5 truncate">
                    📍 {conv.listing.title}
                  </p>
                )}
                {!conv.listing && conv.offer?.listings && conv.offer.listings.length > 0 && (
                  <p className="text-xs text-blue-600 mt-0.5 truncate">
                    📦 {conv.offer.listings.map((l: any) => l.title).join(', ')}
                  </p>
                )}
                {conv.messages?.[conv.messages.length - 1] && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {conv.messages[conv.messages.length - 1].content}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 flex flex-col">
          {!convId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <p className="font-semibold text-sm text-gray-900">
                  {activeConv?.participants
                    ?.filter((p) => p.id !== user?.id)
                    .map((p) => p.name)
                    .join(', ') || 'Chat'}
                </p>
                {/* Direct listing conversation */}
                {activeConv?.listing && (
                  <a
                    href={`/listings/${activeConv.listing.id}`}
                    className="mt-2 flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {activeConv.listing.images?.[0] && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${activeConv.listing.images[0].url}`}
                        alt=""
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-900 truncate">{activeConv.listing.title}</p>
                      <p className="text-xs text-blue-700">
                        ₹{activeConv.listing.price.toLocaleString()}/month · {activeConv.listing.type}
                      </p>
                    </div>
                  </a>
                )}
                {/* Offer-based conversation with listings */}
                {!activeConv?.listing && activeConv?.offer?.listings && activeConv.offer.listings.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {activeConv.offer.listings.map((l: any) => (
                      <a
                        key={l.id}
                        href={`/listings/${l.id}`}
                        className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        {l.images?.[0] && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${l.images[0].url}`}
                            alt=""
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-blue-900 truncate">{l.title}</p>
                          <p className="text-xs text-blue-700">
                            ₹{l.price?.toLocaleString()}/month · {l.type}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv?.messages?.map((msg: ChatMessage) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleSend} loading={sendMessage.isPending} disabled={!message.trim()}>
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-gray-500">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
