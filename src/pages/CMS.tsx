import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Search,
  Filter,
  Upload,
  Download,
  Copy,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Tag,
  Calendar,
  User,
  Star,
  BarChart3,
  GalleryVertical,
  X,
  Award,
  Book,
  BookOpen,
  ShoppingCart,
  Lightbulb,
  Users,
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Briefcase,
  Heart,
  Shield,
  Beaker,
  Layers,
  Headphones,
  Play
} from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { 
  getProjectIdeas, 
  createProjectIdea, 
  updateProjectIdea, 
  deleteProjectIdea,
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getStoreItems,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
  getUsers,
  updateUser,
  deleteUser,
  registerUser
} from '../lib/firebase';

// Content types definition
const contentTypes = [
  { id: 'project-ideas', name: 'أفكار المشاريع', icon: Lightbulb, count: 0 },
  { id: 'resources', name: 'المصادر التعليمية', icon: BookOpen, count: 0 },
  { id: 'store-items', name: 'منتجات المتجر', icon: ShoppingCart, count: 0 },
  { id: 'gallery', name: 'معرض المشاريع', icon: GalleryVertical, count: 0 },
  { id: 'consultants', name: 'المستشارين', icon: User, count: 0 },
  { id: 'categories', name: 'الفئات والتصنيفات', icon: Tag, count: 0 },
  { id: 'users', name: 'إدارة المستخدمين', icon: Users, count: 0 },
  { id: 'settings', name: 'إعدادات النظام', icon: SettingsIcon, count: 0 },
];

// Categories for project ideas and other content
const categories = [
  { id: 'stem', name: 'العلوم والتقنية', icon: Beaker, color: 'from-blue-500 to-blue-600' },
  { id: 'entrepreneurship', name: 'ريادة الأعمال', icon: Briefcase, color: 'from-green-500 to-green-600' },
  { id: 'volunteer', name: 'التطوع', icon: Heart, color: 'from-red-500 to-red-600' },
  { id: 'ethics', name: 'الأخلاق', icon: Shield, color: 'from-purple-500 to-purple-600' },
];

// Difficulty levels
const difficulties = [
  { id: 'beginner', name: 'مبتدئ', color: 'bg-green-100 text-green-800' },
  { id: 'intermediate', name: 'متوسط', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'advanced', name: 'متقدم', color: 'bg-red-100 text-red-800' },
];

// Resource types
const resourceTypes = [
  { id: 'article', name: 'مقالة', icon: FileText },
  { id: 'video', name: 'فيديو', icon: Video },
  { id: 'course', name: 'دورة تدريبية', icon: BookOpen },
  { id: 'template', name: 'قالب', icon: Layers },
  { id: 'podcast', name: 'بودكاست', icon: Headphones },
  { id: 'link', name: 'رابط مفيد', icon: LinkIcon },
];

// Store item categories
const storeCategories = [
  { id: 'electronics', name: 'الإلكترونيات' },
  { id: 'tools', name: 'الأدوات' },
  { id: 'materials', name: 'المواد' },
  { id: 'books', name: 'الكتب' },
  { id: 'software', name: 'البرمجيات' },
];

// User roles
const userRoles = [
  { id: 'student', name: 'طالب', icon: User },
  { id: 'teacher', name: 'معلم', icon: BookOpen },
  { id: 'school', name: 'مدرسة', icon: Book },
  { id: 'admin', name: 'مدير', icon: Shield },
];

