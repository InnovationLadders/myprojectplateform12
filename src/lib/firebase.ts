import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableNetwork, 
  disableNetwork, 
  collection, 
  getDocs, 
  getDoc,
  doc as firestoreDoc,
  query, 
  where, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { SummerProgramRegistrationData } from '../types/summerProgram';

// Use environment variables if available, otherwise use these hardcoded values as fallback
// This ensures the app works even if environment variables aren't properly loaded
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKlDIhgAIPif3q2J4TAyVSBpdrUQ2P1G8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-project-plateform-react.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-project-plateform-react",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-project-plateform-react.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1092300975970",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1092300975970:web:76e0d3717dbf899c7b463b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S28HDNJNMH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the doc function with consistent alias
export { firestoreDoc };

// Connect to emulators if in development mode and emulators are enabled
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (useEmulators && import.meta.env.DEV) {
  try {
    // Connect to Auth emulator
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    
    // Connect to Firestore emulator
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Connect to Storage emulator
    if (!storage._delegate._host.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
  }
} else {
  console.log('Using production Firebase services');
}

// Handle network connectivity for Firestore with better error handling
let isOnline = navigator.onLine;

const handleOnline = async () => {
  if (!isOnline) {
    isOnline = true;
    try {
      await enableNetwork(db);
      console.log('Firestore network enabled - back online');
    } catch (error) {
      console.warn('Failed to enable Firestore network:', error);
    }
  }
};

const handleOffline = async () => {
  if (isOnline) {
    isOnline = false;
    try {
      await disableNetwork(db);
      console.log('Firestore network disabled - operating offline');
    } catch (error) {
      console.warn('Failed to disable Firestore network:', error);
    }
  }
};

// Listen for network changes
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Initialize with current network state
if (!navigator.onLine) {
  handleOffline();
}

// Enhanced error handling wrapper for Firestore operations
const withErrorHandling = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.warn('Firestore operation failed:', error.message);
    
    // If it's a network error and we're not using emulators, provide helpful feedback
    if (error.code === 'unavailable' && !useEmulators) {
      console.warn('Firestore unavailable - check your internet connection or Firebase configuration');
    }
    
    return fallback;
  }
};

// Get schools function
export const getSchools = async () => {
  return withErrorHandling(async () => {
    // Query users collection for active school accounts
    const schoolsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'school'),
      where('status', '==', 'active')
    );
    
    const schoolsSnapshot = await getDocs(schoolsQuery);
    
    return schoolsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'مدرسة بدون اسم',
      ...doc.data()
    }));
  }, []);
};

// Get all teachers
export const getAllTeachers = async () => {
  return withErrorHandling(async () => {
    const teachersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('status', '==', 'active')
    );
    
    const teachersSnapshot = await getDocs(teachersQuery);
    
    return teachersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'معلم بدون اسم',
      subject: doc.data().subject,
      school_id: doc.data().school_id,
      ...doc.data()
    }));
  }, []);
};

// Get teachers by school ID
export const getTeachersBySchoolId = async (schoolId: string) => {
  return withErrorHandling(async () => {
    const teachersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      where('school_id', '==', schoolId),
      where('status', '==', 'active')
    );
    
    const teachersSnapshot = await getDocs(teachersQuery);
    
    return teachersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'معلم بدون اسم',
      subject: doc.data().subject,
      ...doc.data()
    }));
  }, []);
};

// Get school projects count by email
export const getSchoolProjectsCountByEmail = async (email: string) => {
  return withErrorHandling(async () => {
    // First, find the school by email
    const schoolQuery = query(
      collection(db, 'users'),
      where('role', '==', 'school'),
      where('email', '==', email)
    );
    const schoolSnapshot = await getDocs(schoolQuery);
    
    if (schoolSnapshot.empty) {
      return {
        found: false,
        message: 'لم يتم العثور على مدرسة بهذا البريد الإلكتروني',
        count: 0
      };
    }
    
    const schoolDoc = schoolSnapshot.docs[0];
    const schoolId = schoolDoc.id;
    const schoolData = schoolDoc.data();
    
    // Then, get the count of projects for this school
    const projectsQuery = query(
      collection(db, 'projects'),
      where('school_id', '==', schoolId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    
    return {
      found: true,
      school: {
        id: schoolId,
        name: schoolData.name || 'مدرسة',
        email: schoolData.email
      },
      count: projectsSnapshot.size,
      projects: projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    };
  }, {
    found: false,
    message: 'حدث خطأ أثناء البحث عن المدرسة',
    count: 0
  });
};

// Get consultants function
export const getConsultants = async () => {
  return withErrorHandling(async () => {
    const consultantsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'consultant')
    );
    const consultantsSnapshot = await getDocs(consultantsQuery);
    
    console.log('Raw consultants data from Firestore:', consultantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
    
    const consultants = consultantsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Create consultant object with proper field mapping
      const consultant = {
        id: doc.id,
        name: data.name || 'مستشار',
        title: data.subject || 'مستشار',
        specialties: data.specializations || [],
        rating: data.rating || 5.0,
        reviews: data.reviews_count || 0,
        experience: data.experience_years ? `${data.experience_years} سنوات` : '5+ سنوات',
        avatar: data.avatar_url || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
        hourlyRate: data.hourly_rate || 150,
        availability: 'متاح',
        languages: data.languages || ['العربية'],
        location: data.location || 'الرياض، السعودية'
      };
      
      console.log('Processed consultant object:', consultant);
      return consultant;
    });
    
    return consultants;
  }, []);
};

