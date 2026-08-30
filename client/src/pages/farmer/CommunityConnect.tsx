import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Users,
  MessageCircle,
  ThumbsUp,
  Share2,
  Plus,
  Pin,
  Flag,
  Send,
  Sparkles,
  Tag,
  Clock,
} from 'lucide-react';

export const CommunityConnect: React.FC = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    category: 'FARMING_TIPS',
    title: '',
    content: '',
    imageUrl: '',
  });
  const [creating, setCreating] = useState(false);

  // Active commenting
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;

      const res = await api.get('/community/posts', { params });
      if (res.data?.data) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch community posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/community/posts', newPost);
      if (res.data?.data) {
        setPosts([res.data.data, ...posts]);
        setShowCreateModal(false);
        setNewPost({ category: 'FARMING_TIPS', title: '', content: '', imageUrl: '' });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      const isLiked = res.data?.data?.liked;
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1) }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/community/posts/${postId}/comments`, { content: commentText.trim() });
      if (res.data?.data) {
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  commentsCount: p.commentsCount + 1,
                  comments: [...(p.comments || []), res.data.data],
                }
              : p
          )
        );
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleReport = async (postId: string) => {
    const reason = prompt('Please specify the reason for reporting this post:');
    if (!reason) return;
    try {
      await api.post(`/community/posts/${postId}/report`, { reason });
      alert('Post reported to admin moderation team.');
    } catch (err) {
      console.error('Failed to report post', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              {language === 'ta' ? 'விவசாயிகள் சமூகம்' : 'Farmer Community Connect'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'விவசாயிகள் மன்றம் & அனுபவ பகிர்வு' : 'Farmer Community Feed & Discussions'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'பூச்சி மேலாண்மை குறிப்புகள், விவசாய வெற்றிக் கதைகள் மற்றும் மண்டி அனுபவங்களை சக விவசாயிகளுடன் பகிர்ந்துகொள்ளுங்கள்.'
                : 'Ask questions, share organic recipes, report local pest alerts, and learn from progressive farmers and university scientists.'}
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl transition shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {language === 'ta' ? '+ புதிய பதிவு' : '+ Create Post'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'ALL', label: 'All Discussions' },
            { id: 'FARMING_TIPS', label: '💡 Organic & Farming Tips' },
            { id: 'PEST_ALERT', label: '🐛 Pest & Disease Alerts' },
            { id: 'MARKET_DISCUSSION', label: '📈 Mandi & Price Discussion' },
            { id: 'SUCCESS_STORY', label: '🏆 Success Stories' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition ${
                categoryFilter === tab.id
                  ? 'bg-emerald-700 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Stream */}
        <div className="space-y-6">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm">Loading community discussions...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
              No discussions in this category yet. Be the first to share!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-3xl p-6 border transition space-y-4 shadow-sm ${
                  post.isPinned ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                {/* Post Author Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                      alt={post.author?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{post.author?.name}</strong>
                        {post.author?.role === 'EXPERT' && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                            Verified Scientist
                          </span>
                        )}
                        {post.isPinned && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()} • {post.category}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleReport(post.id)} className="text-slate-400 hover:text-rose-500 p-1">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-72 border border-slate-100 bg-slate-50">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Actions & Comment Count */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 font-semibold transition text-slate-700"
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span>{post.likesCount || 0} Likes</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 font-semibold transition text-slate-700"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>{post.commentsCount || 0} Comments</span>
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {/* Existing comments */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(post.comments || []).map((c: any) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <strong className="text-slate-900">{c.author?.name}</strong>
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-700">{c.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Share with Farmer Community</h3>
                  <p className="text-xs text-slate-500">Post tips, questions, or crop updates</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FARMING_TIPS">💡 Farming & Organic Tips</option>
                    <option value="PEST_ALERT">🐛 Pest / Disease Alert</option>
                    <option value="MARKET_DISCUSSION">📈 Mandi Prices & Market Discussion</option>
                    <option value="SUCCESS_STORY">🏆 Success Story</option>
                    <option value="QUESTION">❓ Question for Scientists & Farmers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Post Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Natural method to prevent tomato leaf curl virus"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Post Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your practical experience, dosage, or question in detail..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                >
                  {creating ? 'Publishing...' : 'Publish to Community'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CommunityConnect;
