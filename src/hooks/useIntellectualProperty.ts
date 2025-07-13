import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export interface IntellectualProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  student: {
    id: string;
    name: string;
    avatar: string;
    school: string;
  };
  project: {
    id: string;
    title: string;
  } | null;
  submittedAt: string;
  reviewedAt?: string;
  documents: Array<{ name: string; size: string }>;
  tags: string[];
  certificateNumber?: string;
  rejectionReason?: string;
  estimatedReviewDate?: string;
}

export const useIntellectualProperty = () => {
  const [intellectualProperties, setIntellectualProperties] = useState<IntellectualProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchIntellectualProperties = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const ipRef = collection(db, 'intellectual_property');
      let q;
      
      if (user.role === 'student') {
        q = query(ipRef, where('student_id', '==', user.id));
      } else if (user.role === 'teacher') {
        // Teachers can see IP from their students
        const studentsRef = collection(db, 'users');
        const studentsQuery = query(
          studentsRef, 
          where('role', '==', 'student'),
          where('school_id', '==', user.school_id)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentIds = studentsSnapshot.docs.map(doc => doc.id);
        
        if (studentIds.length > 0) {
          q = query(ipRef, where('student_id', 'in', studentIds));
        } else {
          setIntellectualProperties([]);
          setLoading(false);
          return;
        }
      } else {
        // Admin can see all
        q = ipRef;
      }
      
      const snapshot = await getDocs(q);
      
      const ipData = await Promise.all(snapshot.docs.map(async (ipDoc) => {
        const data = ipDoc.data();
        
        // Get student info
        let studentInfo = {
          id: data.student_id,
          name: 'طالب غير معروف',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          school: 'مدرسة غير معروفة'
        };
        
        if (data.student_id) {
          const studentDocRef = doc(db, 'users', data.student_id);
          const studentDoc = await getDoc(studentDocRef);
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            studentInfo.name = studentData.name;
            studentInfo.avatar = studentData.avatar_url || studentInfo.avatar;
            
            // Get school name
            if (studentData.school_id) {
              const schoolDocRef = doc(db, 'schools', studentData.school_id);
              const schoolDoc = await getDoc(schoolDocRef);
              if (schoolDoc.exists()) {
                studentInfo.school = schoolDoc.data().name;
              }
            }
          }
        }
        
        // Get project info
        let projectInfo = null;
        if (data.project_id) {
          const projectDocRef = doc(db, 'projects', data.project_id);
          const projectDoc = await getDoc(projectDocRef);
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            projectInfo = {
              id: projectDoc.id,
              title: projectData.title
            };
          }
        }
        
        return {
          id: ipDoc.id,
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          student: studentInfo,
          project: projectInfo,
          submittedAt: data.submitted_at ? new Date(data.submitted_at.toDate()).toISOString() : new Date().toISOString(),
          reviewedAt: data.reviewed_at ? new Date(data.reviewed_at.toDate()).toISOString() : undefined,
          documents: data.documents || [],
          tags: data.tags || [],
          certificateNumber: data.certificate_number,
          rejectionReason: data.rejection_reason,
          estimatedReviewDate: data.estimated_review_date ? new Date(data.estimated_review_date.toDate()).toISOString() : undefined
        };
      }));
      
      setIntellectualProperties(ipData);
    } catch (err) {
      console.error('Error fetching intellectual properties:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل طلبات الملكية الفكرية');
    } finally {
      setLoading(false);
    }
  };

  const createIntellectualProperty = async (ipData: Partial<IntellectualProperty>) => {
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    try {
      const ipRef = collection(db, 'intellectual_property');
      const newIp = {
        student_id: user.id,
        project_id: ipData.project?.id,
        title: ipData.title,
        description: ipData.description,
        type: ipData.type,
        status: 'pending',
        documents: ipData.documents || [],
        tags: ipData.tags || [],
        submitted_at: serverTimestamp(),
        estimated_review_date: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
      };
      
      const docRef = await addDoc(ipRef, newIp);
      await fetchIntellectualProperties();
      
      return { id: docRef.id, ...newIp };
    } catch (err) {
      console.error('Error creating intellectual property:', err);
      throw err;
    }
  };

  const updateIntellectualProperty = async (id: string, updates: Partial<IntellectualProperty>) => {
    try {
      const ipRef = doc(db, 'intellectual_property', id);
      const updateData: any = {};
      
      if (updates.status) {
        updateData.status = updates.status;
        if (updates.status === 'approved') {
          updateData.reviewed_at = serverTimestamp();
          if (updates.certificateNumber) {
            updateData.certificate_number = updates.certificateNumber;
          }
        } else if (updates.status === 'rejected') {
          updateData.reviewed_at = serverTimestamp();
          if (updates.rejectionReason) {
            updateData.rejection_reason = updates.rejectionReason;
          }
        }
      }
      
      if (updates.documents) updateData.documents = updates.documents;
      if (updates.tags) updateData.tags = updates.tags;
      
      await updateDoc(ipRef, updateData);
      await fetchIntellectualProperties();
    } catch (err) {
      console.error('Error updating intellectual property:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchIntellectualProperties();
    }
  }, [user]);

  return {
    intellectualProperties,
    loading,
    error,
    fetchIntellectualProperties,
    createIntellectualProperty,
    updateIntellectualProperty
  };
};