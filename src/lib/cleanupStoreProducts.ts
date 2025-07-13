import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const deleteDuplicateStoreItems = async (): Promise<number> => {
  try {
    console.log('Starting cleanup of duplicate store items...');
    const storeItemsRef = collection(db, 'store_items');
    const snapshot = await getDocs(storeItemsRef);

    const uniqueItems = new Map<string, string>(); // Map: compositeKey -> docId
    const itemsToDelete: string[] = [];
    let deletedCount = 0;

    snapshot.forEach((document) => {
      const data = document.data();
      const name = data.name;
      const description = data.description;
      // Create a composite key for identifying duplicates
      const compositeKey = `${name}-${description}`;

      if (uniqueItems.has(compositeKey)) {
        // This is a duplicate, mark it for deletion
        itemsToDelete.push(document.id);
      } else {
        // This is the first occurrence, add it to unique items
        uniqueItems.set(compositeKey, document.id);
      }
    });

    console.log(`Found ${itemsToDelete.length} duplicate items to delete.`);

    // Perform deletions
    for (const docId of itemsToDelete) {
      await deleteDoc(doc(db, 'store_items', docId));
      deletedCount++;
    }

    console.log(`Successfully deleted ${deletedCount} duplicate store items.`);
    return deletedCount;
  } catch (error) {
    console.error('Error deleting duplicate store items:', error);
    throw error;
  }
};