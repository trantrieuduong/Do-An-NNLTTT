import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import { getMyChats, getMessages, createGroupChat, getChatMembers } from '../api/chatService';
import { userService } from '../api/userService';
import { useChat } from '../context/ChatContext';
import '../styles/Chat.css';

const Chat = () => {
    const navigate = useNavigate();
    const { stompClient, isConnected, lastChatUpdate, setActiveChatId } = useChat();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

    // Cursor-based pagination state for infinite scroll
    const [oldestCursorSeq, setOldestCursorSeq] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);

    // Initial data fetch
    const fetchChats = async () => {
        try {
            const chatList = await getMyChats();
            setChats(chatList.content || []);
        } catch (error) {
            console.error('Failed to load chats:', error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await userService.getMyProfile();
                const user = response.data || response;
                setCurrentUser(user);
                await fetchChats();
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };

        fetchUser();
    }, []);

    // Handle global updates (e.g. new message in any chat to bump list)
    useEffect(() => {
        if (lastChatUpdate && lastChatUpdate.chatEvent === 'NEW_MESSAGE') {
            // Re-fetch chats to ensure correct order and latest preview
            // Optimization: We could manually move the chat to top if we had the full chat object,
            // but re-fetching ensures consistency with backend sorting.
            fetchChats();
        }
    }, [lastChatUpdate]);

    // Update active chat in context
    useEffect(() => {
        setActiveChatId(selectedChat?.id);

        // Subscribe to specific chat messages
        let subscription = null;
        if (selectedChat && isConnected && stompClient) {
            subscription = stompClient.subscribe(`/topic/chats/${selectedChat.id}/messages`, (message) => {
                const newMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            loadMessages(selectedChat.id);
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [selectedChat, isConnected, stompClient, setActiveChatId]);


    const loadMessages = async (chatId) => {
        try {
            // Load latest messages (no cursorSeq = from newest)
            const messagesData = await getMessages(chatId);
            const msgs = messagesData.items || [];
            setMessages([...msgs].reverse());
            // Reset cursor state: nextCursorSeq points to older messages
            setOldestCursorSeq(messagesData.nextCursorSeq ?? null);
            setHasMoreMessages(messagesData.nextCursorSeq !== null && messagesData.nextCursorSeq !== undefined);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = (content, type = 'TEXT') => {
        if (!stompClient || !selectedChat) return;

        const messageRequest = {
            content,
            type
        };

        stompClient.publish({
            destination: `/app/chats/${selectedChat.id}/messages.send`,
            body: JSON.stringify(messageRequest),
        });
    };

    const handleAutoMarkRead = (seq) => {
        if (!stompClient || !selectedChat) return;

        stompClient.publish({
            destination: `/app/chats/${selectedChat.id}/messages.read/${seq}`,
        });
    };

    const handleViewProfile = async (userId) => {
        // If userId is passed (from avatar click), use it
        if (userId && typeof userId === 'string') {
            navigate(`/profile/${userId}`);
            return;
        }

        // Fallback for header menu click (view profile of chat partner)
        if (!selectedChat) return;

        if (selectedChat.type === 'GROUP') {
            return;
        }
        try {
            // Fetch members to find the other user
            const members = await getChatMembers(selectedChat.id);
            const otherMember = members.find(m => m.memberId !== currentUser.userId);

            if (otherMember) {
                navigate(`/profile/${otherMember.memberId}`);
            } else {
                console.error("Could not find other member in this chat");
            }
        } catch (error) {
            console.error("Failed to fetch chat members", error);
        }
    };

    const handleLoadMoreMessages = async () => {
        if (isLoadingOldMessages || !hasMoreMessages || !selectedChat || oldestCursorSeq === null) return;

        setIsLoadingOldMessages(true);

        try {
            // Pass cursorSeq of oldest fetched message to get messages before it
            const messagesData = await getMessages(selectedChat.id, 20, oldestCursorSeq);
            const olderMsgs = messagesData.items || [];

            if (olderMsgs.length > 0) {
                // Backend trả về mới → cũ, reverse để prepend theo thứ tự cũ → mới
                const prepend = [...olderMsgs].reverse();
                setMessages(prevMessages => [...prepend, ...prevMessages]);
                setOldestCursorSeq(messagesData.nextCursorSeq ?? null);
                setHasMoreMessages(messagesData.nextCursorSeq !== null && messagesData.nextCursorSeq !== undefined);
            } else {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            setIsLoadingOldMessages(false);
        }
    };


    const handleCreateGroupOpen = () => {
        setIsCreateGroupModalOpen(true);
    };

    const handleCreateGroupSubmit = async (chatName, selectedFriendIds) => {
        try {
            const newGroupChat = await createGroupChat(chatName, selectedFriendIds);
            setChats(prev => [newGroupChat, ...prev]);
            setSelectedChat(newGroupChat);
            // Optionally send a system message via STOMP if backend doesn't do it automatically
            // But usually backend handles creating the chat room

            // Note: We don't need to manually close modal here strictly if the child component calls onClose
            // But let's assume the child calls onCreate and expects us to handle success logic
            // The modal component I wrote closes itself on success try/catch, so we don't need to double close here
            // actually the modal calls onCreate then onClose inside try block.
        } catch (error) {
            console.error("Failed to create group chat", error);
            throw error; // Propagate to modal to handle loading state/error
        }
    };

    return (
        <MainLayout>
            <div className="chat-container">
                <ChatSidebar
                    chats={chats}
                    selectedChatId={selectedChat?.id}
                    onSelectChat={setSelectedChat}
                    onCreateGroup={handleCreateGroupOpen}
                />
                <div className="chat-main">
                    {selectedChat ? (
                        <ChatWindow
                            chat={selectedChat}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            currentUserId={currentUser?.userId}
                            onAutoMarkRead={handleAutoMarkRead}
                            onViewProfile={handleViewProfile}
                            hasMoreMessages={hasMoreMessages}
                            isLoadingOldMessages={isLoadingOldMessages}
                            onLoadMoreMessages={handleLoadMoreMessages}
                        />
                    ) : (
                        <div className="no-chat-selected">
                            <p>Select a chat to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setIsCreateGroupModalOpen(false)}
                onCreate={handleCreateGroupSubmit}
            />
        </MainLayout>
    );
};

export default Chat;
