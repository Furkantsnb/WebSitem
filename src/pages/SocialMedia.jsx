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

const socialMediaSchema = z.object({
  platforms: z.array(z.object({
    name: z.string().min(1, 'Platform adı gereklidir'),
    url: z.string().url('Geçerli bir URL giriniz'),
    icon: z.string().min(1, 'İkon gereklidir'),
    order: z.number()
  }))
});

const SocialMedia = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [platforms, setPlatforms] = useState([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      platforms: []
    }
  });

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  const fetchSocialMedia = async () => {
    try {
      const docRef = doc(db, 'socialMedia', 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlatforms(data.platforms || []);
        setValue('platforms', data.platforms || []);
      }
    } catch (error) {
      toast.error('Sosyal medya ayarları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const docRef = doc(db, 'socialMedia', 'main');
      await updateDoc(docRef, {
        platforms: data.platforms
      });
      toast.success('Sosyal medya ayarları güncellendi');
      fetchSocialMedia();
    } catch (error) {
      toast.error('Sosyal medya ayarları güncellenirken hata oluştu');
    }
  };

  const addPlatform = () => {
    const newPlatforms = [...platforms, { name: '', url: '', icon: '', order: platforms.length }];
    setPlatforms(newPlatforms);
    setValue('platforms', newPlatforms);
  };

  const removePlatform = (index) => {
    const newPlatforms = platforms.filter((_, i) => i !== index);
    setPlatforms(newPlatforms);
    setValue('platforms', newPlatforms);
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sosyal Medya</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sosyal medya hesaplarınızı yönetin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1 mr-4">
                  <input
                    {...register(`platforms.${index}.name`)}
                    placeholder="Platform Adı"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  {errors.platforms?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.platforms[index].name.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removePlatform(index)}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    {...register(`platforms.${index}.url`)}
                    placeholder="Platform URL'si"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  {errors.platforms?.[index]?.url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.platforms[index].url.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    {...register(`platforms.${index}.icon`)}
                    placeholder="İkon (örn: fa-github)"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  {errors.platforms?.[index]?.icon && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.platforms[index].icon.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    {...register(`platforms.${index}.order`, { valueAsNumber: true })}
                    placeholder="Sıralama"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addPlatform}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Yeni Platform
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

export default SocialMedia; 