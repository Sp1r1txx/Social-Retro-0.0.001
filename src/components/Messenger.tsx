import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { User, Message } from '../types';
import { Send, Smile, Image as ImageIcon, Phone, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, where, or, and } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

interface MessengerProps {
  currentUser: User;
}

export default function Messenger({ currentUser }: MessengerProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock contact
  const contact = {
    id: '999',
    username: 'msn_buddy',
    display_name: 'Cool Buddy (Online)',
    profile_pic: 'https://picsum.photos/seed/buddy/100/100'
  };

  useEffect(() => {
    // Listen to messages between currentUser and contact
    const q = query(
      collection(db, 'messages'),
      where('sender_id', 'in', [currentUser.uid, contact.id]),
      orderBy('created_at', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .filter(msg => 
          (msg.sender_id === currentUser.uid && msg.receiver_id === contact.id) ||
          (msg.sender_id === contact.id && msg.receiver_id === currentUser.uid)
        );
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [currentUser.uid, contact.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sender_id: currentUser.uid,
        receiver_id: contact.id,
        content: newMessage,
        created_at: new Date().toISOString()
      });
      setNewMessage('');

      // Mock auto-reply
      setTimeout(async () => {
        await addDoc(collection(db, 'messages'), {
          sender_id: contact.id,
          receiver_id: currentUser.uid,
          content: "Haha, that's cool! xD",
          created_at: new Date().toISOString()
        });
        
        // Visual "DING!"
        const ding = document.createElement('div');
        ding.innerText = 'DING!';
        ding.className = 'fixed top-20 right-4 bg-yellow-400 text-black font-black px-4 py-2 rounded-full shadow-2xl z-[100] animate-bounce';
        document.body.appendChild(ding);
        setTimeout(() => ding.remove(), 2000);
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden flex flex-col h-[600px]">
      {/* Messenger Header */}
      <div className="bg-blue-500 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={contact.profile_pic} 
              alt={contact.username} 
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-500 rounded-full" />
          </div>
          <div>
            <div className="font-bold text-sm">{contact.display_name}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-80 flex items-center gap-1">
              <span className="animate-blink">{t('available')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded-full animate-pulse hidden sm:block">
            {t('new_message')}!
          </div>
          <Phone size={18} className="cursor-pointer hover:scale-110 transition-transform" />
          <Video size={18} className="cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#f0f4f8] custom-scrollbar"
      >
        <div className="text-center text-[10px] uppercase tracking-widest opacity-30 my-4">
          {t('conversation_started')} {new Date().toLocaleDateString()}
        </div>

        {messages.map(msg => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, scale: 0.9, x: msg.sender_id === currentUser.id ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.sender_id === currentUser.id 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none'
            }`}>
              {msg.content}
              <div className={`text-[8px] mt-1 opacity-50 ${msg.sender_id === currentUser.id ? 'text-right' : 'text-left'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-black/5">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400">
            <Smile size={20} className="cursor-pointer hover:text-blue-500 transition-colors" />
            <ImageIcon size={20} className="cursor-pointer hover:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder={t('type_message')} 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
