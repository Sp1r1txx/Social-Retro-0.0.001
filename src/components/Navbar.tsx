import { User } from '../types';
import { Home, User as UserIcon, MessageSquare, LogOut, Globe } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  activeTab: 'feed' | 'profile' | 'messenger';
  setActiveTab: (tab: 'feed' | 'profile' | 'messenger') => void;
  user: User;
}

export default function Navbar({ activeTab, setActiveTab, user }: NavbarProps) {
  const { t, language, setLanguage } = useLanguage();
  
  const handleLogout = () => {
    if (confirm(t('logout_confirm'))) {
      signOut(auth);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/10 px-4 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div 
          className="text-2xl font-black italic tracking-tighter cursor-pointer select-none glitter-text"
          onClick={() => setActiveTab('feed')}
        >
          SOCIALRETRO
        </div>
        <div className="hidden md:block bg-black text-green-400 font-mono text-[10px] px-2 py-1 rounded border border-green-400/30">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1 border border-black/5">
          <input 
            type="text" 
            placeholder={t('search_friends')} 
            className="bg-transparent text-[10px] font-bold outline-none w-32"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`p-2 rounded-full transition-all ${activeTab === 'feed' ? 'bg-pink-500 text-white shadow-lg scale-110' : 'hover:bg-black/5'}`}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('messenger')}
          className={`p-2 rounded-full transition-all relative ${activeTab === 'messenger' ? 'bg-blue-500 text-white shadow-lg scale-110' : 'hover:bg-black/5'}`}
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            1
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`p-2 rounded-full transition-all ${activeTab === 'profile' ? 'bg-purple-500 text-white shadow-lg scale-110' : 'hover:bg-black/5'}`}
        >
          <UserIcon size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 p-2 hover:bg-black/5 rounded-full transition-all text-blue-500 font-bold text-[10px] uppercase"
          title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
        >
          <Globe size={20} />
          <span className="hidden sm:inline">{language === 'en' ? 'ES' : 'EN'}</span>
        </button>
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold leading-none">{user.display_name}</div>
          <div className="text-xs opacity-50">@{user.username}</div>
        </div>
        <img 
          src={user.profile_pic} 
          alt={user.username} 
          className="w-10 h-10 rounded-full border-2 border-pink-500 object-cover cursor-pointer"
          onClick={() => setActiveTab('profile')}
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
