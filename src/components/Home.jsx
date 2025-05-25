import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TypeAnimation } from 'react-type-animation';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const Home = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'homeContent'));
        const data = querySnapshot.docs[0].data();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-700 rounded"></div>
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
          <div className="h-24 w-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          <TypeAnimation
            sequence={[
              'Merhaba, ben Furkan Taşan',
              1000,
            ]}
            wrapper="span"
            speed={50}
            repeat={0}
          />
        </motion.h1>

        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 mb-8"
        >
          Yazılım Mühendisi & QA Test Otomasyon Uzmanı
        </motion.h2>

        <motion.p
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          {content?.bio}
        </motion.p>

        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <a
            href="/about"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            Hakkımda
          </a>
          <a
            href="/projects"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            Projelerim
          </a>
        </motion.div>

        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-6"
        >
          {content?.socialLinks?.linkedin && (
            <a
              href={content.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-blue-400 transition-colors"
            >
              <FaLinkedin />
            </a>
          )}
          {content?.socialLinks?.github && (
            <a
              href={content.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-gray-400 transition-colors"
            >
              <FaGithub />
            </a>
          )}
          {content?.socialLinks?.email && (
            <a
              href={`mailto:${content.socialLinks.email}`}
              className="text-2xl hover:text-red-400 transition-colors"
            >
              <FaEnvelope />
            </a>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home; 