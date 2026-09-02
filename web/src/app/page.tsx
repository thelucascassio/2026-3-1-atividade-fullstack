'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Star, MessageSquare, Send, Search, User, Home as HomeIcon, Globe, FileText, BarChart2, Plus, LogOut } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string };
  comments: any[];
  ratings: { userId: string; stars: number }[];
}

export default function Home() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posts' | 'stats'>('feed');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [ratingOpenPostId, setRatingOpenPostId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('diatinf_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Erro ao buscar posts', err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/users/register' : '/users/login';
    try {
      const response = await api.post(endpoint, { username: usernameInput, password: passwordInput });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('diatinf_user', JSON.stringify(userData));
      setIsAuthOpen(false);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha na autenticação');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostContent.trim()) return;
    try {
      await api.post('/posts', { content: newPostContent, authorId: user.id });
      setNewPostContent('');
      setShowNewPostForm(false);
      fetchPosts();
    } catch (err) {
      alert('Erro ao criar publicação');
    }
  };

  const handleRate = async (postId: string, stars: number) => {
    if (!user) return setIsAuthOpen(true);
    try {
      await api.post(`/posts/${postId}/rate`, { userId: user.id, stars });
      setRatingOpenPostId(null);
      fetchPosts();
    } catch (err) {
      alert('Erro ao avaliar');
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) return setIsAuthOpen(true);
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    try {
      await api.post(`/posts/${postId}/comments`, { content, authorId: user.id });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (err) {
      alert('Erro ao comentar');
    }
  };

  const calculateAvgRating = (ratings: any[]) => {
    if (!ratings || ratings.length === 0) return '0.0';
    const sum = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const filteredPosts = activeTab === 'my-posts' 
    ? posts.filter(p => p.author.username === user?.username)
    : posts;

  return (
    <div className="flex justify-center bg-slate-900 min-h-screen">
      {/* Moldura do Dispositivo Mobile */}
      <div className="w-full max-w-md bg-diatinf-light min-h-screen flex flex-col justify-between shadow-2xl relative pb-16">
        
        {/* Top Header estilo Mockup */}
        <header className="bg-diatinf-dark text-white p-3 flex justify-between items-center sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-diatinf-secondary flex items-center justify-center font-bold text-xs text-white">
              {user ? user.username[0].toUpperCase() : <User size={16} />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-diatinf-accent leading-none">Diatinf X</h1>
              <p className="text-[10px] text-diatinf-gray">
                {user ? `@${user.username}` : 'Visitante'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button onClick={() => setShowNewPostForm(!showNewPostForm)} className="bg-diatinf-primary p-1.5 rounded-md text-white">
                  <Plus size={18} />
                </button>
                <button onClick={() => { localStorage.removeItem('diatinf_user'); setUser(null); }} className="text-diatinf-gray p-1">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="bg-diatinf-primary px-3 py-1 text-xs font-bold rounded text-white">
                Entrar
              </button>
            )}
          </div>
        </header>

        {/* Modal/Formulário de Autenticação */}
        {isAuthOpen && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div className="bg-white w-full rounded-xl p-5 shadow-2xl border-2 border-diatinf-primary">
              <h2 className="text-lg font-bold text-diatinf-dark mb-3">
                {isRegistering ? 'Criar Conta' : 'Acessar Diatinf X'}
              </h2>
              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-diatinf-primary"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-diatinf-primary"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
                <button type="submit" className="bg-diatinf-primary text-white font-bold py-2 rounded text-sm hover:bg-diatinf-secondary">
                  {isRegistering ? 'Cadastrar' : 'Entrar'}
                </button>
              </form>
              <div className="flex justify-between items-center mt-3 text-xs">
                <button onClick={() => setIsRegistering(!isRegistering)} className="text-diatinf-primary underline">
                  {isRegistering ? 'Já tem conta? Entre' : 'Criar nova conta'}
                </button>
                <button onClick={() => setIsAuthOpen(false)} className="text-gray-500">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <main className="p-3 flex-1 overflow-y-auto">
          {/* Formulário Novo Post Expandível */}
          {showNewPostForm && user && (
            <form onSubmit={handleCreatePost} className="bg-white p-3 rounded-lg border-2 border-diatinf-primary mb-4 shadow">
              <textarea
                placeholder="O que está acontecendo?"
                className="w-full p-2 text-sm border rounded resize-none outline-none"
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowNewPostForm(false)} className="px-3 py-1 text-xs text-gray-500">Cancelar</button>
                <button type="submit" className="bg-diatinf-primary text-white font-bold px-4 py-1 rounded text-xs">Publicar</button>
              </div>
            </form>
          )}

          {activeTab === 'stats' ? (
            <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
              <h2 className="font-bold text-diatinf-dark mb-3 text-center border-b pb-2">Social Stats</h2>
              <div className="text-xs text-gray-600 space-y-2">
                <p className="font-semibold text-diatinf-primary">Métricas do App:</p>
                <div className="flex justify-between bg-slate-50 p-2 rounded">
                  <span>Total de Publicações:</span>
                  <span className="font-bold">{posts.length}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="font-bold text-diatinf-dark text-base">
                {activeTab === 'feed' ? 'Feed Global' : 'Meus Posts'}
              </h2>

              {filteredPosts.map((post) => {
                const avgRating = calculateAvgRating(post.ratings);
                return (
                  <article key={post.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-diatinf-dark text-white flex items-center justify-center font-bold text-xs">
                        {post.author.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-diatinf-dark">{post.author.username}</h3>
                        <p className="text-[10px] text-gray-400">@{post.author.username}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 my-2 leading-relaxed">{post.content}</p>

                    {/* Botões de Ação estilo Mockup */}
                    <div className="flex items-center justify-between gap-2 border-t pt-2 my-2 relative">
                      <button className="bg-diatinf-dark text-white px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1">
                        <MessageSquare size={12} /> Comentar ({post.comments?.length || 0})
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setRatingOpenPostId(ratingOpenPostId === post.id ? null : post.id)}
                          className="bg-slate-100 text-diatinf-dark border px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1"
                        >
                          <Star size={12} className="text-diatinf-accent fill-diatinf-accent" /> Avaliar ({avgRating} ★)
                        </button>

                        {/* Popup de Seleção 1-3 Estrelas */}
                        {ratingOpenPostId === post.id && (
                          <div className="absolute right-0 bottom-8 bg-white border-2 border-diatinf-primary p-2 rounded-lg shadow-xl flex gap-2 z-10">
                            {[1, 2, 3].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRate(post.id, star)}
                                className="p-1 hover:scale-125 transition-transform"
                              >
                                <Star size={20} className="text-diatinf-accent fill-diatinf-accent" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comentários Exibidos */}
                    {post.comments?.length > 0 && (
                      <div className="bg-slate-50 p-2 rounded-md space-y-1 mb-2">
                        {post.comments.map((c: any) => (
                          <p key={c.id} className="text-[11px] text-slate-700">
                            <span className="font-bold text-diatinf-dark">@{c.author.username}:</span> {c.content}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Campo de Comentário */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Escreva um comentário..."
                        className="flex-1 text-[11px] p-1.5 border border-slate-300 rounded-md outline-none focus:border-diatinf-primary bg-white"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="bg-diatinf-dark text-white p-1.5 rounded-md text-xs font-bold flex items-center gap-1"
                      >
                        Publicar <Send size={10} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar estilo Mockup DIATINF */}
        <nav className="bg-diatinf-dark text-white border-t border-diatinf-primary fixed bottom-0 w-full max-w-md flex justify-around items-center py-2 z-20">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'feed' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
          >
            <HomeIcon size={18} /> Home
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'feed' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
          >
            <Globe size={18} /> Global Feed
          </button>
          <button
            onClick={() => {
              if (!user) return setIsAuthOpen(true);
              setActiveTab('my-posts');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'my-posts' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
          >
            <FileText size={18} /> Meus Posts
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'stats' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
          >
            <BarChart2 size={18} /> Social Stats
          </button>
        </nav>
      </div>
    </div>
  );
}