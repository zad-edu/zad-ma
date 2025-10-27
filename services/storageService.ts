import { doc, getDoc, setDoc, onSnapshot, Unsubscribe, DocumentReference, docSnap, } from 'firebase/firestore';
import { db } from './firebase';
import { BookingData } from '../types';

const BOOKINGS_DOC_ID = 'allBookings';
const BOOKINGS_COLLECTION_ID = 'school-bookings';

// Helper to get the DocumentReference, only when db is confirmed to be available.
const getBookingsDocRef = (): DocumentReference => {
    if (!db) {
        // This should not happen if called from the app correctly, but it's a safeguard.
        throw new Error("Firebase is not configured. Cannot access Firestore.");
    }
    return doc(db, BOOKINGS_COLLECTION_ID, BOOKINGS_DOC_ID);
}

/**
 * Fetches the initial set of bookings from Firestore.
 * This is useful for the initial load before the real-time listener is set up.
 */
export const getBookings = async (): Promise<BookingData> => {
  try {
    const bookingsDocRef = getBookingsDocRef();
    const docSnap = await getDoc(bookingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as BookingData;
    } else {
      // If the document doesn't exist, create it with an empty object
      await setDoc(bookingsDocRef, {});
      return {};
    }
  } catch (error) {
    console.error("Error fetching bookings from Firestore:", error);
    throw error;
  }
};

/**
 * Saves the entire bookings object to Firestore.
 * This will overwrite the existing data in the document.
 */
export const saveBookings = async (bookings: BookingData): Promise<void> => {
  try {
    const bookingsDocRef = getBookingsDocRef();
    await setDoc(bookingsDocRef, bookings);
  } catch (error) {
    console.error("Error saving bookings to Firestore:", error);
    throw error;
  }
};


/**
 * Sets up a real-time listener for booking changes.
 * @param callback The function to call with the updated booking data.
 * @returns An unsubscribe function to detach the listener.
 */
export const onBookingsChange = (callback: (bookings: BookingData) => void): Unsubscribe => {
    try {
        const bookingsDocRef = getBookingsDocRef();
        return onSnapshot(bookingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as BookingData);
            } else {
                // Document doesn't exist, maybe it was deleted. Callback with empty data.
                callback({});
            }
        }, (error) => {
            console.error("Error with Firestore snapshot listener:", error);
        });
    } catch(e) {
        console.error("Could not set up Firestore listener.", e);
        // Return a no-op function if listener setup fails
        return () => {};
    }
};