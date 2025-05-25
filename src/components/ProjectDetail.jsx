import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaGithub, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

// Swiper stilleri
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('Proje bulunamadı!');
          navigate('/projects');
        }
      } catch (error) {
        console.error('Proje yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <FaArrowLeft /> Projelere Dön
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl"
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            className="h-[400px] md:h-[500px]"
          >
            {project.images?.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`${project.title} - Görsel ${index + 1}`}
                  className="w-full h-full object-contain bg-gray-100 dark:bg-gray-900"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{project.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack?.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-4 mb-8">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaGithub /> GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaExternalLinkAlt /> Demo
                </a>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{project.readme}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail; 