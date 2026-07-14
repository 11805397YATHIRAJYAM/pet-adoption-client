import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiChat, HiPaperAirplane, HiSearch, HiDotsVertical } from 'react-icons/hi';
import { messageAPI } from '../../services/api';
import {
  setConversations, setActiveConversation, setMessages, addMessage,
} from '../../redux/slices/chatSlice';
import { getAvatarUrl, timeAgo } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

export default function Messages() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { conversations, activeConversation, messages, onlineUsers } = useSelector((s) => s.chat);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await messageAPI.getConversations();
        dispatch(setConversations(data.conversations || []));
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [dispatch]);

  useEffect(() => {
    if (!activeConversation) return;
    const fetch = async () => {
      try {
        const { data } = await messageAPI.getMessages(activeConversation._id, { limit: 50 });
        dispatch(setMessages(data.data || []));
      } catch {}
    };
    fetch();

    const socket = getSocket();
    if (socket) {
      socket.emit('join:conversation', activeConversation._id);
    }

    return () => {
      if (socket) socket.emit('leave:conversation', activeConversation._id);
    };
  }, [activeConversation, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv) => {
    dispatch(setActiveConversation(conv));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeConversation) return;
    try {
      setSending(true);
      const formData = new FormData();
      formData.append('conversationId', activeConversation._id);
      formData.append('content', message.trim());
      const { data } = await messageAPI.send(formData);
      dispatch(addMessage(data.message));
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user._id);
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-4 h-[calc(100vh-96px)] flex gap-0">
      {/* Conversations list */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 card flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Messages</h2>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="input pl-9 text-sm py-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <HiChat className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isOnline = onlineUsers.includes(other?._id);
              const isActive = activeConversation?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-50 dark:border-gray-800 ${
                    isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={getAvatarUrl(other)} alt="" className="w-11 h-11 rounded-full object-cover" />
                    {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{other?.name}</p>
                      {conv.myUnreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.myUnreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage.content || 'Image'}</p>
                    )}
                    {conv.pet && <p className="text-xs text-primary-500">Re: {conv.pet.name}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`flex-1 card flex flex-col ml-4 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <HiChat className="w-16 h-16 mx-auto mb-3" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <button onClick={() => dispatch(setActiveConversation(null))} className="md:hidden p-1 rounded text-gray-500">←</button>
              {(() => {
                const other = getOtherParticipant(activeConversation);
                const isOnline = onlineUsers.includes(other?._id);
                return (
                  <>
                    <div className="relative">
                      <img src={getAvatarUrl(other)} alt="" className="w-10 h-10 rounded-full" />
                      {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{other?.name}</p>
                      <p className="text-xs text-gray-400">{isOnline ? '🟢 Online' : 'Offline'}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      isOwn
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                    }`}>
                      {msg.content}
                      {msg.attachments?.map((att, i) => (
                        <img key={i} src={att.url} alt="" className="mt-2 rounded-lg max-w-full" />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="btn-primary px-4 flex items-center gap-2"
              >
                <HiPaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
