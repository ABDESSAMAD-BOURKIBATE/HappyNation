import { db } from './firebase';
import { collection, getDocs, setDoc, doc, getDoc, query, where, addDoc, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore';
import { EmployeeWithAuth } from '../types';

// --- Employee Management ---

// Fetch all employees (for HR Dashboard)
export const getEmployees = async (): Promise<EmployeeWithAuth[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        // We stored the actual ID (email) inside the document data as 'id' property too, or we can use doc.id
        return querySnapshot.docs.map(doc => doc.data() as EmployeeWithAuth);
    } catch (error) {
        console.error("Error getting employees:", error);
        return [];
    }
};

// Create or Update an employee
export const createEmployee = async (employee: EmployeeWithAuth) => {
    try {
        // Use email (employee.id) as the document ID to ensure uniqueness and easy lookup
        await setDoc(doc(db, 'employees', employee.id), employee);
        return true;
    } catch (error) {
        console.error("Error creating employee:", error);
        return false;
    }
};

// Login check (Simple Firestore check)
export const loginEmployee = async (email: string, password?: string): Promise<EmployeeWithAuth | null> => {
    try {
        const docRef = doc(db, 'employees', email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as EmployeeWithAuth;
            // In a real app, you MUST verify password hash. Here we do a simple string check.
            if (data.password === password) {
                return data;
            }
        }
        return null; // Not found or wrong password
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
};

export const updateEmployee = async (employee: EmployeeWithAuth, oldId?: string) => {
    try {
        // If ID changed (email updated), delete old and create new
        if (oldId && oldId !== employee.id) {
            await deleteDoc(doc(db, 'employees', oldId));
        }
        await setDoc(doc(db, 'employees', employee.id), employee);
        return true;
    } catch (error) {
        console.error("Error updating employee:", error);
        return false;
    }
};

export const deleteEmployee = async (employeeId: string) => {
    try {
        await deleteDoc(doc(db, 'employees', employeeId));
        return true;
    } catch (error) {
        console.error("Error deleting employee:", error);
        return false;
    }
};

// --- Feedback ---

export const sendFeedback = async (employeeId: string, message: string) => {
    try {
        await addDoc(collection(db, 'feedback'), {
            employeeId,
            message,
            date: new Date().toISOString(),
            read: false
        });
        return true;
    } catch (error) {
        console.error("Error sending feedback:", error);
        return false;
    }
};

// --- Admin (HR) Management ---

export const createAdmin = async (email: string, password: string, name: string) => {
    try {
        const docRef = doc(db, 'admins', email);
        const docSnap = await getDoc(docRef);

        // Only create if doesn't exist to prevent overwriting images/changes
        if (!docSnap.exists()) {
            await setDoc(docRef, {
                id: email,
                name,
                password, // In real app, hash this!
                role: 'ADMIN'
            });
        }
        return true;
    } catch (error) {
        console.error("Error creating admin:", error);
        return false;
    }
};

export const loginAdmin = async (email: string, password: string) => {
    try {
        const docRef = doc(db, 'admins', email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.password === password) {
                return { email, ...data };
            }
        }
        return null;
    } catch (error) {
        console.error("Error logging in admin:", error);
        return null;
    }
};

export const getAdmin = async (email: string) => {
    try {
        const docRef = doc(db, 'admins', email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { email, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting admin:", error);
        return null;
    }
};

export const updateAdmin = async (email: string, data: any) => {
    try {
        await setDoc(doc(db, 'admins', email), data, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating admin:", error);
        return false;
    }
};

// --- Notifications ---

export const addNotification = async (notif: { type: string; message: string; date: string; read: boolean; employeeId?: string; image?: string | null }) => {
    try {
        await addDoc(collection(db, 'notifications'), notif);
        return true;
    } catch (error) {
        console.error("Error adding notification:", error);
        return false;
    }
};

export const getNotifications = async () => {
    try {
        const q = query(collection(db, 'notifications'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting notifications:", error);
        return [];
    }
};

// --- Feedback Retrieval ---

// ... (existing code)

export const getEmployeeFeedback = async (employeeId: string) => {
    try {
        const q = query(collection(db, 'feedback'), where('employeeId', '==', employeeId));
        const querySnapshot = await getDocs(q);
        const feedback = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        return feedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
    }
};

export const subscribeToEmployeeFeedback = (employeeId: string, callback: (feedback: any[]) => void) => {
    const q = query(collection(db, 'feedback'), where('employeeId', '==', employeeId));
    return onSnapshot(q, (snapshot) => {
        const feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const sorted = feedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(sorted);
    });
};

export const deleteEmployeeFeedback = async (feedbackId: string) => {
    try {
        await deleteDoc(doc(db, 'feedback', feedbackId));
    } catch (error) {
        console.error("Error deleting feedback:", error);
    }
};

// --- Assessment History ---

export const saveAssessmentResult = async (userId: string, result: any) => {
    try {
        // 1. Save to assessments collection
        await addDoc(collection(db, 'assessments'), {
            userId,
            ...result,
            timestamp: new Date().toISOString()
        });

        // 2. Update employee profile with latest status (Denormalization for fast read)
        await setDoc(doc(db, 'employees', userId), {
            lastAssessment: {
                score: result.score,
                risk: result.risk,
                date: new Date().toISOString()
            }
        }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error saving assessment:", error);
        return false;
    }
};

export const getEmployeeHistory = async (userId: string) => {
    try {
        const q = query(
            collection(db, 'assessments'),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        const history: any[] = [];
        const deletePromises: Promise<void>[] = [];

        querySnapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const recordDate = new Date(data.timestamp);

            if (recordDate < thirtyDaysAgo) {
                // Determine valid document ID
                const docId = docSnap.id;
                deletePromises.push(deleteDoc(doc(db, 'assessments', docId)));
            } else {
                history.push({ id: docSnap.id, date: data.timestamp, ...data });
            }
        });

        // Execute deletions in background (don't block UI)
        if (deletePromises.length > 0) {
            Promise.all(deletePromises).catch(err => console.error("Auto-deletion error:", err));
        }

        return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
        console.error("Error getting history:", error);
        return [];
    }
};

export const deleteNotification = async (notificationId: string) => {
    try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        return true;
    } catch (error) {
        console.error("Error deleting notification:", error);
        return false;
    }
};
