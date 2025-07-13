import { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface GalleryProject {
  id: string;
  title: string;
  description: string;
  category: string;
  students: string[];
  school: string;
  teacher: string;
  completedAt: string;
  rating: number;
  views: number;
  likes: number;
  images: string[];
  video?: string;
  tags: string[];
  awards?: string[];
  featured?: boolean;
}

export const useGallery = () => {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleryProjects = async () => {
    try {
      setLoading(true);
      
      // Get gallery projects from Firestore
      const galleryRef = collection(db, 'gallery_projects');
      const q = query(galleryRef, orderBy('created_at', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      
      const galleryProjects: GalleryProject[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'مشروع بدون عنوان',
          description: data.description || 'لا يوجد وصف',
          category: data.category || 'عام',
          students: data.students || [],
          school: data.school || 'مدرسة غير معروفة',
          teacher: data.teacher || 'معلم غير معروف',
          completedAt: data.completed_at ? new Date(data.completed_at.toDate()).toISOString() : new Date().toISOString(),
          rating: data.rating || 4.5,
          views: data.views || 0,
          likes: data.likes || 0,
          images: data.images || ['https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600'],
          video: data.video,
          tags: data.tags || [],
          awards: data.awards || [],
          featured: data.featured || false
        };
      });
      
      setProjects(galleryProjects);
    } catch (err) {
      console.error('Error fetching gallery projects:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل معرض المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (id: string) => {
    try {
      const projectRef = doc(db, 'gallery_projects', id);
      await updateDoc(projectRef, {
        views: increment(1)
      });
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === id ? { ...project, views: project.views + 1 } : project
        )
      );
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const incrementLikes = async (id: string) => {
    try {
      const projectRef = doc(db, 'gallery_projects', id);
      await updateDoc(projectRef, {
        likes: increment(1)
      });
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === id ? { ...project, likes: project.likes + 1 } : project
        )
      );
    } catch (err) {
      console.error('Error incrementing likes:', err);
    }
  };

  const addGalleryProject = async (projectData: Partial<GalleryProject>) => {
    try {
      // Upload images if they are File objects
      let imageUrls = projectData.images || [];
      
      // Add the project to Firestore
      const galleryRef = collection(db, 'gallery_projects');
      const docRef = await addDoc(galleryRef, {
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        students: projectData.students,
        school: projectData.school,
        teacher: projectData.teacher,
        completed_at: serverTimestamp(),
        rating: projectData.rating || 4.5,
        views: 0,
        likes: 0,
        images: imageUrls,
        video: projectData.video,
        tags: projectData.tags || [],
        awards: projectData.awards || [],
        featured: projectData.featured || false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      // Get the new project with its ID
      const newProject: GalleryProject = {
        id: docRef.id,
        title: projectData.title || 'مشروع بدون عنوان',
        description: projectData.description || 'لا يوجد وصف',
        category: projectData.category || 'عام',
        students: projectData.students || [],
        school: projectData.school || 'مدرسة غير معروفة',
        teacher: projectData.teacher || 'معلم غير معروف',
        completedAt: new Date().toISOString(),
        rating: projectData.rating || 4.5,
        views: 0,
        likes: 0,
        images: imageUrls,
        video: projectData.video,
        tags: projectData.tags || [],
        awards: projectData.awards || [],
        featured: projectData.featured || false
      };
      
      // Add to local state
      setProjects(prev => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      console.error('Error adding gallery project:', err);
      throw err;
    }
  };

  const updateGalleryProject = async (id: string, projectData: Partial<GalleryProject>) => {
    try {
      const projectRef = doc(db, 'gallery_projects', id);
      
      // Update the document in Firestore
      await updateDoc(projectRef, {
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        students: projectData.students,
        school: projectData.school,
        teacher: projectData.teacher,
        images: projectData.images,
        video: projectData.video,
        tags: projectData.tags,
        awards: projectData.awards,
        featured: projectData.featured,
        updated_at: serverTimestamp()
      });
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === id ? { ...project, ...projectData } : project
        )
      );
      
      return { id, ...projectData };
    } catch (err) {
      console.error('Error updating gallery project:', err);
      throw err;
    }
  };

  const deleteGalleryProject = async (id: string) => {
    try {
      const projectRef = doc(db, 'gallery_projects', id);
      await deleteDoc(projectRef);
      
      // Update local state
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting gallery project:', err);
      throw err;
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGalleryProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchGalleryProjects,
    incrementViews,
    incrementLikes,
    addGalleryProject,
    updateGalleryProject,
    deleteGalleryProject,
    uploadImage
  };
};