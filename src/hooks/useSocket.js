import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { addMessage, updateUserOnline, setTyping } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/notificationSlice';

export const useSocket = () => {
  const { user, accessToken } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user || !accessToken || initialized.current) return;

    const socket = connectSocket(accessToken);
    initialized.current = true;

    socket.on('message:receive', (message) => {
      dispatch(addMessage(message));
    });

    socket.on('user:online', ({ userId, online }) => {
      dispatch(updateUserOnline({ userId, online }));
    });

    socket.on('typing:start', ({ userId, conversationId }) => {
      dispatch(setTyping({ conversationId, userId, isTyping: true }));
    });

    socket.on('typing:stop', ({ userId, conversationId }) => {
      dispatch(setTyping({ conversationId, userId, isTyping: false }));
    });

    socket.on('notification:receive', (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      initialized.current = false;
      disconnectSocket();
    };
  }, [user, accessToken, dispatch]);

  return getSocket();
};
