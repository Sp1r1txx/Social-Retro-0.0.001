import React, { useState, useEffect, FormEvent } from 'react';
import { User, Testimonial, Gift } from '../types';
import { Settings, Palette, User as UserIcon, Save, Star, Gift as GiftIcon, Music as MusicIcon } from 'lucide-react';
import MusicPlayer from './MusicPlayer';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function Profile({ user, onUpdate }: ProfileProps) {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(user.display_name);
  const [bio, setBio] = useState(user.bio);
  const [bgColor, setBgColor] = useState(user.custom_bg);
  const [textColor, setTextColor] = useState(user.custom_color);
  const [mood, setMood] = useState(t('feeling_retro'));
  const [isSaving, setIsSaving] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [newTestimonial, setNewTestimonial] = useState('');

  useEffect(() => {
    // Listen to testimonials for this user
    const q = query(collection(db, 'users', user.uid, 'testimonials'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const testimonialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setTestimonials(testimonialsData as Testimonial[]);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        display_name: displayName,
        bio: bio,
        custom_bg: bgColor,
        custom_color: textColor
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const submitTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTestimonial) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'testimonials'), {
        uid: user.uid,
        author_id: user.uid, // Self-testimonial for demo
        username: user.username,
        display_name: user.display_name,
        profile_pic: user.profile_pic,
        content: newTestimonial,
        created_at: new Date().toISOString()
      });
      setNewTestimonial('');
    } catch (error) {
      console.error("Error adding testimonial:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-black/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-20" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 pt-8">
          <div className="relative group">
            <img 
              src={user.profile_pic} 
              alt={user.username} 
              className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Settings className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight">{user.display_name}</h1>
            <p className="text-gray-500 font-mono">@{user.username}</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase text-pink-500">
              <span className="animate-blink">●</span> {t('mood')}: {mood}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-black/5 italic opacity-80 relative">
              <span className="absolute -top-2 -left-2 text-4xl text-pink-500 opacity-20">"</span>
              {user.bio}
              <span className="absolute -bottom-6 -right-2 text-4xl text-pink-500 opacity-20">"</span>
            </div>
            
            <div className="mt-6 bg-black/5 p-4 rounded-2xl border border-black/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <MusicIcon size={12} /> {t('profile_song')}
              </h3>
              <ul className="text-xs space-y-2 font-mono">
                <li>1. Welcome to the Black Parade</li>
                <li>2. Helena (So Long & Goodnight)</li>
                <li>3. I'm Not Okay (I Promise)</li>
                <li>4. Sugar, We're Goin Down</li>
                <li>5. Misery Business</li>
              </ul>
            </div>

            <div className="mt-6 bg-black/5 p-4 rounded-2xl border border-black/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Star size={12} className="text-yellow-500" /> {t('interests')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Skating', 'Anime', 'Coding', 'Photography', 'Music'].map(interest => (
                  <span key={interest} className="bg-white px-3 py-1 rounded-full text-[10px] font-bold border border-black/5 shadow-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customization */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 mb-8">
              <Palette className="text-purple-500" />
              <h2 className="font-bold text-xl uppercase tracking-widest">{t('customization')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('display_name')}</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('bio_status')}</label>
                  <textarea 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('current_mood')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  >
                    <option>{t('feeling_retro')}</option>
                    <option>{t('emo_hours')}</option>
                    <option>{t('too_cool')}</option>
                    <option>{t('sleepy')}</option>
                    <option>{t('gaming')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('online_status')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>{t('available')}</option>
                    <option>{t('busy')}</option>
                    <option>{t('away')}</option>
                    <option>{t('offline')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('profile_song')}</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-xs"
                    placeholder="Artist - Song Name"
                    defaultValue="My Chemical Romance - Welcome to the Black Parade"
                  />
                  <p className="text-[8px] mt-1 opacity-50 uppercase font-bold text-pink-500 animate-blink">Only Emo anthems allowed!</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('bg_color')}</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-none"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                    <span className="font-mono text-sm uppercase">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('text_color')}</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-none"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                    <span className="font-mono text-sm uppercase">{textColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('bg_pattern')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">None</option>
                    <option value="pattern-stars">Stars</option>
                    <option value="pattern-hearts">Hearts</option>
                    <option value="pattern-grid">Grid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('profile_layout')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>Classic Hi5</option>
                    <option>Fotolog Minimal</option>
                    <option>Messenger Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('music_skin')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>Classic Green</option>
                    <option>Cyber Blue</option>
                    <option>Hot Pink</option>
                    <option>Dark Mode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('custom_cursor')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>Pixel Sword</option>
                    <option>Sparkle Wand</option>
                    <option>Classic Windows</option>
                    <option>Animated Heart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">{t('profile_font')}</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option>JetBrains Mono</option>
                    <option>Comic Sans MS</option>
                    <option>Courier New</option>
                    <option>Impact</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-10 bg-purple-500 text-white font-bold py-4 rounded-2xl hover:bg-purple-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? t('saving') : <><Save size={20} /> {t('save_settings')}</>}
            </button>
          </div>

          {/* Testimonials - Guestbook style */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 mb-8">
              <Star className="text-yellow-500" />
              <h2 className="font-bold text-xl uppercase tracking-widest">{t('testimonials')}</h2>
            </div>

            <form onSubmit={submitTestimonial} className="mb-8">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={t('leave_testimonial')} 
                  className="flex-1 p-3 bg-gray-50 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newTestimonial}
                  onChange={(e) => setNewTestimonial(e.target.value)}
                />
                <button type="submit" className="bg-yellow-500 text-white px-6 rounded-xl font-bold hover:bg-yellow-600 transition-colors">
                  {t('post')}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {testimonials.map(t => (
                <div key={t.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-black/5">
                  <img src={t.profile_pic} alt={t.username} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-bold text-sm">@{t.username}</div>
                    <p className="text-sm opacity-80 mt-1">{t.content}</p>
                    <div className="text-[10px] opacity-30 mt-2 uppercase">{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && <p className="text-center opacity-30 italic">{t('no_testimonials')}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Gifts & Stats */}
        <div className="space-y-8">
          {/* Gifts Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 mb-6">
              <GiftIcon className="text-pink-500" />
              <h2 className="font-bold text-lg uppercase tracking-widest">{t('virtual_gifts')}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {gifts.map(g => (
                <div key={g.id} className="bg-pink-50 p-4 rounded-2xl text-center border border-pink-100">
                  <div className="text-3xl mb-2">{g.gift_type === 'heart' ? '❤️' : g.gift_type === 'star' ? '⭐' : '🎁'}</div>
                  <div className="text-[10px] font-bold uppercase text-pink-500">From @{g.username}</div>
                </div>
              ))}
              {gifts.length === 0 && (
                <div className="col-span-2 py-8 text-center opacity-30 italic text-sm">
                  No gifts received yet...
                </div>
              )}
            </div>
            
            <button className="w-full mt-6 py-2 border-2 border-dashed border-pink-200 rounded-xl text-pink-400 text-xs font-bold hover:bg-pink-50 transition-colors">
              + {t('send_gift')}
            </button>
          </div>

          {/* Retro Stats */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-black/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">{t('weekly_views')}</h3>
              <div className="flex items-end justify-between h-20 gap-1">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-pink-500/20 rounded-t-sm relative group"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-0 bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] font-mono opacity-30 uppercase">
                <span>Mon</span>
                <span>Sun</span>
              </div>
            </div>

            {[
              { label: t('friend_requests'), value: '12', color: 'text-blue-500' },
              { label: t('new_comments'), value: '5', color: 'text-purple-500' }
            ].map(stat => (
              <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-xl border border-black/5 flex items-center justify-between">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-40">{stat.label}</div>
                <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Top 5 Friends - Hi5 Classic */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-500" />
              <h2 className="font-bold text-lg uppercase tracking-widest">{t('top_friends')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Emo_Kid_2005', img: 'https://picsum.photos/seed/emo/100/100' },
                { name: 'Sk8er_Girl', img: 'https://picsum.photos/seed/sk8/100/100' },
                { name: 'Goth_Princess', img: 'https://picsum.photos/seed/goth/100/100' },
                { name: 'Cyber_Punk', img: 'https://picsum.photos/seed/cyber/100/100' },
                { name: 'Retro_Lover', img: 'https://picsum.photos/seed/retro/100/100' }
              ].map(friend => (
                <div key={friend.name} className="flex flex-col items-center group cursor-pointer">
                  <div className="relative">
                    <img 
                      src={friend.img} 
                      alt={friend.name} 
                      className="w-16 h-16 rounded-full border-2 border-yellow-400 group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-[8px] font-bold px-1 rounded">TOP</div>
                  </div>
                  <div className="text-[10px] font-bold mt-2 truncate w-full text-center">@{friend.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retro Visitor Counter */}
      <div className="flex justify-center">
        <div className="bg-black text-green-400 font-mono p-2 border-2 border-green-400 rounded shadow-[0_0_10px_rgba(74,222,128,0.5)]">
          <span className="text-[10px] uppercase mr-2">{t('visitors')}:</span>
          <span className="text-xl tracking-widest">00001337</span>
        </div>
      </div>
    </div>
  );
}
