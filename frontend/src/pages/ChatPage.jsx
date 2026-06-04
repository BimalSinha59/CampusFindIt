import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import apiClient from '../api/axios';
import { Send, Package, MessageSquare, ChevronLeft, Loader2 } from 'lucide-react';

const socket = io(import.meta.env.VITE_BACKEND_URL);

const ChatPage = ({ currentUser }) => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();

    const fetchConversations = useCallback(async () => {
        if (!currentUser?._id) return;
        try {
            const res = await apiClient.get(`/chats/user/${currentUser._id}`);
            const chats = res.data;
            setConversations(chats);
            
            const activeClaimId = location.state?.activeClaimId;
            const stateSelectedChat = location.state?.selectedChat;

            if (activeClaimId && !currentChat) {
                // Find the chat that belongs to the specific claim
                const targetedChat = chats.find(c => c.claimId === activeClaimId);
                if (targetedChat) handleSelectChat(targetedChat);
            } else if (stateSelectedChat && !currentChat) {
                handleSelectChat(stateSelectedChat);
            }
        } catch (err) {
            console.error("Sidebar Loading Error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id, location.state, currentChat]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Selecting a Chat
    const handleSelectChat = async (chat) => {
        setCurrentChat(chat);
        socket.emit("join_chat", chat._id);
        try {
            const res = await apiClient.get(`/chats/messages/${chat._id}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Message History Error:", err);
        }
    };

    // Real-time listener
    useEffect(() => {
        const handleNewMessage = (data) => {
            if (currentChat?._id === data.conversationId) {
                setMessages((prev) => [...prev, data]);
            }
            fetchConversations(); 
        };

        socket.on("receive_message", handleNewMessage);
        return () => socket.off("receive_message", handleNewMessage);
    }, [currentChat?._id, fetchConversations]);

    // Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        const payload = {
            conversationId: currentChat._id,
            sender: currentUser._id, 
            text: newMessage
        };

        try {
            const { data } = await apiClient.post('/chats/message', payload);
            socket.emit("send_message", data); 
            setNewMessage("");
        } catch (err) {
            console.error("Message Error:", err.response?.data);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-3 bg-base-100">
            <Loader2 className="animate-spin text-primary" size={48}/>
            <p className="text-xs font-black tracking-widest uppercase opacity-40">Syncing Messages...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-base-200 p-0 md:p-4 gap-0 md:gap-4 overflow-hidden">
            
            {/* Sidebar */}
            <div className={`flex-col border-r md:border w-full md:w-96 bg-base-100 md:rounded-3xl border-base-300 transition-all ${currentChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-base-200">
                    <h2 className="text-2xl font-black tracking-tighter">Inbox</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-xs font-bold text-center uppercase opacity-30">No conversations yet</div>
                    ) : (
                        conversations.map((chat) => {
                            const otherUser = chat.participants.find(p => p._id !== currentUser._id);
                            return (
                                <button 
                                    key={chat._id} 
                                    onClick={() => handleSelectChat(chat)} 
                                    className={`w-full p-5 flex items-center gap-4 border-b border-base-200 transition-all hover:bg-base-200 ${currentChat?._id === chat._id ? 'bg-primary/10 border-r-4 border-r-primary' : ''}`}
                                >
                                    <div className="avatar placeholder">
                                        <div className="flex items-center justify-center w-12 font-bold uppercase shadow-sm rounded-2xl bg-neutral text-neutral-content">
                                            <span>{otherUser?.fullName?.[0]}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-black uppercase truncate">{otherUser?.fullName || "User"}</p>
                                        <p className="text-[10px] font-bold text-primary truncate mb-1">Item: {chat.item?.title}</p>
                                        <p className="text-xs font-medium truncate opacity-60">{chat.lastMessage || "Click to start chatting..."}</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className={`flex-col flex-1 bg-base-100 md:rounded-3xl md:border border-base-300 overflow-hidden shadow-2xl ${!currentChat ? 'hidden md:flex' : 'flex'}`}>
                {currentChat ? (
                    <>
                        <div className="z-10 flex items-center justify-between p-4 border-b bg-base-100/80 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setCurrentChat(null)} className="md:hidden btn btn-ghost btn-circle btn-sm"><ChevronLeft/></button>
                                <div className="hidden sm:flex p-2.5 rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20"><Package size={20}/></div>
                                <div>
                                    <h3 className="text-sm font-black leading-tight uppercase">
                                        {currentChat.participants.find(p => p._id !== currentUser._id)?.fullName}
                                    </h3>
                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Regarding: {currentChat.item?.title}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-4 space-y-6 overflow-y-auto md:p-6 bg-base-200/30 custom-scrollbar">
                            {messages.map((m, i) => {
                                const isMe = m.sender === currentUser._id;
                                return (
                                    <div key={i} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                                        <div className="chat-header opacity-40 text-[10px] font-black uppercase mb-1">
                                            {isMe ? 'You' : currentChat.participants.find(p => p._id === m.sender)?.fullName}
                                        </div>
                                        <div className={`chat-bubble py-3 px-4 text-sm font-bold shadow-md rounded-2xl ${isMe ? 'chat-bubble-primary rounded-tr-none' : 'bg-base-100 text-base-content border border-base-300 rounded-tl-none'}`}>
                                            {m.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef}/>
                        </div>

                        <div className="p-4 border-t bg-base-100 border-base-200">
                            <form onSubmit={handleSendMessage} className="flex max-w-4xl gap-2 mx-auto">
                                <input 
                                    value={newMessage} 
                                    onChange={(e) => setNewMessage(e.target.value)} 
                                    type="text" 
                                    placeholder="Write a message..." 
                                    className="flex-1 text-sm font-bold transition-all border-none input input-bordered bg-base-200/50 rounded-2xl focus:ring-2 focus:ring-primary" 
                                />
                                <button type="submit" className="px-6 shadow-lg btn btn-primary rounded-2xl shadow-primary/30">
                                    <Send size={18} className="md:mr-2" />
                                    <span className="hidden text-xs font-black uppercase md:inline">Send</span>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 bg-base-200/20">
                        <div className="p-8 mb-6 rounded-full bg-base-200 text-base-content/10">
                            <MessageSquare size={100} strokeWidth={1}/>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-[0.3em] opacity-20">Select a conversation</h2>
                        <p className="mt-2 text-xs font-bold opacity-10">Your secure messages will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;