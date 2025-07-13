import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Adds random future due dates to all projects in the database
 * This ensures all projects have a consistent due_date field
 */
export const updateProjectDueDates = async () => {
  try {
    console.log('Starting to update project due dates...');
    
    // Get all projects
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    if (projectsSnapshot.empty) {
      console.log('No projects found to update');
      return false;
    }
    
    // Track success and failures
    let successCount = 0;
    let failureCount = 0;
    
    // Process each project
    for (const projectDoc of projectsSnapshot.docs) {
      try {
        const projectId = projectDoc.id;
        const projectData = projectDoc.data();
        
        // Generate a random future date (between 1 and 90 days from now)
        const randomDays = Math.floor(Math.random() * 90) + 1;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + randomDays);
        
        // Create a Firestore timestamp for the due date
        const dueDateTimestamp = Timestamp.fromDate(futureDate);
        
        // Check if the project already has a due_date
        const hasExistingDueDate = projectData.due_date instanceof Timestamp;
        
        // Only update if there's no valid due_date
        if (!hasExistingDueDate) {
          // Update the project with the new due_date
          await updateDoc(doc(db, 'projects', projectId), {
            due_date: dueDateTimestamp
          });
          
          console.log(`Updated project ${projectId} with due date: ${futureDate.toISOString()}`);
          successCount++;
        } else {
          console.log(`Project ${projectId} already has a valid due_date, skipping`);
        }
      } catch (err) {
        console.error(`Error updating project ${projectDoc.id}:`, err);
        failureCount++;
      }
    }
    
    console.log(`Successfully updated ${successCount} projects`);
    if (failureCount > 0) {
      console.log(`Failed to update ${failureCount} projects`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating project due dates:', error);
    throw error;
  }
};