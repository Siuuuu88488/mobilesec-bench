import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'auditor' | 'admin' | 'developer';
  createdAt: string;
  updatedAt?: string;
  provider: 'google';
}

export interface SavedAuditSession {
  id: string;
  userId: string;
  title: string;
  score: number;
  patchedCount: number;
  totalCount: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  saveAuditToFirestore: (title: string, score: number, patchedCount: number, totalCount: number) => Promise<boolean>;
  getSavedAuditSessions: () => Promise<SavedAuditSession[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Security Auditor',
              photoURL: currentUser.photoURL || undefined,
              role: 'auditor',
              provider: 'google',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err: unknown) {
          console.error('Error fetching or creating user profile in Firestore:', err);
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Security Auditor',
            photoURL: currentUser.photoURL || undefined,
            role: 'auditor',
            provider: 'google',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;

      const userDocRef = doc(db, 'users', signedInUser.uid);
      let prof: UserProfile;

      try {
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          prof = {
            uid: signedInUser.uid,
            email: signedInUser.email || '',
            displayName: signedInUser.displayName || 'Security Auditor',
            photoURL: signedInUser.photoURL || undefined,
            role: 'auditor',
            provider: 'google',
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, prof);
        } else {
          prof = docSnap.data() as UserProfile;
        }
      } catch (dbErr) {
        prof = {
          uid: signedInUser.uid,
          email: signedInUser.email || '',
          displayName: signedInUser.displayName || 'Security Auditor',
          photoURL: signedInUser.photoURL || undefined,
          role: 'auditor',
          provider: 'google',
          createdAt: new Date().toISOString()
        };
      }

      setProfile(prof);
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was dismissed before completing.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Auth. Add it to Authorized domains in Firebase Console.');
      } else {
        setError(err.message || 'Google authentication encountered an issue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('mobilesec_active_user');
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setError('Failed to sign out.');
    }
  };

  const saveAuditToFirestore = async (
    title: string,
    score: number,
    patchedCount: number,
    totalCount: number
  ): Promise<boolean> => {
    if (!profile) return false;
    try {
      const sessionId = `audit-${Date.now()}`;
      const newSession: SavedAuditSession = {
        id: sessionId,
        userId: profile.uid,
        title: title || 'MobileSec OWASP Audit Benchmark',
        score,
        patchedCount,
        totalCount,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'auditSessions', sessionId), newSession);
      return true;
    } catch (e) {
      console.warn('Could not persist to Firestore, saving locally:', e);
      const existing = JSON.parse(localStorage.getItem('saved_audits') || '[]');
      existing.unshift({
        id: `audit-${Date.now()}`,
        userId: profile.uid,
        title,
        score,
        patchedCount,
        totalCount,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('saved_audits', JSON.stringify(existing));
      return true;
    }
  };

  const getSavedAuditSessions = async (): Promise<SavedAuditSession[]> => {
    if (!profile) return [];
    try {
      const q = query(collection(db, 'auditSessions'), where('userId', '==', profile.uid));
      const querySnapshot = await getDocs(q);
      const items: SavedAuditSession[] = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data() as SavedAuditSession);
      });
      if (items.length > 0) return items;
    } catch (e) {
      // Fallback to local storage
    }
    const local = JSON.parse(localStorage.getItem('saved_audits') || '[]');
    return local;
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signInWithGoogle,
        signOut,
        clearError,
        saveAuditToFirestore,
        getSavedAuditSessions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
