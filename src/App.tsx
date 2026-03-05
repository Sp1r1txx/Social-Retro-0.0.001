/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Post } from './types';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Messenger from './components/Messenger';
import MusicPlayer from './components/MusicPlayer';
import Auth from './components/Auth';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'profile' | 'messenger'>('feed');
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Listen to user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ id: doc.id, ...doc.data() } as User);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
        });
        return () => unsubUser();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f0f2f5] font-mono">
        <div className="text-3xl font-black italic tracking-tighter mb-8 glitter-text">SOCIALRETRO</div>
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden border border-black/10 shadow-inner">
          <motion.div 
            className="h-full bg-pink-500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-widest opacity-50 animate-pulse">
          {t('loading')}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ${currentUser.custom_bg === '#f0f2f5' ? 'pattern-grid' : ''}`}
      style={{ backgroundColor: currentUser.custom_bg, color: currentUser.custom_color }}
    >
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} />
      
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-pink-500 text-center relative"
            >
              <div className="absolute -top-6 -left-6 bg-yellow-400 p-4 rounded-2xl shadow-lg rotate-[-10deg] animate-bounce">
                <Star className="text-black" size={32} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter mb-4 glitter-text">{t('welcome')}</h2>
              <p className="text-sm font-bold opacity-60 mb-6">
                {t('welcome_desc')}
              </p>
              <button 
                onClick={() => setShowWelcome(false)}
                className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl hover:bg-pink-600 transition-all shadow-lg uppercase tracking-widest"
              >
                {t('lets_go')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto pt-20 pb-10 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Feed currentUser={currentUser} />
            </motion.div>
          )}
          
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Profile user={currentUser} onUpdate={setCurrentUser} />
            </motion.div>
          )}

          {activeTab === 'messenger' && (
            <motion.div
              key="messenger"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Messenger currentUser={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Floating Music Player */}
      <div className="fixed bottom-4 right-4 z-[150] w-64">
        <MusicPlayer />
      </div>

      {/* Retro Footer */}
      <footer className="text-center py-8 opacity-50 text-xs font-mono uppercase tracking-widest">
        SocialRetro v1.0 • Built with <span className="text-pink-500">♥</span> for the 2000s
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

