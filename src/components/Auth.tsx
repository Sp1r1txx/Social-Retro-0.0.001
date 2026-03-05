import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Star, Heart, Sparkles, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Auth() {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!username || !securityQuestion || !securityAnswer) {
          throw new Error(t('processing')); // Generic error for missing fields
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: username,
          photoURL: `https://picsum.photos/seed/${username}/200/200`
        });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username: username,
          display_name: username,
          bio: t('bio_placeholder'),
          profile_pic: user.photoURL,
          custom_bg: "#f0f2f5",
          custom_color: "#000000",
          security_question: securityQuestion,
          security_answer: securityAnswer.toLowerCase().trim(),
          created_at: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] pattern-grid p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-pink-500 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl" />
        
        <div className="text-center mb-8">
          <div className="inline-block bg-pink-500 p-3 rounded-2xl shadow-lg mb-4 rotate-3">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter glitter-text mb-2">SOCIALRETRO</h1>
          <p className="text-xs font-bold opacity-50 uppercase tracking-widest">
            {isLogin ? t('auth_welcome_back') : t('auth_join')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 ml-2 opacity-50">{t('username')}</label>
              <input 
                type="text" 
                placeholder="Cool_User_2005"
                className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-pink-500 outline-none font-mono text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 ml-2 opacity-50">{t('email')}</label>
            <input 
              type="email" 
              placeholder="emo_kid@hotmail.com"
              className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-pink-500 outline-none font-mono text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 ml-2 opacity-50">{t('password')}</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-pink-500 outline-none font-mono text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Shield size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('security_question')}</span>
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="What was your first pet's name?"
                  className="w-full p-2 bg-white rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  required
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder={t('security_answer')}
                  className="w-full p-2 bg-white rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 text-red-500 text-[10px] font-bold rounded-xl border border-red-100 text-center uppercase"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl hover:bg-pink-600 transition-all shadow-lg uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? t('processing') : (isLogin ? t('login') : t('register'))}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-widest"
          >
            {isLogin ? t('no_account') : t('have_account')}
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-4 opacity-20">
          <Heart size={16} />
          <Star size={16} />
          <Sparkles size={16} />
        </div>
      </motion.div>
    </div>
  );
}
