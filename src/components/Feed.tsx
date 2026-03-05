import React, { useState, useEffect, FormEvent } from 'react';
import { Post, User } from '../types';
import PostCard from './PostCard';
import { Camera, Send, Star } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

interface FeedProps {
  currentUser: User;
}

export default function Feed({ currentUser }: FeedProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
    }, (error) => {
      console.error("Error fetching posts:", error);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        username: currentUser.username,
        display_name: currentUser.display_name,
        profile_pic: currentUser.profile_pic,
        image_url: newImageUrl,
        caption: newCaption,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      });
      setNewCaption('');
      setNewImageUrl('');
    } catch (error) {
      console.error("Error adding post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-8">
        {/* Retro Ad Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-xl shadow-lg">
          <div className="bg-white rounded-lg p-4 flex items-center justify-between border-2 border-dashed border-blue-200">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400 p-2 rounded-lg animate-bounce">
                <Star className="text-black" size={24} />
              </div>
              <div>
                <div className="font-black text-sm italic">UPGRADE TO SOCIALRETRO GOLD!</div>
                <div className="text-[10px] opacity-50">Get unlimited testimonials and exclusive glitter skins!</div>
              </div>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:scale-105 transition-transform">
              LEARN MORE
            </button>
          </div>
        </div>

        {/* Retro Marquee Welcome */}
        <div className="bg-yellow-400 text-black font-black py-2 overflow-hidden whitespace-nowrap border-y-2 border-black mb-8">
          <div className="animate-marquee-fast inline-block uppercase tracking-tighter">
            WELCOME TO SOCIALRETRO! • AGREGAME Y TE AGREGO • NO OLVIDES DEJAR TU FIRMA EN MI LIBRO DE VISITAS • FOTOLOG IS NOT DEAD • MSN: RETRO_USER@HOTMAIL.COM • 
          </div>
        </div>

        {/* Create Post - Retro Style */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-black/5">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="text-pink-500" />
            <h2 className="font-bold text-lg">{t('post_photo')}</h2>
          </div>
          <form onSubmit={handlePost} className="space-y-4">
            <input 
              type="url" 
              placeholder={t('image_url')} 
              className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono text-sm"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              required
            />
            <textarea 
              placeholder={t('caption_placeholder')} 
              className="w-full p-3 bg-gray-50 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all min-h-[100px] resize-none"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isPosting}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPosting ? t('posting') : <><Send size={18} /> {t('post_to_feed')}</>}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="space-y-12">
          {posts.map(post => (
            <div key={post.id}>
              <PostCard post={post} currentUser={currentUser} />
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 opacity-30 font-mono italic">
              {t('no_posts')}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Top 8 */}
      <div className="hidden lg:block space-y-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-black/5">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-yellow-500" />
            <h2 className="font-bold text-sm uppercase tracking-widest">{t('top_friends')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Emo_Kid', img: 'https://picsum.photos/seed/emo/100/100' },
              { name: 'Sk8er', img: 'https://picsum.photos/seed/sk8/100/100' },
              { name: 'Goth', img: 'https://picsum.photos/seed/goth/100/100' },
              { name: 'Cyber', img: 'https://picsum.photos/seed/cyber/100/100' },
              { name: 'Retro', img: 'https://picsum.photos/seed/retro/100/100' },
              { name: 'Punk', img: 'https://picsum.photos/seed/punk/100/100' },
              { name: 'Scene', img: 'https://picsum.photos/seed/scene/100/100' },
              { name: 'Indie', img: 'https://picsum.photos/seed/indie/100/100' }
            ].map(friend => (
              <div key={friend.name} className="flex flex-col items-center group cursor-pointer">
                <img 
                  src={friend.img} 
                  alt={friend.name} 
                  className="w-12 h-12 rounded-lg border-2 border-yellow-400 group-hover:scale-110 transition-transform object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-[8px] font-bold mt-1 truncate w-full text-center">@{friend.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-500 rounded-3xl p-6 shadow-xl text-white">
          <h3 className="font-bold text-xs uppercase mb-4">{t('messenger_status')}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-blink" />
              <span>Cool Buddy ({t('available')})</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] opacity-50">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span>Sk8er Girl ({t('offline')})</span>
            </div>
          </div>
        </div>

        {/* Retro Visitor Counter */}
        <div className="bg-black text-green-400 font-mono p-4 border-2 border-green-400 rounded shadow-[0_0_10px_rgba(74,222,128,0.5)] text-center">
          <div className="text-[8px] uppercase mb-1 opacity-50">{t('global_visitors')}</div>
          <div className="text-2xl tracking-[0.2em]">00042069</div>
        </div>
      </div>
    </div>
  );
}