export const CMS: React.FC = () => {
  // General state
  const [activeContentType, setActiveContentType] = useState('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contentTypesWithCount, setContentTypesWithCount] = useState(contentTypes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Gallery state (already implemented)
  const { projects, addGalleryProject, updateGalleryProject, deleteGalleryProject, loading: galleryLoading } = useGallery();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState({
    title: '',
    description: '',
    school: '',
    teacher: '',
    students: [] as string[],
    category: '',
    tags: [] as string[],
    awards: [] as string[],
    images: [] as string[],
    video: '',
    featured: false
  });

  // Project Ideas state
  const [projectIdeas, setProjectIdeas] = useState<any[]>([]);
  const [showProjectIdeaModal, setShowProjectIdeaModal] = useState(false);
  const [editingProjectIdea, setEditingProjectIdea] = useState<any>(null);
  const [projectIdeaFormData, setProjectIdeaFormData] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    difficulty: '',
    duration: '',
    objectives: [''],
    materials: [''],
    steps: [''],
    image: '',
    featured: false
  });

  // Learning Resources state
  const [learningResources, setLearningResources] = useState<any[]>([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    author: '',
    duration: '',
    difficulty: '',
    thumbnail: '',
    contentUrl: '',
    tags: [] as string[],
    featured: false,
    lessons: 0,
    certificate: false,
    fileSize: '',
    episodes: 0,
    downloadUrl: '',
    videoUrl: ''
  });

  // Store Items state
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [showStoreItemModal, setShowStoreItemModal] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState<any>(null);
  const [storeItemFormData, setStoreItemFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    features: [] as string[],
    tags: [] as string[],
    image: '',
    inStock: true,
    stockQuantity: 0,
    discount: 0,
    featured: false
  });

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    school_id: '',
    grade: '',
    subject: '',
    avatar_url: '',
    phone: '',
    location: '',
    status: 'active'
  });

  // Categories state
  const [categoriesList, setCategoriesList] = useState<any[]>(categories);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    icon: '',
    color: ''
  });

  // Fetch data based on active content type
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        switch (activeContentType) {
          case 'project-ideas':
            const ideas = await getProjectIdeas();
            setProjectIdeas(ideas);
            updateContentTypeCount('project-ideas', ideas.length);
            break;
          case 'resources':
            const resources = await getLearningResources();
            setLearningResources(resources);
            updateContentTypeCount('resources', resources.length);
            break;
          case 'store-items':
            const items = await getStoreItems();
            setStoreItems(items);
            updateContentTypeCount('store-items', items.length);
            break;
          case 'users':
            const usersList = await getUsers();
            setUsers(usersList);
            updateContentTypeCount('users', usersList.length);
            break;
          case 'gallery':
            // Gallery data is already loaded via useGallery hook
            updateContentTypeCount('gallery', projects.length);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(`Error fetching ${activeContentType}:`, err);
        setError(`حدث خطأ في تحميل البيانات: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeContentType, projects.length]);

  // Update content type count
  const updateContentTypeCount = (typeId: string, count: number) => {
    setContentTypesWithCount(prev => 
      prev.map(type => 
        type.id === typeId ? { ...type, count } : type
      )
    );
  };

  // Show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Generic input change handler
  const handleInputChange = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, value: any) => {
    formSetter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generic array input change handler
  const handleArrayChange = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, index: number, value: string) => {
    formSetter(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Generic add array item handler
  const addArrayItem = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, defaultValue: any = '') => {
    formSetter(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  // Generic remove array item handler
  const removeArrayItem = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, index: number) => {
    formSetter(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  // Generic array input with add button
  const handleArrayInputChange = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, value: string) => {
    if (value.trim() === '') return;
    
    formSetter(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  // Generic remove array item by index
  const handleRemoveArrayItem = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, index: number) => {
    formSetter(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, formSetter: React.Dispatch<React.SetStateAction<any>>, field: string = 'images', single: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create a storage reference
        const storageRef = ref(storage, `cms/${activeContentType}/${Date.now()}_${file.name}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        return await getDownloadURL(storageRef);
      });
      
      // Wait for all uploads to complete
      const imageUrls = await Promise.all(uploadPromises);
      
      // Add the new image URLs to the form data
      if (single) {
        formSetter(prev => ({
          ...prev,
          [field]: imageUrls[0]
        }));
      } else {
        formSetter(prev => ({
          ...prev,
          [field]: [...prev[field], ...imageUrls]
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  // Remove image handler
  const handleRemoveImage = (formSetter: React.Dispatch<React.SetStateAction<any>>, field: string, index: number) => {
    formSetter(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  // Bulk action handler
  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action}:`, selectedItems);
    setSelectedItems([]);
  };

  // Get category text
  const getCategoryText = (category: string) => {
    const foundCategory = categories.find(c => c.id === category);
    return foundCategory ? foundCategory.name : category;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

  // ==================== GALLERY FUNCTIONS ====================
  // These are already implemented in the original code

  const handleGalleryInputChange = (field: string, value: any) => {
    setGalleryFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGalleryArrayInputChange = (field: string, value: string) => {
    if (value.trim() === '') return;
    
    setGalleryFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], value]
    }));
  };

  const handleGalleryRemoveArrayItem = (field: string, index: number) => {
    setGalleryFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleStudentInputChange = (value: string) => {
    if (value.trim() === '') return;
    
    setGalleryFormData(prev => ({
      ...prev,
      students: [...prev.students, value]
    }));
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create a storage reference
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        return await getDownloadURL(storageRef);
      });
      
      // Wait for all uploads to complete
      const imageUrls = await Promise.all(uploadPromises);
      
      // Add the new image URLs to the form data
      setGalleryFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryRemoveImage = (index: number) => {
    setGalleryFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleGallerySave = async () => {
    try {
      // Validate form
      if (!galleryFormData.title || !galleryFormData.description || !galleryFormData.school || !galleryFormData.teacher || 
          galleryFormData.students.length === 0 || !galleryFormData.category || galleryFormData.images.length === 0) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (editingItem) {
        await updateGalleryProject(editingItem.id, {
          ...galleryFormData,
          completedAt: new Date().toISOString()
        });
        showSuccessMessage('تم تحديث المشروع بنجاح');
      } else {
        await addGalleryProject({
          ...galleryFormData,
          completedAt: new Date().toISOString(),
          rating: 5,
          views: 0,
          likes: 0
        });
        showSuccessMessage('تم إضافة المشروع بنجاح');
      }

      // Reset form and close modal
      setGalleryFormData({
        title: '',
        description: '',
        school: '',
        teacher: '',
        students: [],
        category: '',
        tags: [],
        awards: [],
        images: [],
        video: '',
        featured: false
      });
      setShowAddModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving gallery project:', error);
      setError('حدث خطأ أثناء حفظ المشروع');
    }
  };

  const handleGalleryEdit = (item: any) => {
    setEditingItem(item);
    setGalleryFormData({
      title: item.title,
      description: item.description,
      school: item.school,
      teacher: item.teacher,
      students: item.students,
      category: item.category,
      tags: item.tags,
      awards: item.awards || [],
      images: item.images,
      video: item.video || '',
      featured: item.featured || false
    });
    setShowAddModal(true);
  };

  const handleGalleryDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      try {
        await deleteGalleryProject(id);
        showSuccessMessage('تم حذف المشروع بنجاح');
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('حدث خطأ أثناء حذف المشروع');
      }
    }
  };

  // ==================== PROJECT IDEAS FUNCTIONS ====================
  const resetProjectIdeaForm = () => {
    setProjectIdeaFormData({
      title: '',
      description: '',
      category: '',
      subject: '',
      difficulty: '',
      duration: '',
      objectives: [''],
      materials: [''],
      steps: [''],
      image: '',
      featured: false
    });
  };

  const handleAddProjectIdea = () => {
    resetProjectIdeaForm();
    setEditingProjectIdea(null);
    setShowProjectIdeaModal(true);
  };

  const handleEditProjectIdea = (idea: any) => {
    setEditingProjectIdea(idea);
    setProjectIdeaFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      subject: idea.subject,
      difficulty: idea.difficulty,
      duration: idea.duration,
      objectives: idea.objectives,
      materials: idea.materials,
      steps: idea.steps,
      image: idea.image,
      featured: idea.featured || false
    });
    setShowProjectIdeaModal(true);
  };

  const handleDeleteProjectIdea = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفكرة؟')) {
      try {
        setIsLoading(true);
        await deleteProjectIdea(id);
        setProjectIdeas(prev => prev.filter(idea => idea.id !== id));
        updateContentTypeCount('project-ideas', projectIdeas.length - 1);
        showSuccessMessage('تم حذف الفكرة بنجاح');
      } catch (error) {
        console.error('Error deleting project idea:', error);
        setError('حدث خطأ أثناء حذف الفكرة');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveProjectIdea = async () => {
    try {
      // Validate form
      if (!projectIdeaFormData.title || !projectIdeaFormData.description || 
          !projectIdeaFormData.category || !projectIdeaFormData.subject || 
          !projectIdeaFormData.difficulty || !projectIdeaFormData.duration || 
          !projectIdeaFormData.image) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setIsLoading(true);

      if (editingProjectIdea) {
        // Update existing idea
        const updatedIdea = await updateProjectIdea(editingProjectIdea.id, {
          ...projectIdeaFormData,
          // Preserve existing stats
          rating: editingProjectIdea.rating,
          views: editingProjectIdea.views,
          downloads: editingProjectIdea.downloads
        });
        
        setProjectIdeas(prev => 
          prev.map(idea => idea.id === editingProjectIdea.id ? updatedIdea : idea)
        );
        showSuccessMessage('تم تحديث الفكرة بنجاح');
      } else {
        // Create new idea
        const newIdea = await createProjectIdea({
          ...projectIdeaFormData,
          rating: 4.5, // Default rating
          views: 0,
          downloads: 0
        });
        
        setProjectIdeas(prev => [newIdea, ...prev]);
        updateContentTypeCount('project-ideas', projectIdeas.length + 1);
        showSuccessMessage('تم إضافة الفكرة بنجاح');
      }

      // Reset form and close modal
      resetProjectIdeaForm();
      setShowProjectIdeaModal(false);
      setEditingProjectIdea(null);
    } catch (error) {
      console.error('Error saving project idea:', error);
      setError('حدث خطأ أثناء حفظ الفكرة');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LEARNING RESOURCES FUNCTIONS ====================
  const resetResourceForm = () => {
    setResourceFormData({
      title: '',
      description: '',
      type: '',
      category: '',
      author: '',
      duration: '',
      difficulty: '',
      thumbnail: '',
      contentUrl: '',
      tags: [],
      featured: false,
      lessons: 0,
      certificate: false,
      fileSize: '',
      episodes: 0,
      downloadUrl: '',
      videoUrl: ''
    });
  };

  const handleAddResource = () => {
    resetResourceForm();
    setEditingResource(null);
    setShowResourceModal(true);
  };

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setResourceFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      author: resource.author,
      duration: resource.duration || '',
      difficulty: resource.difficulty || '',
      thumbnail: resource.thumbnail || '',
      contentUrl: resource.contentUrl || '',
      tags: resource.tags || [],
      featured: resource.featured || false,
      lessons: resource.lessons || 0,
      certificate: resource.certificate || false,
      fileSize: resource.fileSize || '',
      episodes: resource.episodes || 0,
      downloadUrl: resource.downloadUrl || '',
      videoUrl: resource.videoUrl || ''
    });
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المصدر؟')) {
      try {
        setIsLoading(true);
        await deleteLearningResource(id);
        setLearningResources(prev => prev.filter(resource => resource.id !== id));
        updateContentTypeCount('resources', learningResources.length - 1);
        showSuccessMessage('تم حذف المصدر بنجاح');
      } catch (error) {
        console.error('Error deleting learning resource:', error);
        setError('حدث خطأ أثناء حذف المصدر');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveResource = async () => {
    try {
      // Validate form
      if (!resourceFormData.title || !resourceFormData.description || 
          !resourceFormData.type || !resourceFormData.category || 
          !resourceFormData.author) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setIsLoading(true);

      if (editingResource) {
        // Update existing resource
        const updatedResource = await updateLearningResource(editingResource.id, {
          ...resourceFormData,
          // Preserve existing stats
          rating: editingResource.rating,
          views: editingResource.views,
          likes: editingResource.likes
        });
        
        setLearningResources(prev => 
          prev.map(resource => resource.id === editingResource.id ? updatedResource : resource)
        );
        showSuccessMessage('تم تحديث المصدر بنجاح');
      } else {
        // Create new resource
        const newResource = await createLearningResource({
          ...resourceFormData,
          rating: 4.5, // Default rating
          views: 0,
          likes: 0
        });
        
        setLearningResources(prev => [newResource, ...prev]);
        updateContentTypeCount('resources', learningResources.length + 1);
        showSuccessMessage('تم إضافة المصدر بنجاح');
      }

      // Reset form and close modal
      resetResourceForm();
      setShowResourceModal(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Error saving learning resource:', error);
      setError('حدث خطأ أثناء حفظ المصدر');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== STORE ITEMS FUNCTIONS ====================
  const resetStoreItemForm = () => {
    setStoreItemFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      features: [],
      tags: [],
      image: '',
      inStock: true,
      stockQuantity: 0,
      discount: 0,
      featured: false
    });
  };

  const handleAddStoreItem = () => {
    resetStoreItemForm();
    setEditingStoreItem(null);
    setShowStoreItemModal(true);
  };

  const handleEditStoreItem = (item: any) => {
    setEditingStoreItem(item);
    setStoreItemFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      originalPrice: item.originalPrice || 0,
      category: item.category,
      features: item.features || [],
      tags: item.tags || [],
      image: item.image,
      inStock: item.inStock !== undefined ? item.inStock : true,
      stockQuantity: item.stockQuantity || 0,
      discount: item.discount || 0,
      featured: item.featured || false
    });
    setShowStoreItemModal(true);
  };

  const handleDeleteStoreItem = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        setIsLoading(true);
        await deleteStoreItem(id);
        setStoreItems(prev => prev.filter(item => item.id !== id));
        updateContentTypeCount('store-items', storeItems.length - 1);
        showSuccessMessage('تم حذف المنتج بنجاح');
      } catch (error) {
        console.error('Error deleting store item:', error);
        setError('حدث خطأ أثناء حذف المنتج');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveStoreItem = async () => {
    try {
      // Validate form
      if (!storeItemFormData.name || !storeItemFormData.description || 
          !storeItemFormData.category || !storeItemFormData.image || 
          storeItemFormData.price <= 0) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setIsLoading(true);

      if (editingStoreItem) {
        // Update existing item
        const updatedItem = await updateStoreItem(editingStoreItem.id, {
          ...storeItemFormData,
          // Preserve existing stats
          rating: editingStoreItem.rating,
          reviews: editingStoreItem.reviews,
          views: editingStoreItem.views
        });
        
        setStoreItems(prev => 
          prev.map(item => item.id === editingStoreItem.id ? updatedItem : item)
        );
        showSuccessMessage('تم تحديث المنتج بنجاح');
      } else {
        // Create new item
        const newItem = await createStoreItem({
          ...storeItemFormData,
          rating: 4.5, // Default rating
          reviews: 0,
          views: 0
        });
        
        setStoreItems(prev => [newItem, ...prev]);
        updateContentTypeCount('store-items', storeItems.length + 1);
        showSuccessMessage('تم إضافة المنتج بنجاح');
      }

      // Reset form and close modal
      resetStoreItemForm();
      setShowStoreItemModal(false);
      setEditingStoreItem(null);
    } catch (error) {
      console.error('Error saving store item:', error);
      setError('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== USERS FUNCTIONS ====================
  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      school_id: '',
      grade: '',
      subject: '',
      avatar_url: '',
      phone: '',
      location: '',
      status: 'active'
    });
  };

  const handleAddUser = () => {
    resetUserForm();
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role,
      school_id: user.school_id || '',
      grade: user.grade || '',
      subject: user.subject || '',
      avatar_url: user.avatar || '',
      phone: user.phone || '',
      location: user.location || '',
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        setIsLoading(true);
        await deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
        updateContentTypeCount('users', users.length - 1);
        showSuccessMessage('تم حذف المستخدم بنجاح');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('حدث خطأ أثناء حذف المستخدم');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      // Validate form
      if (!userFormData.name || !userFormData.email || (!editingUser && !userFormData.password)) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setIsLoading(true);

      if (editingUser) {
        // Update existing user
        const updates = { ...userFormData };
        delete updates.password; // Don't update password unless specifically changing it
        delete updates.email; // Email can't be changed
        
        const updatedUser = await updateUser(editingUser.id, updates);
        
        setUsers(prev => 
          prev.map(user => user.id === editingUser.id ? { ...user, ...updatedUser } : user)
        );
        showSuccessMessage('تم تحديث المستخدم بنجاح');
      } else {
        // Create new user
        await registerUser(userFormData.email, userFormData.password, {
          name: userFormData.name,
          role: userFormData.role,
          school_id: userFormData.school_id,
          grade: userFormData.role === 'student' ? userFormData.grade : undefined,
          subject: userFormData.role === 'teacher' ? userFormData.subject : undefined
        });
        
        // Refresh users list
        const updatedUsers = await getUsers();
        setUsers(updatedUsers);
        updateContentTypeCount('users', updatedUsers.length);
        showSuccessMessage('تم إضافة المستخدم بنجاح');
      }

      // Reset form and close modal
      resetUserForm();
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      setError('حدث خطأ أثناء حفظ المستخدم');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search term
  const getFilteredItems = () => {
    switch (activeContentType) {
      case 'gallery':
        return projects.filter(project => 
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.students.some((student: string) => student.toLowerCase().includes(searchTerm.toLowerCase())) ||
          project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      case 'project-ideas':
        return projectIdeas.filter(idea => 
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'resources':
        return learningResources.filter(resource => 
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      case 'store-items':
        return storeItems.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      case 'users':
        return users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.school && user.school.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      default:
        return [];
    }
  };

  // Get the appropriate modal and form based on active content type
  const getAddEditModal = () => {
    switch (activeContentType) {
      case 'gallery':
        return showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingItem ? 'تعديل مشروع في المعرض' : 'إضافة مشروع جديد للمعرض'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان المشروع *
                    </label>
                    <input
                      type="text"
                      value={galleryFormData.title}
                      onChange={(e) => handleGalleryInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="أدخل عنوان المشروع"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف المشروع *
                    </label>
                    <textarea
                      value={galleryFormData.description}
                      onChange={(e) => handleGalleryInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="أدخل وصف المشروع"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المدرسة *
                    </label>
                    <input
                      type="text"
                      value={galleryFormData.school}
                      onChange={(e) => handleGalleryInputChange('school', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="أدخل اسم المدرسة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المعلم المشرف *
                    </label>
                    <input
                      type="text"
                      value={galleryFormData.teacher}
                      onChange={(e) => handleGalleryInputChange('teacher', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="أدخل اسم المعلم المشرف"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      فئة المشروع *
                    </label>
                    <select
                      value={galleryFormData.category}
                      onChange={(e) => handleGalleryInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الفيديو (اختياري)
                    </label>
                    <input
                      type="text"
                      value={galleryFormData.video}
                      onChange={(e) => handleGalleryInputChange('video', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="أدخل رابط الفيديو (YouTube أو Vimeo)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أسماء الطلاب المشاركين *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {galleryFormData.students.map((student, index) => (
                        <div key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {student}
                          <button 
                            onClick={() => handleGalleryRemoveArrayItem('students', index)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="student-input"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="أدخل اسم الطالب"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('student-input') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleStudentInputChange(input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags and Awards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوسوم
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {galleryFormData.tags.map((tag, index) => (
                        <div key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {tag}
                          <button 
                            onClick={() => handleGalleryRemoveArrayItem('tags', index)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="tag-input"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="أدخل وسم"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('tag-input') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleGalleryArrayInputChange('tags', input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الجوائز
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {galleryFormData.awards.map((award, index) => (
                        <div key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {award}
                          <button 
                            onClick={() => handleGalleryRemoveArrayItem('awards', index)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="award-input"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="أدخل اسم الجائزة"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('award-input') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleGalleryArrayInputChange('awards', input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صور المشروع *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {galleryFormData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`صورة ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleGalleryRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
                          <span className="text-sm text-gray-500">جاري الرفع...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">اختر صورة</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handleGalleryImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={galleryFormData.featured}
                    onChange={(e) => handleGalleryInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="featured" className="mr-2 text-sm font-medium text-gray-700">
                    تمييز المشروع (عرضه في قسم المشاريع المميزة)
                  </label>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleGallerySave}
                    disabled={uploading}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {editingItem ? 'تحديث' : 'حفظ'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      case 'project-ideas':
        return showProjectIdeaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingProjectIdea ? 'تعديل فكرة مشروع' : 'إضافة فكرة مشروع جديدة'}
                </h3>
                <button
                  onClick={() => {
                    setShowProjectIdeaModal(false);
                    setEditingProjectIdea(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان المشروع *
                    </label>
                    <input
                      type="text"
                      value={projectIdeaFormData.title}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان المشروع"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف المشروع *
                    </label>
                    <textarea
                      value={projectIdeaFormData.description}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل وصف المشروع"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      فئة المشروع *
                    </label>
                    <select
                      value={projectIdeaFormData.category}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموضوع/المادة *
                    </label>
                    <input
                      type="text"
                      value={projectIdeaFormData.subject}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'subject', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: الفيزياء، البرمجة، التسويق"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مستوى الصعوبة *
                    </label>
                    <select
                      value={projectIdeaFormData.difficulty}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر المستوى</option>
                      {difficulties.map(difficulty => (
                        <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدة المتوقعة *
                    </label>
                    <input
                      type="text"
                      value={projectIdeaFormData.duration}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'duration', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: 6-8 أسابيع"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة المشروع *
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                      {projectIdeaFormData.image && (
                        <div className="relative">
                          <img 
                            src={projectIdeaFormData.image} 
                            alt="صورة المشروع" 
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleInputChange(setProjectIdeaFormData, 'image', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <span className="text-sm text-gray-500">جاري الرفع...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">اختر صورة للمشروع</span>
                            <span className="text-xs text-gray-400 mt-1">أو أدخل رابط الصورة</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, setProjectIdeaFormData, 'image', true)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={projectIdeaFormData.image}
                      onChange={(e) => handleInputChange(setProjectIdeaFormData, 'image', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رابط الصورة"
                    />
                  </div>
                </div>

                {/* Objectives, Materials, and Steps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أهداف المشروع *
                  </label>
                  <div className="space-y-3">
                    {projectIdeaFormData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => handleArrayChange(setProjectIdeaFormData, 'objectives', index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`الهدف ${index + 1}`}
                        />
                        {projectIdeaFormData.objectives.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setProjectIdeaFormData, 'objectives', index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(setProjectIdeaFormData, 'objectives')}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة هدف جديد
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المواد والأدوات المطلوبة *
                  </label>
                  <div className="space-y-3">
                    {projectIdeaFormData.materials.map((material, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={material}
                          onChange={(e) => handleArrayChange(setProjectIdeaFormData, 'materials', index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`المادة ${index + 1}`}
                        />
                        {projectIdeaFormData.materials.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setProjectIdeaFormData, 'materials', index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(setProjectIdeaFormData, 'materials')}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة مادة جديدة
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خطوات تنفيذ المشروع *
                  </label>
                  <div className="space-y-3">
                    {projectIdeaFormData.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                          {index + 1}
                        </div>
                        <textarea
                          value={step}
                          onChange={(e) => handleArrayChange(setProjectIdeaFormData, 'steps', index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`الخطوة ${index + 1}`}
                          rows={2}
                        />
                        {projectIdeaFormData.steps.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setProjectIdeaFormData, 'steps', index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors mt-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(setProjectIdeaFormData, 'steps')}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة خطوة جديدة
                    </button>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="project-idea-featured"
                    checked={projectIdeaFormData.featured}
                    onChange={(e) => handleInputChange(setProjectIdeaFormData, 'featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="project-idea-featured" className="mr-2 text-sm font-medium text-gray-700">
                    تمييز الفكرة (عرضها في قسم الأفكار المميزة)
                  </label>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowProjectIdeaModal(false);
                      setEditingProjectIdea(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveProjectIdea}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingProjectIdea ? 'تحديث' : 'حفظ'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      case 'resources':
        return showResourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingResource ? 'تعديل مصدر تعليمي' : 'إضافة مصدر تعليمي جديد'}
                </h3>
                <button
                  onClick={() => {
                    setShowResourceModal(false);
                    setEditingResource(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان المصدر *
                    </label>
                    <input
                      type="text"
                      value={resourceFormData.title}
                      onChange={(e) => handleInputChange(setResourceFormData, 'title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل عنوان المصدر"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف المصدر *
                    </label>
                    <textarea
                      value={resourceFormData.description}
                      onChange={(e) => handleInputChange(setResourceFormData, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل وصف المصدر"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع المصدر *
                    </label>
                    <select
                      value={resourceFormData.type}
                      onChange={(e) => handleInputChange(setResourceFormData, 'type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">اختر النوع</option>
                      {resourceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة *
                    </label>
                    <select
                      value={resourceFormData.category}
                      onChange={(e) => handleInputChange(setResourceFormData, 'category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      <option value="project-management">إدارة المشاريع</option>
                      <option value="programming">البرمجة</option>
                      <option value="design">التصميم</option>
                      <option value="entrepreneurship">ريادة الأعمال</option>
                      <option value="stem">العلوم والتقنية</option>
                      <option value="soft-skills">المهارات الناعمة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المؤلف/المصدر *
                    </label>
                    <input
                      type="text"
                      value={resourceFormData.author}
                      onChange={(e) => handleInputChange(setResourceFormData, 'author', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل اسم المؤلف أو المصدر"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدة
                    </label>
                    <input
                      type="text"
                      value={resourceFormData.duration}
                      onChange={(e) => handleInputChange(setResourceFormData, 'duration', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="مثال: 15 دقيقة، 2 ساعة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مستوى الصعوبة
                    </label>
                    <select
                      value={resourceFormData.difficulty}
                      onChange={(e) => handleInputChange(setResourceFormData, 'difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">اختر المستوى</option>
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط المحتوى
                    </label>
                    <input
                      type="text"
                      value={resourceFormData.contentUrl}
                      onChange={(e) => handleInputChange(setResourceFormData, 'contentUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل رابط المحتوى"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الصورة المصغرة
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                      {resourceFormData.thumbnail && (
                        <div className="relative">
                          <img 
                            src={resourceFormData.thumbnail} 
                            alt="صورة مصغرة" 
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleInputChange(setResourceFormData, 'thumbnail', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                            <span className="text-sm text-gray-500">جاري الرفع...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">اختر صورة مصغرة</span>
                            <span className="text-xs text-gray-400 mt-1">أو أدخل رابط الصورة</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, setResourceFormData, 'thumbnail', true)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={resourceFormData.thumbnail}
                      onChange={(e) => handleInputChange(setResourceFormData, 'thumbnail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل رابط الصورة المصغرة"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوسوم
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {resourceFormData.tags.map((tag, index) => (
                      <div key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {tag}
                        <button 
                          onClick={() => handleRemoveArrayItem(setResourceFormData, 'tags', index)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="resource-tag-input"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل وسم"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('resource-tag-input') as HTMLInputElement;
                        if (input.value.trim()) {
                          handleArrayInputChange(setResourceFormData, 'tags', input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Type-specific fields */}
                {resourceFormData.type === 'course' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عدد الدروس
                      </label>
                      <input
                        type="number"
                        value={resourceFormData.lessons}
                        onChange={(e) => handleInputChange(setResourceFormData, 'lessons', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="أدخل عدد الدروس"
                        min="0"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="certificate"
                        checked={resourceFormData.certificate}
                        onChange={(e) => handleInputChange(setResourceFormData, 'certificate', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="certificate" className="mr-2 text-sm font-medium text-gray-700">
                        شهادة معتمدة
                      </label>
                    </div>
                  </div>
                )}

                {resourceFormData.type === 'template' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حجم الملف
                      </label>
                      <input
                        type="text"
                        value={resourceFormData.fileSize}
                        onChange={(e) => handleInputChange(setResourceFormData, 'fileSize', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="مثال: 2.5MB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رابط التحميل
                      </label>
                      <input
                        type="text"
                        value={resourceFormData.downloadUrl}
                        onChange={(e) => handleInputChange(setResourceFormData, 'downloadUrl', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="أدخل رابط التحميل"
                      />
                    </div>
                  </div>
                )}

                {resourceFormData.type === 'podcast' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الحلقات
                    </label>
                    <input
                      type="number"
                      value={resourceFormData.episodes}
                      onChange={(e) => handleInputChange(setResourceFormData, 'episodes', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل عدد الحلقات"
                      min="0"
                    />
                  </div>
                )}

                {resourceFormData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الفيديو
                    </label>
                    <input
                      type="text"
                      value={resourceFormData.videoUrl}
                      onChange={(e) => handleInputChange(setResourceFormData, 'videoUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="أدخل رابط الفيديو (YouTube أو Vimeo)"
                    />
                  </div>
                )}

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="resource-featured"
                    checked={resourceFormData.featured}
                    onChange={(e) => handleInputChange(setResourceFormData, 'featured', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="resource-featured" className="mr-2 text-sm font-medium text-gray-700">
                    تمييز المصدر (عرضه في قسم المصادر المميزة)
                  </label>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowResourceModal(false);
                      setEditingResource(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveResource}
                    disabled={isLoading}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingResource ? 'تحديث' : 'حفظ'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      case 'store-items':
        return showStoreItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingStoreItem ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </h3>
                <button
                  onClick={() => {
                    setShowStoreItemModal(false);
                    setEditingStoreItem(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      value={storeItemFormData.name}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف المنتج *
                    </label>
                    <textarea
                      value={storeItemFormData.description}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل وصف المنتج"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر *
                    </label>
                    <input
                      type="number"
                      value={storeItemFormData.price}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'price', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل سعر المنتج"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر الأصلي (قبل الخصم)
                    </label>
                    <input
                      type="number"
                      value={storeItemFormData.originalPrice}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'originalPrice', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل السعر الأصلي"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نسبة الخصم (%)
                    </label>
                    <input
                      type="number"
                      value={storeItemFormData.discount}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'discount', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل نسبة الخصم"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      فئة المنتج *
                    </label>
                    <select
                      value={storeItemFormData.category}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      {storeCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الكمية المتوفرة
                    </label>
                    <input
                      type="number"
                      value={storeItemFormData.stockQuantity}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'stockQuantity', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل الكمية المتوفرة"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة المنتج *
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                      {storeItemFormData.image && (
                        <div className="relative">
                          <img 
                            src={storeItemFormData.image} 
                            alt="صورة المنتج" 
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleInputChange(setStoreItemFormData, 'image', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                            <span className="text-sm text-gray-500">جاري الرفع...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">اختر صورة للمنتج</span>
                            <span className="text-xs text-gray-400 mt-1">أو أدخل رابط الصورة</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, setStoreItemFormData, 'image', true)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={storeItemFormData.image}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'image', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="أدخل رابط صورة المنتج"
                    />
                  </div>
                </div>

                {/* Features and Tags */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ميزات المنتج
                    </label>
                    <div className="space-y-3">
                      {storeItemFormData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleArrayChange(setStoreItemFormData, 'features', index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={`الميزة ${index + 1}`}
                          />
                          <button
                            onClick={() => removeArrayItem(setStoreItemFormData, 'features', index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem(setStoreItemFormData, 'features')}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة ميزة جديدة
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوسوم
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {storeItemFormData.tags.map((tag, index) => (
                        <div key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {tag}
                          <button 
                            onClick={() => handleRemoveArrayItem(setStoreItemFormData, 'tags', index)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="store-tag-input"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="أدخل وسم"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('store-tag-input') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleArrayInputChange(setStoreItemFormData, 'tags', input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock and Featured */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={storeItemFormData.inStock}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'inStock', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="in-stock" className="mr-2 text-sm font-medium text-gray-700">
                      متوفر في المخزون
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="store-featured"
                      checked={storeItemFormData.featured}
                      onChange={(e) => handleInputChange(setStoreItemFormData, 'featured', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="store-featured" className="mr-2 text-sm font-medium text-gray-700">
                      تمييز المنتج (عرضه في قسم المنتجات المميزة)
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowStoreItemModal(false);
                      setEditingStoreItem(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveStoreItem}
                    disabled={isLoading}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingStoreItem ? 'تحديث' : 'حفظ'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      case 'users':
        return showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                </h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      value={userFormData.name}
                      onChange={(e) => handleInputChange(setUserFormData, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => handleInputChange(setUserFormData, 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل البريد الإلكتروني"
                      disabled={!!editingUser} // Can't change email for existing users
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {editingUser ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور *'}
                    </label>
                    <input
                      type="password"
                      value={userFormData.password}
                      onChange={(e) => handleInputChange(setUserFormData, 'password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingUser ? 'اتركها فارغة للإبقاء على الحالية' : 'أدخل كلمة المرور'}
                      required={!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الحساب *
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => handleInputChange(setUserFormData, 'role', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!!editingUser} // Can't change role for existing users
                    >
                      {userRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  {userFormData.role !== 'school' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المدرسة
                      </label>
                      <select
                        value={userFormData.school_id}
                        onChange={(e) => handleInputChange(setUserFormData, 'school_id', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر المدرسة</option>
                        <option value="school-1">مدرسة الملك عبدالعزيز</option>
                        <option value="school-2">مدرسة الأمير محمد</option>
                        <option value="school-3">مدرسة التميز الأهلية</option>
                      </select>
                    </div>
                  )}

                  {userFormData.role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الصف الدراسي
                      </label>
                      <select
                        value={userFormData.grade}
                        onChange={(e) => handleInputChange(setUserFormData, 'grade', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر الصف</option>
                        <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                        <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                        <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                      </select>
                    </div>
                  )}

                  {userFormData.role === 'teacher' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التخصص
                      </label>
                      <input
                        type="text"
                        value={userFormData.subject}
                        onChange={(e) => handleInputChange(setUserFormData, 'subject', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="مثال: الرياضيات، العلوم، اللغة العربية"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => handleInputChange(setUserFormData, 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموقع
                    </label>
                    <input
                      type="text"
                      value={userFormData.location}
                      onChange={(e) => handleInputChange(setUserFormData, 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل الموقع"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الحساب
                    </label>
                    <select
                      value={userFormData.status}
                      onChange={(e) => handleInputChange(setUserFormData, 'status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                      <option value="suspended">موقوف</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة المستخدم
                    </label>
                    <div className="flex items-center gap-4 mb-2">
                      {userFormData.avatar_url && (
                        <div className="relative">
                          <img 
                            src={userFormData.avatar_url} 
                            alt="صورة المستخدم" 
                            className="w-32 h-32 object-cover rounded-full"
                          />
                          <button
                            onClick={() => handleInputChange(setUserFormData, 'avatar_url', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <span className="text-sm text-gray-500">جاري الرفع...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">اختر صورة للمستخدم</span>
                            <span className="text-xs text-gray-400 mt-1">أو أدخل رابط الصورة</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, setUserFormData, 'avatar_url', true)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={userFormData.avatar_url}
                      onChange={(e) => handleInputChange(setUserFormData, 'avatar_url', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رابط صورة المستخدم"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveUser}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingUser ? 'تحديث' : 'حفظ'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة المحتوى</h1>
              <p className="opacity-90">نظام إدارة محتوى المنصة الشامل</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all duration-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              تصدير
            </button>
            <button 
              onClick={() => {
                switch (activeContentType) {
                  case 'gallery':
                    setEditingItem(null);
                    setGalleryFormData({
                      title: '',
                      description: '',
                      school: '',
                      teacher: '',
                      students: [],
                      category: '',
                      tags: [],
                      awards: [],
                      images: [],
                      video: '',
                      featured: false
                    });
                    setShowAddModal(true);
                    break;
                  case 'project-ideas':
                    handleAddProjectIdea();
                    break;
                  case 'resources':
                    handleAddResource();
                    break;
                  case 'store-items':
                    handleAddStoreItem();
                    break;
                  case 'users':
                    handleAddUser();
                    break;
                  default:
                    break;
                }
              }}
              className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة محتوى
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{contentTypesWithCount.reduce((sum, type) => sum + type.count, 0)}</div>
            <div className="text-sm opacity-80">إجمالي العناصر</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{contentTypesWithCount.length}</div>
            <div className="text-sm opacity-80">أنواع المحتوى</div>
          </div>
          <div>
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm opacity-80">معدل النشر</div>
          </div>
          <div>
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm opacity-80">إدارة مستمرة</div>
          </div>
        </div>
      </motion.div>

      {/* Success and Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Content Types Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">أنواع المحتوى</h3>
            <nav className="space-y-2">
              {contentTypesWithCount.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveContentType(type.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    activeContentType === type.id
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <type.icon className="w-5 h-5" />
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeContentType === type.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                  }`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Content Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {contentTypesWithCount.find(t => t.id === activeContentType)?.name}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    switch (activeContentType) {
                      case 'gallery':
                        setEditingItem(null);
                        setGalleryFormData({
                          title: '',
                          description: '',
                          school: '',
                          teacher: '',
                          students: [],
                          category: '',
                          tags: [],
                          awards: [],
                          images: [],
                          video: '',
                          featured: false
                        });
                        setShowAddModal(true);
                        break;
                      case 'project-ideas':
                        handleAddProjectIdea();
                        break;
                      case 'resources':
                        handleAddResource();
                        break;
                      case 'store-items':
                        handleAddStoreItem();
                        break;
                      case 'users':
                        handleAddUser();
                        break;
                      default:
                        break;
                    }
                  }}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة جديد
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المحتوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {activeContentType === 'gallery' && (
                  <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>جميع الفئات</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                )}
                {activeContentType === 'project-ideas' && (
                  <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>جميع الفئات</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                )}
                {activeContentType === 'resources' && (
                  <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>جميع الأنواع</option>
                    {resourceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                )}
                {activeContentType === 'store-items' && (
                  <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>جميع الفئات</option>
                    {storeCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                )}
                {activeContentType === 'users' && (
                  <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>جميع الأنواع</option>
                    {userRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                )}
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-800 font-medium">
                    تم تحديد {selectedItems.length} عنصر
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('feature')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                    >
                      تمييز
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      أرشفة
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {(isLoading || galleryLoading) && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* Gallery Projects List */}
            {activeContentType === 'gallery' && !isLoading && !galleryLoading && (
              <div className="space-y-4">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(project.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, project.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== project.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={project.images[0]} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                              {project.featured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  مميز
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getCategoryText(project.category)}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {project.teacher}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(project.completedAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {project.views.toLocaleString()} مشاهدة
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {project.rating}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGalleryEdit(project)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleGalleryDelete(project.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GalleryVertical className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد مشاريع</h3>
                    <p className="text-gray-600 mb-4">لم يتم إضافة أي مشاريع للمعرض بعد</p>
                    <button 
                      onClick={() => {
                        setEditingItem(null);
                        setGalleryFormData({
                          title: '',
                          description: '',
                          school: '',
                          teacher: '',
                          students: [],
                          category: '',
                          tags: [],
                          awards: [],
                          images: [],
                          video: '',
                          featured: false
                        });
                        setShowAddModal(true);
                      }}
                      className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة مشروع جديد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Project Ideas List */}
            {activeContentType === 'project-ideas' && !isLoading && (
              <div className="space-y-4">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((idea) => (
                    <div key={idea.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(idea.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, idea.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== idea.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={idea.image} 
                              alt={idea.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{idea.title}</h3>
                              {idea.featured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  مميز
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getCategoryText(idea.category)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                idea.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                idea.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {idea.difficulty === 'beginner' ? 'مبتدئ' :
                                 idea.difficulty === 'intermediate' ? 'متوسط' :
                                 'متقدم'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{idea.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {idea.subject}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {idea.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {idea.views.toLocaleString()} مشاهدة
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {idea.downloads} تحميل
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProjectIdea(idea)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteProjectIdea(idea.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد أفكار مشاريع</h3>
                    <p className="text-gray-600 mb-4">لم يتم إضافة أي أفكار مشاريع بعد</p>
                    <button 
                      onClick={handleAddProjectIdea}
                      className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة فكرة مشروع جديدة
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Learning Resources List */}
            {activeContentType === 'resources' && !isLoading && (
              <div className="space-y-4">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((resource) => (
                    <div key={resource.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(resource.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, resource.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== resource.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={resource.thumbnail || "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"} 
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{resource.title}</h3>
                              {resource.featured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  مميز
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {resourceTypes.find(t => t.id === resource.type)?.name || resource.type}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {resource.author}
                              </div>
                              {resource.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {resource.duration}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {resource.views.toLocaleString()} مشاهدة
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {resource.rating}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditResource(resource)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد مصادر تعليمية</h3>
                    <p className="text-gray-600 mb-4">لم يتم إضافة أي مصادر تعليمية بعد</p>
                    <button 
                      onClick={handleAddResource}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة مصدر تعليمي جديد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Store Items List */}
            {activeContentType === 'store-items' && !isLoading && (
              <div className="space-y-4">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, item.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                              {item.featured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  مميز
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {storeCategories.find(c => c.id === item.category)?.name || item.category}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.inStock ? 'متوفر' : 'غير متوفر'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="font-bold text-purple-600">{item.price} ر.س</div>
                              {item.originalPrice > 0 && (
                                <div className="text-gray-400 line-through">{item.originalPrice} ر.س</div>
                              )}
                              {item.discount > 0 && (
                                <div className="text-red-600">خصم {item.discount}%</div>
                              )}
                              <div className="text-gray-500">
                                <Eye className="w-4 h-4 inline mr-1" />
                                {item.views} مشاهدة
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditStoreItem(item)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteStoreItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد منتجات</h3>
                    <p className="text-gray-600 mb-4">لم يتم إضافة أي منتجات للمتجر بعد</p>
                    <button 
                      onClick={handleAddStoreItem}
                      className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة منتج جديد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Users List */}
            {activeContentType === 'users' && !isLoading && (
              <div className="space-y-4">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...prev, user.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== user.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                                user.role === 'school' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.role === 'student' ? 'طالب' :
                                 user.role === 'teacher' ? 'معلم' :
                                 user.role === 'school' ? 'مدرسة' :
                                 'مدير'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.status === 'active' ? 'نشط' :
                                 user.status === 'inactive' ? 'غير نشط' :
                                 'موقوف'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </div>
                              {user.school && (
                                <div className="flex items-center gap-1">
                                  <Book className="w-4 h-4" />
                                  {user.school}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {user.role === 'student' && (
                                <>
                                  <div>الصف: {user.grade || 'غير محدد'}</div>
                                  <div>المشاريع: {user.projectsCount || 0}</div>
                                </>
                              )}
                              {user.role === 'teacher' && (
                                <>
                                  <div>التخصص: {user.subject || 'غير محدد'}</div>
                                  <div>الطلاب: {user.studentsCount || 0}</div>
                                </>
                              )}
                              {user.role === 'school' && (
                                <>
                                  <div>النوع: {user.type || 'غير محدد'}</div>
                                  <div>المعلمين: {user.teachersCount || 0}</div>
                                  <div>الطلاب: {user.studentsCount || 0}</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا يوجد مستخدمين</h3>
                    <p className="text-gray-600 mb-4">لم يتم العثور على مستخدمين يطابقون معايير البحث</p>
                    <button 
                      onClick={handleAddUser}
                      className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة مستخدم جديد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Other content types would have similar layouts */}
            {(activeContentType === 'consultants' || 
              activeContentType === 'categories' || 
              activeContentType === 'settings') && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SettingsIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">قيد التطوير</h3>
                <p className="text-gray-600">إدارة {contentTypesWithCount.find(t => t.id === activeContentType)?.name} ستكون متاحة قريباً</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modals */}
      {getAddEditModal()}
    </div>
  );
};