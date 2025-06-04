import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaMedium } from 'react-icons/fa';
import { MdOutlineSubject } from "react-icons/md";
import emailjs from '@emailjs/browser';

// Alt Bileşenler
const ContactInfo = ({ data }) => {
  const socialIcons = {
    github: FaGithub,
    linkedin: FaLinkedin,
    twitter: FaTwitter,
    medium: FaMedium,
    // İhtiyaç olursa buraya başka sosyal medya ikonları eklenebilir
    // medium: FaMediumM,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {data?.heading || 'İletişim'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {data?.subtext || 'Benimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.'}
      </p>

      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        {data?.email && (
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-blue-600 dark:text-blue-400 text-xl" />
            <span>{data.email}</span>
          </div>
        )}
        {data?.phone && (
          <div className="flex items-center gap-3">
            <FaPhone className="text-blue-600 dark:text-blue-400 text-xl" />
            <span>{data.phone}</span>
          </div>
        )}
        {data?.location && (
          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400 text-xl" />
            <span>{data.location}</span>
          </div>
        )}
      </div>

      {data?.socials && Object.keys(data.socials).length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sosyal Medya</h3>
          <div className="flex flex-wrap gap-6">
            {Object.entries(data.socials).map(([key, value]) => {
              const Icon = socialIcons[key];
              return (
                <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="text-2xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ContactForm = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.current) return;

    setSubmissionStatus('submitting');

    emailjs.sendForm(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        form.current,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      )
      .then((result) => {
          console.log('SUCCESS!', result.text);
          setSubmissionStatus('success');
          setFormData({ name: '', email: '', subject: '', message: '' });
      }, (error) => {
          console.log('FAILED...', error.text);
          setSubmissionStatus('error');
          alert('Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mesaj Gönder</h2>
      <form ref={form} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adınız</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Adresiniz</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konu (İsteğe Bağlı)</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mesajınız</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={submissionStatus === 'submitting'}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${submissionStatus === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {submissionStatus === 'submitting' ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>
      {submissionStatus === 'success' && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-green-600 dark:text-green-400 text-center"
        >
          Mesajınız başarıyla gönderildi! Teşekkür ederim.
        </motion.p>
      )}
      {submissionStatus === 'error' && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-red-600 dark:text-red-400 text-center"
        >
          Mesaj gönderilirken bir hata oluştu. Lütfen konsolu kontrol edin.
        </motion.p>
      )}
    </motion.div>
  );
};

// Ana Bileşen
const ContactPage = () => {
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const docRef = doc(db, 'contact', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContactData(docSnap.data());
        } else {
          console.log('İletişim dökümanı bulunamadı!');
        }
      } catch (error) {
        console.error('İletişim verisi getirilirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className={`grid grid-cols-1 ${contactData?.showForm ? 'md:grid-cols-2 gap-12' : ''}`}>
          {/* İletişim Bilgileri Kısmı */}
          <ContactInfo data={contactData} />

          {/* İletişim Formu Kısmı */}
          {contactData?.showForm && (
            <ContactForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 