import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeWithSampleData } from './lib/firebase';
import { addLearningVideosToDatabase } from './lib/addLearningVideos';
import './i18n'; // Import i18n configuration

// Initialize sample data for development (with better error handling)
if (import.meta.env.DEV) {
  // Add a delay to ensure Firebase is properly initialized
  setTimeout(() => {
    initializeWithSampleData()
      .then(() => console.log('Sample data initialization completed'))
      .catch(error => {
        // Suppress network-related errors in development
        if (error.code === 'unavailable' || error.message?.includes('Could not reach Cloud Firestore backend')) {
          console.warn('Firebase Firestore is not available - this is normal if not using emulators or if offline');
        } else {
          console.warn('Sample data initialization failed:', error.message);
        }
      });
      
    // Add educational videos to the database
    addLearningVideosToDatabase()
      .then(added => {
        if (added) {
          console.log('Educational videos added successfully');
        } else {
          console.log('Educational videos already exist, skipping addition');
        }
      })
      .catch(error => {
        console.warn('Failed to add educational videos:', error);
      });
  }, 3000); // Increased delay to 3 seconds
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);