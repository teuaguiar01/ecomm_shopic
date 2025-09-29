import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "@firebase/storage";
import { storage } from "@/firebase";

/**
 * Receipt Storage Utilities
 * Handles Firebase Storage operations for payment receipt images
 */

// Constants
const RECEIPTS_FOLDER = 'receipts';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Build the storage path for a receipt
 * @param {string} orderId - The order ID
 * @param {string} filename - The filename (optional, defaults to 'receipt.jpg')
 * @returns {string} The storage path
 */
export const buildReceiptPath = (orderId, filename = 'receipt.jpg') => {
  return `${RECEIPTS_FOLDER}/${orderId}/${filename}`;
};

/**
 * Get storage reference for a receipt
 * @param {string} orderId - The order ID
 * @param {string} filename - The filename (optional)
 * @returns {StorageReference} Firebase storage reference
 */
export const getReceiptRef = (orderId, filename) => {
  const path = buildReceiptPath(orderId, filename);
  return ref(storage, path);
};

/**
 * Upload a receipt file to Firebase Storage
 * @param {string} orderId - The order ID
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadReceipt = async (orderId, file, onProgress = null) => {
  if (!orderId || !file) {
    throw new Error('Order ID and file are required');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `receipt.${fileExtension}`;
  const receiptRef = getReceiptRef(orderId, filename);

  let attempt = 0;
  while (attempt < MAX_RETRY_ATTEMPTS) {
    try {
      // Upload the file
      const snapshot = await uploadBytes(receiptRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      attempt++;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt >= MAX_RETRY_ATTEMPTS) {
        throw new Error(`Upload failed after ${MAX_RETRY_ATTEMPTS} attempts: ${error.message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
};

/**
 * Get the download URL for a receipt
 * @param {string} orderId - The order ID
 * @param {string} filename - The filename (optional)
 * @returns {Promise<string|null>} The download URL or null if not found
 */
export const getReceiptUrl = async (orderId, filename = null) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  try {
    // If no filename specified, try to find any receipt in the folder
    if (!filename) {
      const folderRef = ref(storage, `${RECEIPTS_FOLDER}/${orderId}`);
      const listResult = await listAll(folderRef);
      
      if (listResult.items.length === 0) {
        return null; // No receipts found
      }
      
      // Get the first receipt found
      const firstReceipt = listResult.items[0];
      return await getDownloadURL(firstReceipt);
    }
    
    // Get specific file
    const receiptRef = getReceiptRef(orderId, filename);
    return await getDownloadURL(receiptRef);
    
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return null; // Receipt doesn't exist
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Check if a receipt exists for an order
 * @param {string} orderId - The order ID
 * @returns {Promise<boolean>} True if receipt exists, false otherwise
 */
export const receiptExists = async (orderId) => {
  try {
    const url = await getReceiptUrl(orderId);
    return url !== null;
  } catch (error) {
    console.error('Error checking receipt existence:', error);
    return false;
  }
};

/**
 * Delete a receipt from storage
 * @param {string} orderId - The order ID
 * @param {string} filename - The filename (optional)
 * @returns {Promise<void>}
 */
export const deleteReceipt = async (orderId, filename = null) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  try {
    if (!filename) {
      // Delete all receipts in the folder
      const folderRef = ref(storage, `${RECEIPTS_FOLDER}/${orderId}`);
      const listResult = await listAll(folderRef);
      
      await Promise.all(
        listResult.items.map(item => deleteObject(item))
      );
    } else {
      // Delete specific file
      const receiptRef = getReceiptRef(orderId, filename);
      await deleteObject(receiptRef);
    }
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      // File doesn't exist, which is fine
      return;
    }
    throw error;
  }
};

/**
 * List all receipts for an order
 * @param {string} orderId - The order ID
 * @returns {Promise<Array>} Array of receipt metadata
 */
export const listReceipts = async (orderId) => {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  try {
    const folderRef = ref(storage, `${RECEIPTS_FOLDER}/${orderId}`);
    const listResult = await listAll(folderRef);
    
    const receipts = await Promise.all(
      listResult.items.map(async (item) => {
        try {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            fullPath: item.fullPath,
            url: url,
            ref: item
          };
        } catch (error) {
          console.error(`Error getting URL for ${item.name}:`, error);
          return {
            name: item.name,
            fullPath: item.fullPath,
            url: null,
            ref: item,
            error: error.message
          };
        }
      })
    );
    
    return receipts;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return []; // No receipts folder exists
    }
    throw error;
  }
};

/**
 * Get receipt metadata without downloading
 * @param {string} orderId - The order ID
 * @returns {Promise<Object|null>} Receipt metadata or null if not found
 */
export const getReceiptMetadata = async (orderId) => {
  try {
    const receipts = await listReceipts(orderId);
    if (receipts.length === 0) {
      return null;
    }
    
    // Return the first receipt's metadata
    const receipt = receipts[0];
    return {
      name: receipt.name,
      path: receipt.fullPath,
      exists: receipt.url !== null,
      hasError: !!receipt.error
    };
  } catch (error) {
    console.error('Error getting receipt metadata:', error);
    return null;
  }
};

/**
 * Utility function to handle upload with retry logic
 * @param {Function} uploadFunction - The upload function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} The result of the upload function
 */
export const withRetry = async (uploadFunction, maxAttempts = MAX_RETRY_ATTEMPTS, delay = RETRY_DELAY) => {
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    try {
      return await uploadFunction();
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

// Export default object with all functions
export default {
  buildReceiptPath,
  getReceiptRef,
  uploadReceipt,
  getReceiptUrl,
  receiptExists,
  deleteReceipt,
  listReceipts,
  getReceiptMetadata,
  withRetry
};