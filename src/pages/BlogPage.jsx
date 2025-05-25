import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import axios from 'axios';
import { FaExternalLinkAlt, FaUser, FaSearch, FaTags, FaSpinner } from 'react-icons/fa';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const BlogPage = () => {
  const [blogConfig, setBlogConfig] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediumUrl, setMediumUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const RSS_FEED_URL_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@';
  const API_KEY = process.env.REACT_APP_RSS2JSON_API_KEY;

  // Firebase'den blog konfigürasyonunu çek
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDocRef = doc(db, 'blog', 'main');
        const configDocSnap = await getDoc(configDocRef);

        if (configDocSnap.exists()) {
          const configData = configDocSnap.data();
          setBlogConfig(configData);

          if (configData.mediumUsername) {
            const profileUrl = `https://medium.com/@${configData.mediumUsername}`;
            setMediumUrl(profileUrl);
            await fetchPosts(configData.mediumUsername, configData.showCount);
          } else {
            setError("Firebase'de Medium kullanıcı adı tanımlanmamış.");
          }
        } else {
          setError("Firebase'de blog konfigürasyonu bulunamadı.");
        }
      } catch (err) {
        setError('Konfigürasyon getirme hatası: ' + err.message);
      }
    };

    fetchConfig();
  }, []);

  // Medium yazılarını çek
  const fetchPosts = async (username, showCount) => {
    try {
      let feedUrl = `${RSS_FEED_URL_BASE}${username}`;
      if (API_KEY) {
        feedUrl += `&api_key=${API_KEY}`;
      }

      const response = await axios.get(feedUrl);
      if (response.data.status === 'ok') {
        const sortedPosts = response.data.items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        const postsWithImages = sortedPosts.map(post => {
          let imageUrl = post.thumbnail;
          
          if (!imageUrl && post.content) {
            const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }
          
          if (!imageUrl && post.description) {
            const imgMatch = post.description.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          const tags = post.categories || [];
          
          return {
            ...post,
            thumbnail: imageUrl,
            tags,
            formattedDate: new Date(post.pubDate).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };
        });

        setPosts(postsWithImages);
        setFilteredPosts(postsWithImages.slice(0, showCount || 10));
      } else {
        setError('Medium yazılarını çekerken hata oluştu.');
      }
    } catch (err) {
      setError('Yazıları getirme hatası: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Arama filtreleme
  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      let filtered = [...posts];
      
      if (searchQuery) {
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredPosts(filtered.slice(0, blogConfig?.showCount || 10));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, posts, blogConfig?.showCount]);

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
            </div>
            
            {/* Search Skeleton */}
            <div className="max-w-md mx-auto">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            
            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-600 dark:text-red-400 max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-4">Hata Oluştu</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      {blogConfig?.heroImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 md:h-96 w-full"
        >
          <img 
            src={blogConfig.heroImage} 
            alt="Blog Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-white px-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {blogConfig?.heading || 'Blog'}
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto">
                {blogConfig?.description || 'En son yazılarımı buradan okuyabilirsiniz.'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section (if no hero image) */}
        {!blogConfig?.heroImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 space-y-4"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {blogConfig?.heading || 'Blog'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {blogConfig?.description || 'En son yazılarımı buradan okuyabilirsiniz.'}
            </p>
            {blogConfig?.showProfile && mediumUrl && (
              <motion.a 
                href={mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaUser /> Medium Profilim
              </motion.a>
            )}
          </motion.div>
        )}

        {/* Search Section */}
        {blogConfig?.enableSearch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 space-y-4"
          >
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Yazılarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              {isSearching && (
                <FaSpinner className="absolute right-3 top-3 text-gray-400 animate-spin" />
              )}
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.guid || index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300"
              >
                <div className="relative w-full h-48 group">
                  {post.thumbnail ? (
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
                      }}
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                      alt="Varsayılan Blog Resmi"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex-grow line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.description ? post.description.replace(/<[^>]*>?/gm, '') : 
                     (post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : 'Açıklama yok.')
                    }
                  </p>
                  
                  {blogConfig?.showTags && post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.formattedDate}
                    </span>
                    <motion.a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Daha Fazla Oku <FaExternalLinkAlt className="text-xs"/>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results Message */}
        {filteredPosts.length === 0 && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 dark:text-gray-300 mt-12 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <p className="text-lg">Aramanızla eşleşen yazı bulunamadı.</p>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </motion.div>
        )}

        {/* View All Posts Button */}
        {mediumUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: filteredPosts.length * 0.1 }}
            className="text-center mt-12"
          >
            <motion.a
              href={mediumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tüm Yazıları Medium'da Gör
            </motion.a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage; 