// Project functions
export const getProjects = async () => {
  return withErrorHandling(async () => {
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    return projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
        updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
      };
    });
  }, []);
};

export const getProjectById = async (id: string) => {
  return withErrorHandling(async () => {
    const projectDoc = await getDoc(firestoreDoc(db, 'projects', id));
    if (projectDoc.exists()) {
      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        ...data,
        due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
        updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
      };
    }
    return null;
  }, null);
};

export const getProjectsByTeacherId = async (teacherId: string) => {
  return withErrorHandling(async () => {
    // First, get the teacher's school_id
    const teacherDoc = await getDoc(firestoreDoc(db, 'users', teacherId));
    if (!teacherDoc.exists()) {
      console.error('Teacher document not found');
      return [];
    }
    
    const teacherData = teacherDoc.data();
    const schoolId = teacherData.school_id;
    
    if (!schoolId) {
      console.error('Teacher has no school_id');
      return [];
    }
    
    // First, get projects where the teacher is assigned
    const teacherProjectsQuery = query(
      collection(db, 'projects'),
      where('teacher_id', '==', teacherId)
    );
    
    const teacherProjectsSnapshot = await getDocs(teacherProjectsQuery);
    const teacherProjects = teacherProjectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
        updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
      };
    });
    
    // Then, get draft projects from the teacher's school
    const schoolDraftProjectsQuery = query(
      collection(db, 'projects'),
      where('school_id', '==', schoolId),
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
    return Array.from(projectMap.values());
  }, []);
};

export const getProjectsBySchoolId = async (schoolId: string) => {
  return withErrorHandling(async () => {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('school_id', '==', schoolId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    return projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
        updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
      };
    });
  }, []);
};

export const getProjectsByStudentId = async (studentId: string) => {
  return withErrorHandling(async () => {
    // First get project_students where student_id matches
    const projectStudentsQuery = query(
      collection(db, 'project_students'),
      where('student_id', '==', studentId)
    );
    const projectStudentsSnapshot = await getDocs(projectStudentsQuery);
    
    // Get project IDs
    const projectIds = projectStudentsSnapshot.docs.map(doc => doc.data().project_id);
    
    if (projectIds.length === 0) {
      return [];
    }
    
    // Get projects for these IDs
    const projects = [];
    for (const projectId of projectIds) {
      const projectDoc = await getDoc(firestoreDoc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        const data = projectDoc.data();
        projects.push({
          id: projectDoc.id,
          ...data,
          due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
        });
      }
    }
    
    return projects;
  }, []);
};

