import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  school?: string;
  school_id?: string;
  grade?: string;
  subject?: string;
  experience?: string;
  joinedAt: string;
  lastActive: string;
  projectsCount?: number;
  completedProjects?: number;
  studentsCount?: number;
  teachersCount?: number;
  status: string;
  location?: string;
  department?: string;
  permissions?: string[];
  type?: string;
  establishedYear?: string;
  certifications?: string[];
  phone?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      let q;
      
      if (user.role === 'admin') {
        // Admins can see all users
        q = query(usersRef, orderBy('created_at', 'desc'), limit(50));
      } else if (user.role === 'school' && user.id) {
        // Schools can see their teachers and students
        q = query(usersRef, where('school_id', '==', user.id), limit(50));
      } else if (user.role === 'teacher' && user.school_id) {
        // Teachers can see students in their school
        q = query(
          usersRef, 
          where('school_id', '==', user.school_id),
          where('role', '==', 'student'),
          limit(50)
        );
      } else {
        // Students can't see other users
        setUsers([]);
        setLoading(false);
        return;
      }
      
      const snapshot = await getDocs(q);
      
      const usersData = await Promise.all(snapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        
        // Get school name if school_id exists
        let schoolName;
        if (userData.school_id) {
          const schoolDoc = await getDoc(doc(db, 'schools', userData.school_id));
          if (schoolDoc.exists()) {
            schoolName = schoolDoc.data().name;
          }
        }
        
        // Get projects count
        let projectsCount = 0;
        let completedProjects = 0;
        
        if (userData.role === 'student') {
          const projectStudentsRef = collection(db, 'project_students');
          const projectStudentsQuery = query(projectStudentsRef, where('student_id', '==', userDoc.id));
          const projectStudentsSnapshot = await getDocs(projectStudentsQuery);
          
          const projectIds = projectStudentsSnapshot.docs.map(doc => doc.data().project_id);
          
          if (projectIds.length > 0) {
            const projectsRef = collection(db, 'projects');
            const projectsQuery = query(projectsRef, where('__name__', 'in', projectIds));
            const projectsSnapshot = await getDocs(projectsQuery);
            
            projectsCount = projectsSnapshot.size;
            completedProjects = projectsSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
          }
        } else if (userData.role === 'teacher') {
          const projectsRef = collection(db, 'projects');
          const projectsQuery = query(projectsRef, where('teacher_id', '==', userDoc.id));
          const projectsSnapshot = await getDocs(projectsQuery);
          
          projectsCount = projectsSnapshot.size;
          
          // Get students count for teacher
          const studentsRef = collection(db, 'users');
          const studentsQuery = query(
            studentsRef, 
            where('role', '==', 'student'),
            where('school_id', '==', userData.school_id)
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          
          userData.studentsCount = studentsSnapshot.size;
        }
        
        return {
          id: userDoc.id,
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'student',
          avatar: userData.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          school: schoolName,
          school_id: userData.school_id,
          grade: userData.grade,
          subject: userData.subject,
          experience: userData.experience_years ? `${userData.experience_years} سنوات` : undefined,
          joinedAt: userData.created_at ? new Date(userData.created_at.toDate()).toISOString() : new Date().toISOString(),
          lastActive: userData.last_active_at ? new Date(userData.last_active_at.toDate()).toISOString() : new Date().toISOString(),
          projectsCount,
          completedProjects,
          studentsCount: userData.studentsCount,
          teachersCount: userData.teachersCount,
          status: userData.status || 'active',
          location: userData.location || 'غير محدد',
          department: userData.department,
          permissions: userData.permissions,
          type: userData.type,
          establishedYear: userData.established_year,
          certifications: userData.certifications,
          phone: userData.phone
        };
      }));
      
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    error,
    fetchUsers
  };
};