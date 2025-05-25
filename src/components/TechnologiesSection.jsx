import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

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
          console.log('Teknoloji verisi bulunamadı!');
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
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
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
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Teknolojiler
          </h1>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {technologies && Object.entries(technologies).map(([category, items]) => (
              <motion.div
                key={category}
                variants={itemVariants}
                className="relative"
              >
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {category}
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-5">
                  {items.map((tech, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tech.icon}</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {tech.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TechnologiesSection; 