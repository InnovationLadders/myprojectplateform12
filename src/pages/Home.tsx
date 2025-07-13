import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, MessageCircle, ShoppingCart, Bot, GalleryVertical as Gallery, Shield, ArrowLeft, Star, Clock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Users, label: t('home.stats.activeUsers'), value: '147', color: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, label: t('home.stats.activeProjects'), value: '14', color: 'from-green-500 to-green-600' },
    { icon: Award, label: t('home.stats.completedProjects'), value: '14', color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, label: t('home.stats.successRate'), value: '100%', color: 'from-orange-500 to-orange-600' },
  ];

  const features = [
    {
      icon: BookOpen,
      title: t('sidebar.projectIdeas'),
      description: t('home.featuresSection.description'),
      link: '/project-ideas',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Users,
      title: t('sidebar.projects'),
      description: t('home.featuresSection.description'),
      link: '/projects',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: t('sidebar.consultations'),
      description: t('home.featuresSection.description'),
      link: '/consultations',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: ShoppingCart,
      title: t('sidebar.store'),
      description: t('home.featuresSection.description'),
      link: '/store',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Bot,
      title: t('sidebar.aiAssistant'),
      description: t('home.featuresSection.description'),
      link: '/ai-assistant',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Gallery,
      title: t('sidebar.gallery'),
      description: t('home.featuresSection.description'),
      link: '/gallery',
      color: 'from-purple-500 to-pink-600'
    },
  ];

  const testimonials = [
    {
      name: 'سارة أحمد',
      role: 'معلمة علوم',
      content: 'منصة مشروعي غيرت طريقة تدريسي تماماً. الطلاب أصبحوا أكثر تفاعلاً وإبداعاً.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5
    },
    {
      name: 'محمد علي',
      role: 'طالب ثانوي',
      content: 'تمكنت من تطوير مشروع روبوت متقدم بفضل الإرشادات والدعم المتاح في المنصة.',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5
    },
    {
      name: 'فاطمة خالد',
      role: 'مديرة مدرسة',
      content: 'المنصة ساعدتنا في تنظيم وإدارة مشاريع الطلاب بكفاءة عالية ومتابعة تقدمهم.',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden">
              <img 
                src="/mashroui-logo.png" 
                alt={t('appName')} 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{t('home.welcome')}</h1>
              <p className="text-xl opacity-90">{t('home.tagline')}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-6 opacity-90 leading-relaxed">
                {t('home.description')}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/project-ideas"
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  {t('home.exploreIdeas')}
                </Link>
                <Link
                  to="/projects"
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  {t('home.manageProjects')}
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                src="https://alandalus.edu.sa/photos/1/makka%20(4).jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="طلاب يعملون على مشروع متقدم" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Features Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('home.featuresSection.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('home.featuresSection.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
              <Link
                to={feature.link}
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                {t('home.featuresSection.exploreMore')}
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-50 rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('home.testimonials.title')}</h2>
          <p className="text-gray-600">{t('home.testimonials.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl p-8 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
        <p className="text-xl mb-6 opacity-90">
          {t('home.cta.description')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/project-ideas"
            className="bg-white text-green-600 px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200"
          >
            {t('home.cta.exploreIdeas')}
          </Link>
          <Link
            to="/projects"
            className="bg-white bg-opacity-20 text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
          >
            {t('home.cta.createProject')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};