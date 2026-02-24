import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '@/lib/api';

export function useChat({ isOpen }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadHistory = useCallback(async () => {
        try {
            const { data } = await chatAPI.getHistory();
            if (data.success) {
                setMessages(data.messages || []);
            }
        } catch (err) {
            console.error('Failed to load chat history', err);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen, loadHistory]);

    const sendMessage = async (input) => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();

        // Optimistic Update
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);
        setError('');

        try {
            const { data } = await chatAPI.sendMessage(userMessage);
            if (data.success) {
                setMessages(data.history);
                if (data.actionTaken) {
                    // In a real app with global state (Context/Redux), we would trigger a refresh here.
                    // For now, reload is a safe fallback to ensure data consistency.
                    window.location.reload();
                }
            }
        } catch (err) {
            console.error('Failed to send message', err);
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            if (err.response && err.response.status === 429) {
                errorMessage = "I'm receiving too many requests. Please try again in 1 minute.";
            }

            setMessages(prev => [...prev, {
                role: 'model',
                content: errorMessage
            }]);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        loadHistory
    };
}
