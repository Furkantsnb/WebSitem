import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  PlusCircleIcon,
  TrashIcon,
  PencilSquareIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const projectSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  githubUrl: z.string().url('Geçerli bir GitHub URL\'si giriniz').optional().or(z.literal('')),
  demoUrl: z.string().url('Geçerli bir demo URL\'si giriniz').optional().or(z.literal('')),
  technologies: z.string().optional(),
});

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema)
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    console.log('Projeler çekiliyor...');
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      console.log('Projeler başarıyla çekildi:', projectsData);
    } catch (err) {
      console.error('Projeler çekilirken hata oluştu:', err);
      setError('Projeler yüklenirken bir hata oluştu.');
      toast.error('Projeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      console.log('Projeler çekme işlemi tamamlandı.');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedImage(null);
      setImagePreview(null);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const onSubmit = async (data) => {
    console.log('Form gönderiliyor...', data);
    try {
      setIsLoading(true);
      let imageUrl = selectedProject?.imageUrl;

      if (uploadedImage) {
        imageUrl = await uploadImage(uploadedImage);
      } else if (selectedProject && !imagePreview) {
        imageUrl = null;
      }

      const technologiesArray = data.technologies ? data.technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '') : [];

      const projectData = {
        ...data,
        technologies: technologiesArray,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (selectedProject) {
        console.log('Proje güncelleniyor:', selectedProject.id, projectData);
        await updateDoc(doc(db, 'projects', selectedProject.id), projectData);
        toast.success('Proje güncellendi');
      } else {
        console.log('Yeni proje ekleniyor:', projectData);
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: new Date().toISOString()
        });
        toast.success('Proje eklendi');
      }

      setIsModalOpen(false);
      reset();
      setSelectedProject(null);
      setUploadedImage(null);
      setImagePreview(null);
      fetchProjects();
    } catch (error) {
      console.error('Proje kaydederken hata:', error);
      toast.error('Proje kaydedilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      console.log('Form gönderme işlemi tamamlandı.');
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    reset({
      ...project,
      technologies: project.technologies ? project.technologies.join(', ') : ''
    });
    setImagePreview(project.imageUrl);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        setProjects(projects.filter(project => project.id !== id));
        toast.success('Proje başarıyla silindi.');
      } catch (err) {
        console.error('Proje silinirken hata oluştu:', err);
        toast.error('Proje silinirken bir hata oluştu.');
      }
    }
  };

  const handleAdd = () => {
    setSelectedProject(null);
    reset();
    setUploadedImage(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setSelectedProject(null);
    setUploadedImage(null);
    setImagePreview(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600 dark:text-gray-400">Projeler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projeler</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Portföy projelerinizi yönetin
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Yeni Proje
          </motion.button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Henüz hiç proje eklenmemiş.</p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <motion.li
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex-1 mr-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                  {(project.imageUrl || (project.technologies && project.technologies.length > 0)) && (
                    <div className="mt-4">
                      {project.imageUrl && (
                        <img src={project.imageUrl} alt={project.title} className="w-24 h-auto rounded-md mb-2" />
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedProject ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Proje Resmi
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-cover"
                      />
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Resim Yükle</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    {imagePreview && (
                       <button 
                         type="button" 
                         onClick={() => setImagePreview(null)} 
                         className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800"
                       >
                         Resmi Kaldır
                       </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Başlık
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GitHub URL
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    {...register('githubUrl')}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                  />
                  {errors.githubUrl && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.githubUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Demo URL
                  </label>
                  <input
                    id="demoUrl"
                    type="url"
                    {...register('demoUrl')}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                  />
                  {errors.demoUrl && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.demoUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teknolojiler (Virgülle ayırın)
                </label>
                <input
                  id="technologies"
                  type="text"
                  {...register('technologies')}
                  placeholder="React, Tailwind CSS, Firebase"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Kaydediliyor...' : (selectedProject ? 'Güncelle' : 'Ekle')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects; 