export const createProject = async (projectData: any) => {
  try {
    // Convert due_date string to Timestamp if provided
    const dueDateTimestamp = projectData.dueDate || projectData.due_date 
      ? Timestamp.fromDate(new Date(projectData.dueDate || projectData.due_date))
      : null;
    
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      due_date: dueDateTimestamp,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      status: projectData.status || 'active',
      progress: projectData.progress || 0
    });
    
    return {
      id: docRef.id,
      ...projectData,
      due_date: dueDateTimestamp ? dueDateTimestamp.toDate().toISOString() : null
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: any) => {
  try {
    const projectRef = firestoreDoc(db, 'projects', id);
    
    // Create a copy of updates to modify
    const updatesToApply = { ...updates };
    
    // Convert due_date string to Timestamp if provided
    if (updates.dueDate || updates.due_date) {
      updatesToApply.due_date = Timestamp.fromDate(new Date(updates.dueDate || updates.due_date));
      // Remove the dueDate field if it exists to avoid duplication
      if ('dueDate' in updatesToApply) {
        delete updatesToApply.dueDate;
      }
    }
    
    // Add updated_at timestamp
    updatesToApply.updated_at = serverTimestamp();
    
    await updateDoc(projectRef, updatesToApply);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    await deleteDoc(firestoreDoc(db, 'projects', id));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Project students functions
export const getProjectStudents = async (projectId: string) => {
  return withErrorHandling(async () => {
    console.log('Fetching students for project:', projectId);
    const projectStudentsQuery = query(
      collection(db, 'project_students'),
      where('project_id', '==', projectId)
    );
    const projectStudentsSnapshot = await getDocs(projectStudentsQuery);
    
    console.log('projectStudentsSnapshot.empty:', projectStudentsSnapshot.empty);
    console.log('Number of project_students documents found:', projectStudentsSnapshot.docs.length);
    
    const students = [];
    for (const docSnapshot of projectStudentsSnapshot.docs) {
      const studentData = docSnapshot.data();
      console.log('Processing project_student document:', studentData);
      
      // Get student details
      const studentDoc = await getDoc(firestoreDoc(db, 'users', studentData.student_id));
      const student = studentDoc.exists() ? studentDoc.data() : null;
      
      console.log('Fetched user document for student_id', studentData.student_id, 'exists:', studentDoc.exists());
      if (!studentDoc.exists()) {
        console.warn('User document not found for student_id:', studentData.student_id);
      }
      
      students.push({
        id: docSnapshot.id,
        ...studentData,
        student
      });
    }
    
    console.log('Final students array from getProjectStudents:', students);
    return students;
  }, []);
};

export const addStudentToProject = async ({ project_id, student_id, role, created_at, status }: {
  project_id: string;
  student_id: string;
  role: string;
  created_at?: string;
  status?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'project_students'), {
      project_id,
      student_id,
      role,
      created_at: created_at ? Timestamp.fromDate(new Date(created_at)) : serverTimestamp(),
      status: status || 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding student to project:', error);
    throw error;
  }
};

export const removeStudentFromProject = async (projectId: string, studentId: string) => {
  try {
    const projectStudentsQuery = query(
      collection(db, 'project_students'),
      where('project_id', '==', projectId),
      where('student_id', '==', studentId)
    );
    const projectStudentsSnapshot = await getDocs(projectStudentsQuery);
    
    for (const docSnapshot of projectStudentsSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
    }
  } catch (error) {
    console.error('Error removing student from project:', error);
    throw error;
  }
};

// Project tasks functions
export const getProjectTasks = async (projectId: string) => {
  return withErrorHandling(async () => {
    const tasksQuery = query(
      collection(db, 'project_tasks'),
      where('project_id', '==', projectId),
      orderBy('created_at', 'desc')
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    return tasksSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        due_date: data.due_date ? data.due_date.toDate().toISOString() : null,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
        updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString()
      };
    });
  }, []);
};

export const createProjectTask = async (taskData: any) => {
  try {
    // Convert due_date string to Timestamp if provided
    const dueDateTimestamp = taskData.due_date 
      ? Timestamp.fromDate(new Date(taskData.due_date))
      : null;
    
    const docRef = await addDoc(collection(db, 'project_tasks'), {
      ...taskData,
      due_date: dueDateTimestamp,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...taskData,
      due_date: dueDateTimestamp ? dueDateTimestamp.toDate().toISOString() : null
    };
  } catch (error) {
    console.error('Error creating project task:', error);
    throw error;
  }
};

// Project ideas functions - Modified to avoid composite index requirement
export const getProjectIdeas = async () => {
  return withErrorHandling(async () => {
    // Get all approved project ideas without ordering to avoid composite index requirement
    const ideasQuery = query(
      collection(db, 'project_ideas'),
      where('status', '==', 'approved')
    );
    const ideasSnapshot = await getDocs(ideasQuery);
    
    // Get the data and sort in memory by created_at
    const ideas = ideasSnapshot.docs.map(doc => ({
      id: doc.id,
      views: 0,
      downloads: 0,
      rating: 4.5,
      ...doc.data()
    }));
    
    // Sort by created_at in descending order (newest first)
    return ideas.sort((a, b) => {
      const aDate = a.created_at?.toDate?.() || new Date(a.created_at || 0);
      const bDate = b.created_at?.toDate?.() || new Date(b.created_at || 0);
      return bDate.getTime() - aDate.getTime();
    });
  }, []);
};

// Get all project ideas (for admin) - Modified to avoid composite index requirement
export const getAllProjectIdeas = async () => {
  return withErrorHandling(async () => {
    // Get all project ideas without ordering to avoid composite index requirement
    const ideasQuery = query(collection(db, 'project_ideas'));
    const ideasSnapshot = await getDocs(ideasQuery);
    
    // Get the data and sort in memory by created_at
    const ideas = ideasSnapshot.docs.map(doc => ({
      id: doc.id,
      views: 0,
      downloads: 0,
      rating: 4.5,
      ...doc.data()
    }));
    
    // Sort by created_at in descending order (newest first)
    return ideas.sort((a, b) => {
      const aDate = a.created_at?.toDate?.() || new Date(a.created_at || 0);
      const bDate = b.created_at?.toDate?.() || new Date(b.created_at || 0);
      return bDate.getTime() - aDate.getTime();
    });
  }, []);
};

export const createProjectIdea = async (ideaData: any) => {
  try {
    // Prepare the data to be saved
    const newIdea = {
      ...ideaData,
      views: ideaData.views || 0,
      downloads: ideaData.downloads || 0,
      rating: ideaData.rating || 4.5,
      status: ideaData.status || 'pending', // Default to pending
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, 'project_ideas'), newIdea);
    
    // Return the created idea with its ID
    return {
      id: docRef.id,
      ...newIdea,
      created_at: new Date().toISOString(), // Convert for immediate use in UI
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating project idea:', error);
    throw error;
  }
};

export const updateProjectIdea = async (id: string, updates: any) => {
  try {
    const ideaRef = firestoreDoc(db, 'project_ideas', id);
    
    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: serverTimestamp()
    };
    
    // Update the document in Firestore
    await updateDoc(ideaRef, updateData);
    
    return true;
  } catch (error) {
    console.error('Error updating project idea:', error);
    throw error;
  }
};

