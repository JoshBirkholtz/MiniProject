import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const firebaseService = {
    // Auth methods
    signup: async (email: string, password: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        return userCredential.user;
    },

    login: async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    logout: () => signOut(auth),

    // Firestore methods
    createEvent: async (eventData: any) => {
        return addDoc(collection(db, 'events'), eventData);
    },

    getEvents: async () => {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        return eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Add more Firestore methods as needed
};