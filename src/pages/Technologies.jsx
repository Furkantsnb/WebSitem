import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const technologySchema = z.object({
  categories: z.array(z.object({
    name: z.string().min(1, 'Kategori adı gereklidir'),
    technologies: z.array(z.string()).min(1, 'En az bir teknoloji giriniz')
  }))
});

const Technologies = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      categories: []
    }
  });

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const fetchTechnologies = async () => {
    try {
      const docRef = doc(db, 'technologies', 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCategories(data.categories || []);
        setValue('categories', data.categories || []);
      }
    } catch (error) {
      toast.error('Teknolojiler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const docRef = doc(db, 'technologies', 'main');
      await updateDoc(docRef, {
        categories: data.categories
      });
      toast.success('Teknolojiler güncellendi');
      fetchTechnologies();
    } catch (error) {
      toast.error('Teknolojiler güncellenirken hata oluştu');
    }
  };

  const addCategory = () => {
    const newCategories = [...categories, { name: '', technologies: [''] }];
    setCategories(newCategories);
    setValue('categories', newCategories);
  };

  const removeCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    setValue('categories', newCategories);
  };

  const addTechnology = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].technologies.push('');
    setCategories(newCategories);
    setValue('categories', newCategories);
  };

  const removeTechnology = (categoryIndex, techIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].technologies = newCategories[categoryIndex].technologies.filter((_, i) => i !== techIndex);
    setCategories(newCategories);
    setValue('categories', newCategories);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Teknolojiler</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kullandığınız teknolojileri kategorilere ayırarak yönetin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1 mr-4">
                  <input
                    {...register(`categories.${categoryIndex}.name`)}
                    placeholder="Kategori Adı"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  {errors.categories?.[categoryIndex]?.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.categories[categoryIndex].name.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(categoryIndex)}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {category.technologies.map((_, techIndex) => (
                  <div key={techIndex} className="flex items-center space-x-3">
                    <input
                      {...register(`categories.${categoryIndex}.technologies.${techIndex}`)}
                      placeholder="Teknoloji Adı"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeTechnology(categoryIndex, techIndex)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTechnology(categoryIndex)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-1.5 h-4 w-4" />
                  Teknoloji Ekle
                </button>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Yeni Kategori
            </button>

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Technologies; 