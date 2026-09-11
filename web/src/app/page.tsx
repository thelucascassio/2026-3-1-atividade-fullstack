'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Star, MessageSquare, Send, Search, User, Home as HomeIcon, Globe, FileText, BarChart2, Plus, LogOut, X } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string };
  comments: { id: string; content: string; author: { username: string } }[];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [ratingOpenPostId, setRatingOpenPostId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('diatinf_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchPosts();
  }, []);

  const fetchPosts = async (search = '') => {
    try {
      const response = await api.get('/posts', { params: { search } });
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

  // Quem o usuário mais comenta
  const getWhoICommentMost = () => {
    if (!user || !posts.length) return [];
    const counts: { [username: string]: number } = {};

    posts.forEach(post => {
      post.comments?.forEach(comment => {
        if (comment.author?.username === user.username) {
          const postAuthor = post.author?.username;
          if (postAuthor && postAuthor !== user.username) {
            counts[postAuthor] = (counts[postAuthor] || 0) + 1;
          }
        }
      });
    });

    return Object.entries(counts)
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Quem mais comenta nos posts do usuário
  const getWhoCommentsMeMost = () => {
    if (!user || !posts.length) return [];
    const counts: { [username: string]: number } = {};

    const myPosts = posts.filter(p => p.author?.username === user.username);
    myPosts.forEach(post => {
      post.comments?.forEach(comment => {
        const commenter = comment.author?.username;
        if (commenter && commenter !== user.username) {
          counts[commenter] = (counts[commenter] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count);
  };

  const whoICommentMost = getWhoICommentMost();
  const whoCommentsMeMost = getWhoCommentsMeMost();

  const filteredPosts = activeTab === 'my-posts' 
    ? posts.filter(p => p.author.username === user?.username)
    : posts;

  return (
    <div className="min-h-screen bg-diatinf-dark text-slate-800 flex flex-col font-sans">
      
      {/* CABEÇALHO */}
      <header className="bg-diatinf-dark text-white px-4 md:px-8 py-3 flex items-center justify-between border-b border-slate-700 sticky top-0 z-30">
        <h1 className="text-2xl md:text-3xl font-extrabold text-diatinf-accent tracking-wide">DIATINF X</h1>

        {/* Busca Central no Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Pesquisar publicações..."
            className="w-full px-4 py-1.5 rounded-l-md bg-white text-slate-800 text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchPosts(e.target.value);
            }}
          />
          <button className="bg-diatinf-secondary text-white px-4 py-1.5 rounded-r-md hover:bg-diatinf-primary">
            <Search size={18} />
          </button>
        </div>

        {/* Perfil / Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-diatinf-accent text-diatinf-dark font-bold px-3 py-1.5 rounded-xl text-sm">
              <div className="w-6 h-6 rounded-full bg-diatinf-dark text-white flex items-center justify-center text-xs">
                {user.username[0].toUpperCase()}
              </div>
              <span>{user.username}</span>
              <button onClick={() => { localStorage.removeItem('diatinf_user'); setUser(null); }} className="ml-2 text-diatinf-dark hover:text-red-700">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="bg-diatinf-accent text-diatinf-dark font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-yellow-400">
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (GRID RESPONSIVO) */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 p-2 md:p-6 pb-20 md:pb-6">
        
        {/* COLUNA ESQUERDA - NAVEGAÇÃO DESKTOP */}
        <aside className="hidden md:flex md:col-span-3 flex-col gap-3">
          {user && (
            <>
              <button
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="bg-diatinf-secondary text-white font-bold py-2.5 px-4 rounded-md shadow hover:bg-diatinf-primary flex items-center justify-center gap-2"
              >
                <Plus size={18} /> [NOVO POST]
              </button>
              <button
                onClick={() => setActiveTab(activeTab === 'feed' ? 'my-posts' : 'feed')}
                className="bg-diatinf-secondary text-white font-bold py-2.5 px-4 rounded-md shadow hover:bg-diatinf-primary flex items-center justify-center gap-2"
              >
                <FileText size={18} /> {activeTab === 'feed' ? '[MEUS POSTS]' : '[FEED GLOBAL]'}
              </button>
            </>
          )}
        </aside>

        {/* COLUNA CENTRAL - FEED */}
        <main className="col-span-1 md:col-span-6 bg-diatinf-light rounded-lg p-4 min-h-[80vh] shadow-lg">
          <h2 className="text-xl font-bold text-diatinf-dark mb-4 border-b border-diatinf-gray/30 pb-2">
            {activeTab === 'feed' ? 'Feed Global' : activeTab === 'my-posts' ? 'Meus Posts' : 'Estatísticas Sociais'}
          </h2>

          {/* Busca Mobile */}
          <div className="md:hidden flex mb-4">
            <input
              type="text"
              placeholder="Pesquisar publicações..."
              className="w-full px-3 py-1.5 rounded-l-md bg-white border border-slate-300 text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchPosts(e.target.value);
              }}
            />
            <button className="bg-diatinf-secondary text-white px-3 py-1.5 rounded-r-md">
              <Search size={16} />
            </button>
          </div>

          {/* Formulário Novo Post */}
          {showNewPostForm && user && (
            <form onSubmit={handleCreatePost} className="bg-white p-3 rounded-md border border-slate-300 mb-4 shadow-sm">
              <textarea
                placeholder="O que está acontecendo?"
                className="w-full p-2 text-sm border rounded resize-none outline-none focus:border-diatinf-primary"
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPostForm(false);
                    setNewPostContent('');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-diatinf-primary text-white font-bold px-4 py-1.5 rounded text-xs hover:bg-diatinf-secondary">
                  Publicar
                </button>
              </div>
            </form>
          )}

          {activeTab === 'stats' ? (
            /* VISUALIZAÇÃO DE STATS NO MOBILE */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                <h3 className="font-bold text-diatinf-dark text-sm mb-2 border-b pb-1">Quem você mais comenta</h3>
                {!user ? (
                  <p className="text-xs text-slate-500 italic">Faça login para visualizar.</p>
                ) : whoICommentMost.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Você ainda não comentou em nenhuma publicação.</p>
                ) : (
                  <ul className="text-xs space-y-2 text-slate-700">
                    {whoICommentMost.map(item => (
                      <li key={item.username} className="flex justify-between items-center">
                        <span>{item.username}</span>
                        <span className="font-bold bg-slate-100 px-2 py-0.5 rounded border">💬 {item.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                <h3 className="font-bold text-diatinf-dark text-sm mb-2 border-b pb-1">Quem mais te comenta</h3>
                {!user ? (
                  <p className="text-xs text-slate-500 italic">Faça login para visualizar.</p>
                ) : whoCommentsMeMost.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aguarde alguém comentar nas suas publicações.</p>
                ) : (
                  <ul className="text-xs space-y-2 text-slate-700">
                    {whoCommentsMeMost.map(item => (
                      <li key={item.username} className="flex justify-between items-center">
                        <span>{item.username}</span>
                        <span className="font-bold bg-slate-100 px-2 py-0.5 rounded border">💬 {item.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            /* LISTA DE POSTS DO FEED */
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const avgRating = calculateAvgRating(post.ratings);
                return (
                  <article key={post.id} className="bg-white rounded-md p-4 shadow border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-sm text-slate-700">
                        {post.author.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{post.author.username}</h3>
                        <p className="text-xs text-slate-400">@{post.author.username}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 my-3 leading-relaxed">{post.content}</p>

                    {/* Ações e Avaliação */}
                    <div className="flex flex-wrap items-center gap-3 border-t pt-2 my-2 text-xs relative">
                      <span className="text-slate-600 flex items-center gap-1 font-medium">
                        <MessageSquare size={14} /> Comentar ({post.comments?.length || 0})
                      </span>

                      <div className="flex items-center gap-1 ml-auto relative">
                        <button
                          onClick={() => setRatingOpenPostId(ratingOpenPostId === post.id ? null : post.id)}
                          className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold hover:bg-diatinf-accent flex items-center gap-1"
                        >
                          <Star size={14} className="text-yellow-500 fill-yellow-500" /> ({avgRating} ★)
                        </button>

                        {/* Avaliação 1-3 Estrelas */}
                        {ratingOpenPostId === post.id && (
                          <div className="absolute right-0 bottom-8 bg-white border-2 border-diatinf-primary p-1.5 rounded-lg shadow-xl flex gap-1 z-10">
                            {[1, 2, 3].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRate(post.id, star)}
                                className="px-2 py-1 bg-slate-100 hover:bg-diatinf-accent rounded font-bold text-xs flex items-center gap-0.5"
                              >
                                {star} <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comentários Exibidos */}
                    {post.comments?.length > 0 && (
                      <div className="bg-slate-50 p-2 rounded space-y-1 my-2">
                        {post.comments.map((c: any) => (
                          <p key={c.id} className="text-xs text-slate-700">
                            <span className="font-bold text-diatinf-dark">@{c.author.username}:</span> {c.content}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Input de Comentário */}
                    <div className="flex items-center gap-1 mt-2">
                      <input
                        type="text"
                        placeholder="Escreva um comentário..."
                        className="flex-1 text-xs p-1.5 border border-slate-300 rounded outline-none focus:border-diatinf-primary"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="bg-diatinf-dark text-white p-1.5 rounded text-xs font-bold flex items-center gap-1"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* COLUNA DIREITA - STATS SOCIAIS DESKTOP */}
        <aside className="hidden md:flex md:col-span-3 flex-col gap-4 bg-diatinf-light rounded-lg p-4 shadow-lg h-fit">
          <div>
            <h3 className="font-bold text-diatinf-dark text-sm mb-2 border-b border-diatinf-gray/30 pb-1">
              Quem você mais comenta
            </h3>
            {!user ? (
              <p className="text-xs text-slate-500 italic">Faça login para ver.</p>
            ) : whoICommentMost.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Você ainda não comentou em ninguém.</p>
            ) : (
              <ul className="text-xs space-y-2 text-slate-700">
                {whoICommentMost.map(item => (
                  <li key={item.username} className="flex justify-between items-center">
                    <span>{item.username}</span>
                    <span className="font-bold bg-white px-2 py-0.5 rounded border">💬 {item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-bold text-diatinf-dark text-sm mb-2 border-b border-diatinf-gray/30 pb-1">
              Quem mais te comenta
            </h3>
            {!user ? (
              <p className="text-xs text-slate-500 italic">Faça login para ver.</p>
            ) : whoCommentsMeMost.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Aguarde alguém comentar nos seus posts.</p>
            ) : (
              <ul className="text-xs space-y-2 text-slate-700">
                {whoCommentsMeMost.map(item => (
                  <li key={item.username} className="flex justify-between items-center">
                    <span>{item.username}</span>
                    <span className="font-bold bg-white px-2 py-0.5 rounded border">💬 {item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

      </div>

      {/* BOTÃO FLUTUANTE DE NOVO POST (MOBILE) */}
      {user && (
        <button
          onClick={() => {
            setShowNewPostForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="md:hidden fixed bottom-16 right-4 bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-full shadow-2xl z-40 flex items-center justify-center transition-transform active:scale-95"
          title="Nova Publicação"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      )}

      {/* NAVEGAÇÃO INFERIOR MOBILE (APENAS 3 ABAS) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-diatinf-dark text-white border-t border-diatinf-primary flex justify-around py-2 z-30">
        <button 
          onClick={() => setActiveTab('feed')} 
          className={`flex flex-col items-center text-[10px] ${activeTab === 'feed' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
        >
          <Globe size={18} /> Global Feed
        </button>
        <button 
          onClick={() => setActiveTab('my-posts')} 
          className={`flex flex-col items-center text-[10px] ${activeTab === 'my-posts' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
        >
          <FileText size={18} /> Meus Posts
        </button>
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`flex flex-col items-center text-[10px] ${activeTab === 'stats' ? 'text-diatinf-accent font-bold' : 'text-diatinf-gray'}`}
        >
          <BarChart2 size={18} /> Social Stats
        </button>
      </nav>

      {/* MODAL DE LOGIN / CADASTRO */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 shadow-2xl border-2 border-diatinf-primary">
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

    </div>
  );
}