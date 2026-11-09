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
  getDocs,
  serverTimestamp
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
  provider: 'google' | 'demo';
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
  signInWithAuditorEmail: (email?: string, name?: string) => Promise<void>;
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

  // Load demo profile from localStorage if present
  useEffect(() => {
    const savedDemoUser = localStorage.getItem('mobilesec_active_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setProfile(parsed);
      } catch (e) {
        localStorage.removeItem('mobilesec_active_user');
      }
    }

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
              email: currentUser.email || 'morselsmoney@gmail.com',
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
            email: currentUser.email || 'morselsmoney@gmail.com',
            displayName: currentUser.displayName || 'Security Auditor',
            photoURL: currentUser.photoURL || undefined,
            role: 'auditor',
            provider: 'google',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // If not authenticated in Firebase Auth, check if demo profile is active
        const local = localStorage.getItem('mobilesec_active_user');
        if (!local) {
          setProfile(null);
        }
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
      const docSnap = await getDoc(userDocRef);

      let prof: UserProfile;
      if (!docSnap.exists()) {
        prof = {
          uid: signedInUser.uid,
          email: signedInUser.email || 'morselsmoney@gmail.com',
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
      setProfile(prof);
      localStorage.setItem('mobilesec_active_user', JSON.stringify(prof));
    } catch (err: any) {
      console.warn('Google Popup Sign-In note:', err);
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/popup-blocked') {
        setError(
          'Notice: Iframe domain restricted by Google OAuth. You can use the instant Google Auditor sign-in button below to test seamlessly.'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was dismissed before completing.');
      } else {
        setError(err.message || 'Google authentication encountered an issue.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant Google Auditor login (handles iframe / developer sandbox test requirements)
  const signInWithAuditorEmail = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const email = customEmail || 'morselsmoney@gmail.com';
      const displayName = customName || 'Alex Chen (Auditor)';
      const mockUid = `auditor-${btoa(email).slice(0, 12).toLowerCase()}`;

      const demoProfile: UserProfile = {
        uid: mockUid,
        email,
        displayName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        role: 'auditor',
        provider: 'demo',
        createdAt: new Date().toISOString()
      };

      setProfile(demoProfile);
      localStorage.setItem('mobilesec_active_user', JSON.stringify(demoProfile));

      // Attempt syncing to Firestore
      try {
        await setDoc(doc(db, 'users', mockUid), demoProfile, { merge: true });
      } catch (e) {
        // Local state works seamlessly even if offline
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
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
      // Fallback to local
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
        signInWithAuditorEmail,
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
