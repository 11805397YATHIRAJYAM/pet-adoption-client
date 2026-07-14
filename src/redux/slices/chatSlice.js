import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    typingUsers: {},
    onlineUsers: [],
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) state.typingUsers[conversationId] = [];
      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter((id) => id !== userId);
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    updateUserOnline: (state, action) => {
      const { userId, online } = action.payload;
      if (online && !state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      } else if (!online) {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setChatLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  setTyping,
  setOnlineUsers,
  updateUserOnline,
  setChatLoading,
} = chatSlice.actions;
export default chatSlice.reducer;
