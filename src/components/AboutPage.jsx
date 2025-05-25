import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaDownload, FaGraduationCap, FaBriefcase, FaCertificate, FaLanguage } from 'react-icons/fa';

// Alt Bileşenler
const IntroSection = ({ aboutText, cvLink }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12"
  >
    <div className="prose dark:prose-invert max-w-none">
      {aboutText?.split('\n').map((paragraph, index) => (
        <p key={index} className="text-gray-600 dark:text-gray-300 mb-4">
          {paragraph}
        </p>
      ))}
    </div>
    {cvLink && (
      <motion.a
        href={cvLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mt-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaDownload /> CV İndir
      </motion.a>
    )}
  </motion.section>
);

const EducationSection = ({ education }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
      <FaGraduationCap className="text-blue-600 dark:text-blue-400" /> Eğitim
    </h2>
    <div className="space-y-6">
      {education?.map((edu, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{edu.school}</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{edu.department}</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{edu.year}</p>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

const WorkHistorySection = ({ workHistory }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
      <FaBriefcase className="text-blue-600 dark:text-blue-400" /> İş Deneyimi
    </h2>
    <div className="space-y-6">
      {workHistory?.map((work, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{work.position}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{work.company}</p>
            </div>
            <span className="text-gray-500 dark:text-gray-400">{work.date}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">{work.description}</p>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

const CertificatesSection = ({ certificates }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
      <FaCertificate className="text-blue-600 dark:text-blue-400" /> Sertifikalar
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {certificates?.map((cert, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{cert.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{cert.source}</p>
          {cert.url && (
            <a
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Sertifikayı Görüntüle →
            </a>
          )}
        </motion.div>
      ))}
    </div>
  </motion.section>
);

const LanguagesSection = ({ languages }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
      <FaLanguage className="text-blue-600 dark:text-blue-400" /> Diller
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {languages?.map((lang, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-md"
        >
          <h3 className="font-semibold text-blue-600 dark:text-blue-400">{lang.language}</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{lang.level}</p>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

// Ana Bileşen
const AboutPage = () => {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'about', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setContent(docSnap.data());
        } else {
          console.log('Döküman bulunamadı!');
        }
      } catch (error) {
        console.error('Veri getirme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          >
            {content?.fullName || 'Furkan Taşan'}
          </motion.h1>
          <IntroSection aboutText={content?.aboutText} cvLink={content?.cvLink} />
          <EducationSection education={content?.education} />
          <WorkHistorySection workHistory={content?.workHistory} />
          <CertificatesSection certificates={content?.certificates} />
          <LanguagesSection languages={content?.languages} />
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage; 