export const deleteProjectIdea = async (id: string) => {
  try {
    await deleteDoc(firestoreDoc(db, 'project_ideas', id));
    return true;
  } catch (error) {
    console.error('Error deleting project idea:', error);
    throw error;
  }
};

export const incrementProjectIdeaViews = async (id: string) => {
  try {
    const ideaRef = firestoreDoc(db, 'project_ideas', id);
    await updateDoc(ideaRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing project idea views:', error);
    throw error;
  }
};

export const incrementProjectIdeaDownloads = async (id: string) => {
  try {
    const ideaRef = firestoreDoc(db, 'project_ideas', id);
    await updateDoc(ideaRef, {
      downloads: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing project idea downloads:', error);
    throw error;
  }
};

/**
 * Deletes duplicate project ideas from the Firestore database
 * @returns {Promise<number>} The number of deleted duplicates
 */
export const deleteDuplicateProjectIdeas = async (): Promise<number> => {
  try {
    console.log('Starting cleanup of duplicate project ideas...');
    
    // Get all project ideas
    const ideasRef = collection(db, 'project_ideas');
    const snapshot = await getDocs(ideasRef);
    
    if (snapshot.empty) {
      console.log('No project ideas found to clean up');
      return 0;
    }
    
    // Map to track unique ideas
    const uniqueIdeas = new Map<string, string>(); // Map: compositeKey -> docId
    const duplicatesToDelete: string[] = [];
    
    // Process each document
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Create a composite key using title and description
      const compositeKey = `${data.title}-${data.description}`;
      
      if (uniqueIdeas.has(compositeKey)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(doc.id);
      } else {
        // This is the first occurrence, add to unique ideas
        uniqueIdeas.set(compositeKey, doc.id);
      }
    });
    
    console.log(`Found ${duplicatesToDelete.length} duplicate project ideas to delete`);
    
    // Delete all duplicates
    let deletedCount = 0;
    for (const docId of duplicatesToDelete) {
      await deleteDoc(firestoreDoc(db, 'project_ideas', docId));
      deletedCount++;
    }
    
    console.log(`Successfully deleted ${deletedCount} duplicate project ideas`);
    return deletedCount;
  } catch (error) {
    console.error('Error deleting duplicate project ideas:', error);
    throw error;
  }
};

/**
 * Deletes duplicate learning resources from the Firestore database
 * @returns {Promise<number>} The number of deleted duplicates
 */
export const deleteDuplicateLearningResources = async (): Promise<number> => {
  try {
    console.log('Starting cleanup of duplicate learning resources...');
    
    // Get all learning resources
    const resourcesRef = collection(db, 'learning_resources');
    const snapshot = await getDocs(resourcesRef);
    
    if (snapshot.empty) {
      console.log('No learning resources found to clean up');
      return 0;
    }
    
    // Map to track unique resources
    const uniqueResources = new Map<string, string>(); // Map: compositeKey -> docId
    const duplicatesToDelete: string[] = [];
    
    // Process each document
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Create a composite key using title and type
      const compositeKey = `${data.title}-${data.type}`;
      
      if (uniqueResources.has(compositeKey)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(doc.id);
      } else {
        // This is the first occurrence, add to unique resources
        uniqueResources.set(compositeKey, doc.id);
      }
    });
    
    console.log(`Found ${duplicatesToDelete.length} duplicate learning resources to delete`);
    
    // Delete all duplicates
    let deletedCount = 0;
    for (const docId of duplicatesToDelete) {
      await deleteDoc(firestoreDoc(db, 'learning_resources', docId));
      deletedCount++;
    }
    
    console.log(`Successfully deleted ${deletedCount} duplicate learning resources`);
    return deletedCount;
  } catch (error) {
    console.error('Error deleting duplicate learning resources:', error);
    throw error;
  }
};

