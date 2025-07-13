import { useState, useEffect } from 'react';
import { 
  getProjects, 
  getProjectsByTeacherId, 
  getProjectsBySchoolId,
  getProjectsByStudentId,
  getProjectStudents,
  getProjectTasks,
  createProject as createFirebaseProject,
  updateProject as updateFirebaseProject,
  deleteProject as deleteFirebaseProject,
  addStudentToProject,
  removeStudentFromProject
} from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  difficulty: string;
  duration: string;
  objectives: string[];
  materials: string[];
  steps: string[];
  teacher_id: string;
  school_id: string;
  status: string;
  progress: number;
  max_students: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  students?: any[];
  tasks?: any[];
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) {
      console.log('No user found, skipping project fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching projects for user:', {
        id: user.id,
        role: user.role,
        school_id: user.school_id
      });
      
      let userProjects: Project[] = [];

      // Simple logic based on user role
      if (user.role === 'teacher') {
        console.log('Fetching projects for teacher with ID:', user.id);
        
        // First, get projects where the teacher is assigned
        const teacherProjects = await getProjectsByTeacherId(user.id) as Project[];
        console.log('Teacher assigned projects fetched:', teacherProjects.length);
        
        // Then, get draft projects from the teacher's school
        const schoolDraftProjectsQuery = query(
          collection(db, 'projects'),
          where('school_id', '==', user.school_id),
          where('status', '==', 'draft')
        );
        
        const schoolDraftProjectsSnapshot = await getDocs(schoolDraftProjectsQuery);
        const schoolDraftProjects = schoolDraftProjectsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
            created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
            updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
          };
        });
        
        console.log('School draft projects fetched:', schoolDraftProjects.length);
        
        // Combine both sets of projects, ensuring no duplicates
        const projectMap = new Map();
        
        // Add teacher's assigned projects
        teacherProjects.forEach(project => {
          projectMap.set(project.id, project);
        });
        
        // Add school's draft projects
        schoolDraftProjects.forEach(project => {
          if (!projectMap.has(project.id)) {
            projectMap.set(project.id, project);
          }
        });
        
        // Convert map back to array
        userProjects = Array.from(projectMap.values());
        console.log('Combined unique projects:', userProjects.length);
        
      } else if (user.role === 'student') {
        console.log('Fetching projects for student with ID:', user.id);
        userProjects = await getProjectsByStudentId(user.id) as Project[];
        console.log('Student projects fetched:', userProjects.length);
      } else if (user.role === 'school') {
        // For school users, use their Firebase Auth UID to find their school document
        // Then fetch projects using that school's ID
        console.log('Fetching projects for school user with Firebase UID:', user.id);
        
        // The school_id should be the document ID of the school in the schools collection
        // For school users, their Firebase Auth UID should match a document in the schools collection
        userProjects = await getProjectsBySchoolId(user.id) as Project[];
        console.log('School projects fetched:', userProjects.length);
      } else if (user.role === 'admin') {
        console.log('Fetching all projects for admin user');
        userProjects = await getProjects() as Project[];
        console.log('All projects fetched:', userProjects.length);
      }

      console.log('Raw projects data:', userProjects);

      // Enhance projects with students and tasks
      const enhancedProjects = await Promise.all(
        userProjects.map(async (project) => {
          try {
            const students = await getProjectStudents(project.id);
            const tasks = await getProjectTasks(project.id);
            
            // Fetch the project evaluation to get the completion score
            let progress = 0; // Default progress value
            
            try {
              // Query the project_evaluations collection for this project
              const evaluationsRef = collection(db, 'project_evaluations');
              const q = query(evaluationsRef, where('projectId', '==', project.id));
              const evaluationsSnapshot = await getDocs(q);
              
              if (!evaluationsSnapshot.empty) {
                // Get the first evaluation document
                const evaluationDoc = evaluationsSnapshot.docs[0];
                const evaluationData = evaluationDoc.data();
                
                // Find the completion criterion (first criterion)
                if (evaluationData.criteria && evaluationData.criteria.length > 0) {
                  // Get the score from the first criterion (completion criterion)
                  progress = evaluationData.criteria[0].score || 0;
                  console.log(`Found evaluation for project ${project.id}, completion score:`, progress);
                }
              } else {
                console.log(`No evaluation found for project ${project.id}, using default progress:`, progress);
              }
            } catch (evalError) {
              console.error(`Error fetching evaluation for project ${project.id}:`, evalError);
            }
            
            return {
              ...project,
              progress,
              students,
              tasks
            };
          } catch (err) {
            console.error('Error enhancing project:', project.id, err);
            return {
              ...project,
              progress: 0,
              students: [],
              tasks: []
            };
          }
        })
      );

      console.log('Enhanced projects:', enhancedProjects);
      setProjects(enhancedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>) => {
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    try {
      // For school users, use their Firebase UID as the school_id
      const schoolId = user.role === 'school' ? user.id : user.school_id;
      
      // Ensure progress starts at 0
      const newProject = await createFirebaseProject({
        ...projectData,
        teacher_id: user.role === 'teacher' ? user.id : null, // Only set teacher_id if user is a teacher
        school_id: schoolId,
        progress: 0 // Set initial progress to 0
      });

      // Add students to the project if provided
      if (projectData.selectedStudentIds && projectData.selectedStudentIds.length > 0) {
        for (let i = 0; i < projectData.selectedStudentIds.length; i++) {
          const studentId = projectData.selectedStudentIds[i];
          await addStudentToProject({
            project_id: newProject.id,
            student_id: studentId,
            role: i === 0 ? 'leader' : 'member'
          });
        }
      }

      await fetchProjects();
      return newProject;
    } catch (err) {
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateFirebaseProject(id, updates);

      // Update students if provided
      if (updates.selectedStudentIds) {
        // Get current students
        const currentStudents = await getProjectStudents(id);
        
        // Remove students not in the new list
        for (const student of currentStudents) {
          if (!updates.selectedStudentIds.includes(student.student_id)) {
            await removeStudentFromProject(id, student.student_id);
          }
        }
        
        // Add new students
        for (let i = 0; i < updates.selectedStudentIds.length; i++) {
          const studentId = updates.selectedStudentIds[i];
          const existingStudent = currentStudents.find(s => s.student_id === studentId);
          
          if (!existingStudent) {
            await addStudentToProject({
              project_id: id,
              student_id: studentId,
              role: i === 0 ? 'leader' : 'member'
            });
          }
        }
      }

      await fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const archiveProject = async (id: string) => {
    try {
      await updateFirebaseProject(id, { status: 'archived' });
      await fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteFirebaseProject(id);
      await fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
  };
};