import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GalleryVertical as GalleryIcon, Search, Filter, Star, Eye, Heart, Share2, Download, Play, Award, Users, Calendar, Tag } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
import { formatDate } from '../utils/dateUtils';

const categories = [
  { id: 'all', name: 'جميع المشاريع' },
  { id: 'stem', name: 'العلوم والتقنية' },
  { id: 'entrepreneurship', name: 'ريادة الأعمال' },
  { id: 'volunteer', name: 'التطوع' },
  { id: 'ethics', name: 'الأخلاق' },
];

const schools = [
  { id: 'all', name: 'جميع المدارس' },
  { id: 'school1', name: 'مدرسة الملك عبدالعزيز' },
  { id: 'school2', name: 'مدرسة الأمير محمد' },
  { id: 'school3', name: 'مدرسة النور الأهلية' },
  { id: 'school4', name: 'مدرسة المستقبل' },
];

const sortOptions = [
  { id: 'latest', name: 'الأحدث' },
  { id: 'popular', name: 'الأكثر شعبية' },
  { id: 'rating', name: 'الأعلى تقييماً' },
  { id: 'views', name: 'الأكثر مشاهدة' },
];

export const Gallery: React.FC = () => {
  const { projects, loading, error, incrementViews, incrementLikes } = useGallery();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedProjects, setLikedProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredProjects = projects
    .filter(project => {
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesSchool = selectedSchool === 'all' || project.school === schools.find(s => s.id === selectedSchool)?.name;
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           project.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.students.some(student => student.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSchool && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'rating':
          return b.rating - a.rating;
        case 'views':
          return b.views - a.views;
        case 'latest':
        default:
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
    });

  const toggleLike = (projectId: string) => {
    if (likedProjects.includes(projectId)) {
      setLikedProjects(prev => prev.filter(id => id !== projectId));
    } else {
      setLikedProjects(prev => [...prev, projectId]);
      incrementLikes(projectId);
    }
  };

  const handleViewProject = (projectId: string) => {
    incrementViews(projectId);
    setSelectedProject(projectId);
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'stem': return 'العلوم والتقنية';
      case 'entrepreneurship': return 'ريادة الأعمال';
      case 'volunteer': return 'التطوع';
      case 'ethics': return 'الأخلاق';
      default: return category;
    }
  };

  const shareProject = (project: any) => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href + '?project=' + project.id,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const url = window.location.href + '?project=' + project.id;
      navigator.clipboard.writeText(url);
      alert('تم نسخ رابط المشروع إلى الحافظة');
    }
  };

  // Check for project ID in URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) {
      setSelectedProject(projectId);
      incrementViews(projectId);
    }
  }, []);

  // Project detail modal
  const projectDetail = selectedProject ? projects.find(p => p.id === selectedProject) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GalleryIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">حدث خطأ</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <GalleryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">معرض المشاريع</h1>
            <p className="opacity-90">استكشف المشاريع المميزة والملهمة من طلابنا</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-sm opacity-80">مشروع معروض</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{projects.filter(p => p.featured).length}</div>
            <div className="text-sm opacity-80">مشروع مميز</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</div>
            <div className="text-sm opacity-80">إجمالي المشاهدات</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.likes, 0)}</div>
            <div className="text-sm opacity-80">إجمالي الإعجابات</div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المشاريع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              شبكة
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              قائمة
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Categories */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">الفئات</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    selectedCategory === category.id
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Schools */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">المدارس</h3>
            <div className="flex flex-wrap gap-2">
              {schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => setSelectedSchool(school.id)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    selectedSchool === school.id
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {school.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          عرض {filteredProjects.length} من أصل {projects.length} مشروع
        </p>
      </div>

      {/* Projects Display */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {project.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    مميز
                  </div>
                )}
                {project.video && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </button>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {project.views.toLocaleString()}
                  </div>
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {project.likes}
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{project.rating}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{getCategoryText(project.category)}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* School and Teacher */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">المدرسة:</span> {project.school}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">المعلم:</span> {project.teacher}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Awards */}
                {project.awards && project.awards.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">{project.awards[0]}</span>
                      {project.awards.length > 1 && (
                        <span className="text-gray-500">+{project.awards.length - 1}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Project Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.students.length} طالب
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.completedAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(project.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        likedProjects.includes(project.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => shareProject(project)}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleViewProject(project.id)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-6">
                {/* Project Image */}
                <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  {project.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      مميز
                    </div>
                  )}
                </div>

                {/* Project Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          {getCategoryText(project.category)}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{project.description}</p>
                      
                      {/* School and Teacher */}
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">المدرسة:</span> {project.school}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">المعلم:</span> {project.teacher}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{project.rating}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.students.length} طالب
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {project.views.toLocaleString()} مشاهدة
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {project.likes} إعجاب
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(project.completedAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(project.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          likedProjects.includes(project.id)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => shareProject(project)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewProject(project.id)}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GalleryIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">لم يتم العثور على مشاريع</h3>
          <p className="text-gray-600 mb-4">جرب تغيير معايير البحث أو الفلاتر</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSchool('all');
              setSearchTerm('');
            }}
            className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </motion.div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && projectDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Image Gallery */}
              <div className="relative h-80 bg-gray-900">
                <img 
                  src={projectDetail.images[0]} 
                  alt={projectDetail.title}
                  className="w-full h-full object-contain"
                />
                
                {/* Close button */}
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Image navigation */}
                {projectDetail.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {projectDetail.images.map((_, idx) => (
                      <button 
                        key={idx}
                        className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                      ></button>
                    ))}
                  </div>
                )}
                
                {/* Video button */}
                {projectDetail.video && (
                  <a 
                    href={projectDetail.video} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    مشاهدة الفيديو
                  </a>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{projectDetail.title}</h2>
                  {projectDetail.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      مميز
                    </span>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-2">وصف المشروع</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{projectDetail.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {projectDetail.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Awards */}
                    {projectDetail.awards && projectDetail.awards.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">الجوائز</h3>
                        <div className="flex flex-wrap gap-2">
                          {projectDetail.awards.map((award, idx) => (
                            <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-lg flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {award}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">معلومات المشروع</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">المدرسة</p>
                          <p className="font-medium">{projectDetail.school}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">المعلم المشرف</p>
                          <p className="font-medium">{projectDetail.teacher}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">تاريخ الإنجاز</p>
                          <p className="font-medium">{formatDate(projectDetail.completedAt)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">التقييم</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{projectDetail.rating}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">الفئة</p>
                          <p className="font-medium">{getCategoryText(projectDetail.category)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Students */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">فريق العمل</h3>
                  <div className="flex flex-wrap gap-3">
                    {projectDetail.students.map((student, idx) => (
                      <div key={idx} className="bg-gray-100 rounded-full px-4 py-2 text-sm flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-700">
                          {student.charAt(0)}
                        </div>
                        <span>{student}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Stats and actions */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span>{projectDetail.views.toLocaleString()} مشاهدة</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Heart className="w-5 h-5" />
                      <span>{projectDetail.likes} إعجاب</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(projectDetail.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        likedProjects.includes(projectDetail.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => shareProject(projectDetail)}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};