// User functions
export const updateUser = async (id: string, userData: any) => {
  try {
    const userRef = firestoreDoc(db, 'users', id);
    await updateDoc(userRef, {
      ...userData,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getStudentsBySchoolId = async (schoolId: string) => {
  return withErrorHandling(async () => {
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('school_id', '==', schoolId)
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    return studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }, []);
};

// Store functions
export const getStoreItems = async () => {
  return withErrorHandling(async () => {
    const storeQuery = query(
      collection(db, 'store_items'),
      orderBy('created_at', 'desc')
    );
    const storeSnapshot = await getDocs(storeQuery);
    return storeSnapshot.docs.map(doc => ({
      id: doc.id,
      views: 0,
      ...doc.data()
    }));
  }, []);
};

// Summer Program Registration functions
export const getSummerProgramRegistrations = async (): Promise<SummerProgramRegistrationData[]> => {
  return withErrorHandling(async () => {
    const registrationsRef = collection(db, 'summer_program_registrations');
    const registrationsQuery = query(registrationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(registrationsQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        parentPhone: data.parentPhone,
        city: data.city,
        idNumber: data.idNumber,
        school: data.school,
        grade: data.grade,
        educationAdministration: data.educationAdministration,
        hasParticipatedBefore: data.hasParticipatedBefore,
        previousProjects: data.previousProjects,
        interests: data.interests || [],
        howDidYouHear: data.howDidYouHear,
        notes: data.notes,
        status: data.status || 'pending',
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
      };
    });
  }, []);
};

export const addSummerProgramRegistration = async (data: Partial<SummerProgramRegistrationData>): Promise<string> => {
  try {
    const registrationsRef = collection(db, 'summer_program_registrations');
    
    const registrationData = {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(registrationsRef, registrationData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding summer program registration:', error);
    throw error;
  }
};

export const updateSummerProgramRegistration = async (id: string, updates: Partial<SummerProgramRegistrationData>): Promise<void> => {
  try {
    const registrationRef = firestoreDoc(db, 'summer_program_registrations', id);
    
    await updateDoc(registrationRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating summer program registration:', error);
    throw error;
  }
};

export const deleteSummerProgramRegistration = async (id: string): Promise<void> => {
  try {
    const registrationRef = firestoreDoc(db, 'summer_program_registrations', id);
    await deleteDoc(registrationRef);
  } catch (error) {
    console.error('Error deleting summer program registration:', error);
    throw error;
  }
};

// Sample data initialization function with better error handling
export const initializeWithSampleData = async () => {
  try {
    // Only initialize sample data if we're using emulators
    if (!useEmulators) {
      console.log('Skipping sample data initialization - not using emulators');
      return;
    }

    const { collection, addDoc, getDocs, serverTimestamp } = await import('firebase/firestore');
    
    // Check if sample data already exists
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (!usersSnapshot.empty) {
      console.log('Sample data already exists, skipping initialization');
      return;
    }

    console.log('Initializing sample data for emulators...');
    
    // Add sample users
    const sampleUsers = [
      {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        role: 'student',
        grade: 'الصف الثاني عشر',
        school_id: 'school1',
        createdAt: serverTimestamp(),
        status: 'active'
      },
      {
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        role: 'teacher',
        subject: 'الرياضيات',
        school_id: 'school1',
        createdAt: serverTimestamp(),
        status: 'active'
      },
      {
        name: 'مدرسة النور الثانوية',
        email: 'school@example.com',
        role: 'school',
        phone: '+971501234567',
        createdAt: serverTimestamp(),
        status: 'active'
      }
    ];

    for (const user of sampleUsers) {
      await addDoc(collection(db, 'users'), user);
    }

    console.log('Sample data initialized successfully');
  } catch (error: any) {
    // Don't throw errors for sample data initialization
    console.warn('Sample data initialization failed:', error.message);
  }
};

export default app;