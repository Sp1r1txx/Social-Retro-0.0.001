import React, { useState, useEffect, FormEvent } from 'react';
import { Post, User, Comment } from '../types';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

interface PostCardProps {
  post: Post;
  currentUser: User;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const { t } = useLanguage();
  const [likes, setLikes] = useState(post.likes_count);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('created_at', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleLike = async () => {
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        likes_count: increment(1)
      });
      setLikes(prev => prev + 1);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment) return;

    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        post_id: post.id,
        uid: currentUser.uid,
        username: currentUser.username,
        display_name: currentUser.display_name,
        profile_pic: currentUser.profile_pic,
        content: newComment,
        created_at: new Date().toISOString()
      });
      
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        comments_count: increment(1)
      });
      
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/5 group"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.profile_pic} 
            alt={post.username} 
            className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="font-bold text-sm">{post.display_name}</div>
            <div className="text-xs opacity-50">@{post.username} • {new Date(post.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image - Fotolog Style */}
      <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
        <img 
          src={post.image_url} 
          alt="Post content" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Actions */}
      <div className="p-6">
        <div className="flex items-center gap-6 mb-4">
          <button 
            onClick={handleLike}
            className="flex items-center gap-2 hover:scale-110 transition-transform text-pink-500 font-bold"
          >
            <Heart size={24} fill={likes > post.likes_count ? "currentColor" : "none"} />
            <span>{likes}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:scale-110 transition-transform text-blue-500 font-bold"
          >
            <MessageCircle size={24} />
            <span>{comments.length || post.comments_count}</span>
          </button>
        </div>

        {/* Caption */}
        <div className="mb-6">
          <p className="text-gray-800 leading-relaxed">
            <span className="font-bold mr-2">@{post.username}</span>
            {post.caption}
          </p>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 border-t border-black/5 pt-4">
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img 
                    src={comment.profile_pic} 
                    alt={comment.username} 
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-gray-50 rounded-2xl p-3 flex-1 text-sm">
                    <span className="font-bold mr-2">@{comment.username}</span>
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('write_comment')} 
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
