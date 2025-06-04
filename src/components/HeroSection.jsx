import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter, FaMedium } from 'react-icons/fa';

const TechnologiesSection = () => {
  const [technologies, setTechnologies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const docRef = doc(db, 'technologies', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setTechnologies(docSnap.data());
        } else {
          console.log('Teknolojiler bulunamadı!');
        }
      } catch (error) {
        console.error('Veri getirme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechnologies();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

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
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {technologies && Object.entries(technologies).map(([category, items]) => (
        <motion.div
          key={category}
          variants={itemVariants}
          className="relative"
        >
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {category}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 pl-4">
            {items.map((tech, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 min-w-[120px]"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl flex-shrink-0">{tech.icon}</span>
                  <span className="text-gray-900 dark:text-white text-sm font-medium whitespace-nowrap">
                    {tech.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const HeroSection = () => {
  const [content, setContent] = useState(null);
  const [technologies, setTechnologies] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ana sayfa içeriğini getir
        const homeDoc = await getDoc(doc(db, 'homepage', 'main'));
        const homeData = homeDoc.data();

        // Proje sayısını getir
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectCount = projectsSnapshot.size;

        // Teknolojileri getir (SADECE technologies/main dokümanını çekiyoruz)
        const techDoc = await getDoc(doc(db, 'technologies', 'main'));
        const techData = techDoc.exists() ? techDoc.data() : {};

        setContent(homeData);
        setProjectCount(projectCount);
        // TechnologiesSection zaten bu veriyi kendi çekiyor, burada sadece sayıyı hesaplamak için tutabiliriz
        setTechnologies(techData); // Bu state teknolojileri categories objesi olarak tutacak

      } catch (error) {
        console.error('Veri getirme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toplam teknoloji sayısını hesapla
  const totalTechnologies = technologies ? Object.values(technologies).reduce((total, category) => {
    // Eğer kategori bir dizi ise uzunluğunu al, değilse 0 ekle
    return total + (Array.isArray(category) ? category.length : 0);
  }, 0) : 0; // technologies henüz yüklenmediyse toplam 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-64 bg-gray-700 rounded"></div>
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
          <div className="h-32 w-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol Taraf - İçerik */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {content?.fullName || 'İsimsiz Geliştirici'}
            </h1>
            
            <div className="text-2xl md:text-3xl text-blue-600 dark:text-blue-400">
              <Typewriter
                words={content?.title || ['Yazılım Geliştirici']}
                loop={true}
                cursor
                cursorStyle='_'
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {content?.bio || 'Kısa bir biyografi ekleyin...'}
            </p>

            {/* Sosyal Medya Linkleri */}
            <div className="flex space-x-4">
              {content?.socialLinks?.github && (
                <a href={content.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                   className="text-2xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FaGithub />
                </a>
              )}
              {content?.socialLinks?.linkedin && (
                <a href={content.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                   className="text-2xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FaLinkedin />
                </a>
              )}
              {content?.socialLinks?.email && (
                <a href={`mailto:${content.socialLinks.email}`}
                   className="text-2xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FaEnvelope />
                </a>
              )}
              {content?.socialLinks?.medium && (
                <a href={content.socialLinks.medium} target="_blank" rel="noopener noreferrer"
                   className="text-2xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FaMedium />
                </a>
              )}
            </div>

            {/* CTA Butonları */}
            <div className="flex space-x-4">
            </div>
          </motion.div>

          {/* Sağ Taraf - Profil Resmi */}
          {content?.profileImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <img
                src={content.profileImage}
                alt={content.fullName}
                className="w-64 h-64 rounded-full object-cover border-4 border-blue-600 dark:border-blue-400"
              />
            </motion.div>
          )}
        </div>

        {/* İstatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md">
            <div className="text-3xl mb-2">💼</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{content?.experience || '0'}</div>
            <div className="text-gray-600 dark:text-gray-400">Yıl Deneyim</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{projectCount}</div>
            <div className="text-gray-600 dark:text-gray-400">Projelerim</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center shadow-md">
            <div className="text-3xl mb-2">🛠️</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalTechnologies}</div>
            <div className="text-gray-600 dark:text-gray-400">Kullanılan Teknoloji</div>
          </div>
        </motion.div>

        {/* Teknolojiler */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Kullandığım Teknolojiler</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <TechnologiesSection />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection; 