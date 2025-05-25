import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';
import { PhotoIcon } from '@heroicons/react/24/outline';

const blogSchema = z.object({
  heading: z.string().min(1, 'Başlık gereklidir'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  mediumUsername: z.string().min(1, 'Medium kullanıcı adı gereklidir'),
  showCount: z.number().min(1, 'En az 1 yazı gösterilmelidir').max(50, 'En fazla 50 yazı gösterilebilir'),
  showProfile: z.boolean(),
  showTags: z.boolean(),
  enableSearch: z.boolean(),
  heroImage: z.string().url('Geçerli bir resim URL\'si giriniz').optional().or(z.literal(''))
});

const Blog = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      showCount: 10,
      showProfile: true,
      showTags: true,
      enableSearch: true
    }
  });

  useEffect(() => {
    fetchBlogConfig();
  }, []);

  const fetchBlogConfig = async () => {
    try {
      const docRef = doc(db, 'blog', 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setValue('heading', data.heading || '');
        setValue('description', data.description || '');
        setValue('mediumUsername', data.mediumUsername || '');
        setValue('showCount', data.showCount || 10);
        setValue('showProfile', data.showProfile ?? true);
        setValue('showTags', data.showTags ?? true);
        setValue('enableSearch', data.enableSearch ?? true);
        setValue('heroImage', data.heroImage || '');
        setImagePreview(data.heroImage || null);
      }
    } catch (error) {
      toast.error('Blog ayarları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const docRef = doc(db, 'blog', 'main');
      await updateDoc(docRef, data);
      toast.success('Blog ayarları güncellendi');
    } catch (error) {
      toast.error('Blog ayarları güncellenirken hata oluştu');
    }
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blog Ayarları</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Medium entegrasyonu ve blog görünüm ayarlarını yapılandırın
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blog Başlığı
                </label>
                <input
                  type="text"
                  {...register('heading')}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.heading && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.heading.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blog Açıklaması
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medium Kullanıcı Adı
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 sm:text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    {...register('mediumUsername')}
                    className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                {errors.mediumUsername && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.mediumUsername.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gösterilecek Yazı Sayısı
                </label>
                <input
                  type="number"
                  {...register('showCount', { valueAsNumber: true })}
                  min="1"
                  max="50"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                {errors.showCount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.showCount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hero Resmi
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
                      <input
                        type="url"
                        {...register('heroImage')}
                        placeholder="Resim URL'si"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        onChange={(e) => setImagePreview(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {errors.heroImage && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.heroImage.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('showProfile')}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Medium profilini göster
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('showTags')}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Etiketleri göster
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('enableSearch')}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Arama özelliğini etkinleştir
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Blog; 