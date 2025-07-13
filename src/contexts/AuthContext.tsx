import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'school' | 'admin' | 'consultant';
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  school_id?: string;
  grade?: string;
  subject?: string;
  languages?: string[];
  status?: string;
  // Consultant specific fields
  specializations?: string[];
  experience_years?: number;
  hourly_rate?: number;
  rating?: number;
  reviews_count?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOffline: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'student',
              avatar: userData.avatar || firebaseUser.photoURL,
              phone: userData.phone,
              bio: userData.bio,
              createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              school_id: userData.school_id,
              grade: userData.grade,
              subject: userData.subject,
              languages: userData.languages,
              status: userData.status || 'active',
              // Consultant specific fields
              specializations: userData.specializations,
              experience_years: userData.experience_years,
              hourly_rate: userData.hourly_rate,
              rating: userData.rating,
              reviews_count: userData.reviews_count
            });
          } else {
            // If user document doesn't exist, create a basic user profile
            const basicUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'مستخدم جديد',
              role: 'student',
              avatar: firebaseUser.photoURL,
              createdAt: new Date().toISOString(),
              status: 'active'
            };
            setUser(basicUser);
          }
        } catch (error: any) {
          // Handle various Firebase errors gracefully
          const isNetworkError = error.code === 'unavailable' || 
                                error.code === 'auth/network-request-failed' ||
                                error.code === 'firestore/unavailable' ||
                                error.message?.includes('offline') ||
                                error.message?.includes('client is offline') ||
                                error.message?.includes('network') ||
                                error.message?.includes('Could not reach Cloud Firestore backend');

          if (isNetworkError) {
            console.warn('Operating in offline mode - using basic user profile:', error.message);
            setIsOffline(true);
          } else {
            console.error('Error fetching user profile:', error);
          }
          
          // Create a basic user profile from Firebase Auth data for any error
          const basicUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'مستخدم جديد',
            role: 'student',
            avatar: firebaseUser.photoURL,
            createdAt: new Date().toISOString(),
            status: 'active'
          };
          setUser(basicUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Explicitly fetch the user document to get the complete user data including status
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData.name || firebaseUser.displayName || '',
          role: userData.role || 'student',
          avatar: userData.avatar || firebaseUser.photoURL,
          phone: userData.phone,
          bio: userData.bio,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          school_id: userData.school_id,
          grade: userData.grade,
          subject: userData.subject,
          languages: userData.languages,
          status: userData.status || 'active',
          // Consultant specific fields
          specializations: userData.specializations,
          experience_years: userData.experience_years,
          hourly_rate: userData.hourly_rate,
          rating: userData.rating,
          reviews_count: userData.reviews_count
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed' || error.code === 'unavailable') {
        console.warn('Network request failed during login:', error.message);
        setIsOffline(true);
        throw new Error('فشل في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } else {
        console.error('Login error:', error);
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Determine initial status based on role
      let initialStatus = 'active';
      
      // If the user is a school or consultant, set status to pending for admin approval
      if (userData.role === 'school' || userData.role === 'consultant') {
        initialStatus = 'pending';
      }
      
      console.log(`Registering new ${userData.role} with initial status: ${initialStatus}`);
      
      // Create a base user data object with common fields
      const baseUserData = {
        name: userData.name,
        email: firebaseUser.email,
        role: userData.role || 'student',
        phone: userData.phone,
        bio: userData.bio || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        school_id: userData.school_id,
        grade: userData.grade,
        subject: userData.subject,
        languages: userData.languages || ['العربية'],
        status: initialStatus,
      };
      
      // Create the final user data object, conditionally adding consultant-specific fields
      let newUserData: any = { ...baseUserData };
      
      // Only add consultant-specific fields if the role is 'consultant'
      if (userData.role === 'consultant') {
        newUserData = {
          ...newUserData,
          specializations: userData.specializations || [],
          experience_years: userData.experience_years || 0,
          hourly_rate: userData.hourly_rate || 0,
          rating: 5.0,
          reviews_count: 0
        };
      }
      
      // Create user profile in Firestore with document ID matching the Firebase Auth UID
      await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
      
      // Set the user state with the complete user data including status
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name || '',
        role: userData.role || 'student',
        avatar: firebaseUser.photoURL,
        phone: userData.phone,
        bio: userData.bio || '',
        createdAt: new Date().toISOString(),
        school_id: userData.school_id,
        grade: userData.grade,
        subject: userData.subject,
        languages: userData.languages || ['العربية'],
        status: initialStatus,
        // Consultant specific fields
        specializations: userData.role === 'consultant' ? userData.specializations : undefined,
        experience_years: userData.role === 'consultant' ? userData.experience_years : undefined,
        hourly_rate: userData.role === 'consultant' ? userData.hourly_rate : undefined,
        rating: userData.role === 'consultant' ? 5.0 : undefined,
        reviews_count: userData.role === 'consultant' ? 0 : undefined
      });
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed' || error.code === 'unavailable') {
        console.warn('Network request failed during registration:', error.message);
        setIsOffline(true);
        throw new Error('فشل في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } else {
        console.error('Registration error:', error);
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email,
          role: 'student',
          avatar: firebaseUser.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active'
        });
      }
      
      // Explicitly fetch the user document to get the complete user data
      const updatedUserDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (updatedUserDoc.exists()) {
        const userData = updatedUserDoc.data();
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData.name || firebaseUser.displayName || '',
          role: userData.role || 'student',
          avatar: userData.avatar || firebaseUser.photoURL,
          phone: userData.phone,
          bio: userData.bio,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          school_id: userData.school_id,
          grade: userData.grade,
          subject: userData.subject,
          languages: userData.languages,
          status: userData.status || 'active',
          specializations: userData.specializations,
          experience_years: userData.experience_years,
          hourly_rate: userData.hourly_rate,
          rating: userData.rating,
          reviews_count: userData.reviews_count
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed' || error.code === 'unavailable') {
        console.warn('Network request failed during Google login:', error.message);
        setIsOffline(true);
        throw new Error('فشل في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } else {
        console.error('Google login error:', error);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the local user state
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isOffline,
    login,
    register,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};