import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthState, Institute } from '@/types';
import { firestoreService } from '@/services/firestoreService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setInstitute: (institute: Institute) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    institute: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          let userData;
          try {
            userData = await firestoreService.getUser(firebaseUser.uid);
          } catch (firestoreError) {
            console.warn('Firestore not available, using basic user data:', firestoreError);
            // Create basic user data without Firestore
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: 'faculty' as const,
              instituteId: 'default',
              lastLoginAt: new Date(),
            };
          }
          
          if (!userData) {
            // User doesn't exist in Firestore, create them
            console.log('User not found in Firestore, creating new user record...');
            
            // Get selected institute from localStorage or default to first available institute
            const savedInstituteId = localStorage.getItem('selectedInstituteId');
            let instituteId = savedInstituteId;
            
            if (!instituteId) {
              // If no saved institute, get the first available institute
              const institutes = await firestoreService.getInstitutes();
              if (institutes.length > 0) {
                instituteId = institutes[0].id;
                localStorage.setItem('selectedInstituteId', instituteId);
              }
            }
            
            if (instituteId) {
              // Create new user record in Firestore
              const newUser = {
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Faculty Member',
                role: 'faculty' as const,
                instituteId: instituteId,
                lastLoginAt: new Date(),
              };
              
              // Use the Firebase UID as the Firestore document ID
              await firestoreService.createUserWithId(firebaseUser.uid, newUser);
              userData = { id: firebaseUser.uid, ...newUser };
              
              console.log('New user created successfully');
            }
          }
          
          if (userData) {
            // Update last login time (skip if Firestore not available)
            try {
              await firestoreService.updateUser(userData.id, { lastLoginAt: new Date() });
            } catch (updateError) {
              console.warn('Could not update user login time:', updateError);
            }
            
            // Get institute data (use default if Firestore not available)
            let instituteData;
            try {
              instituteData = await firestoreService.getInstitute(userData.instituteId);
            } catch (instituteError) {
              console.warn('Could not fetch institute data, using default:', instituteError);
              instituteData = {
                id: 'default',
                name: 'Default Institute',
                domain: '@example.com',
                createdAt: new Date(),
              };
            }
            
            setAuthState({
              user: userData,
              institute: instituteData,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              institute: null,
              loading: false,
              error: 'Unable to create or find user data',
            });
          }
        } else {
          setAuthState({
            user: null,
            institute: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAuthState({
          user: null,
          institute: null,
          loading: false,
          error: 'Failed to load user data',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Sign in failed' 
      }));
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const { signInWithGoogle: googleSignIn } = await import('@/lib/firebase');
      await googleSignIn();
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Google sign in failed' 
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { signOutUser } = await import('@/lib/firebase');
      await signOutUser();
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const setInstitute = (institute: Institute) => {
    setAuthState(prev => ({ ...prev, institute }));
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signInWithGoogle,
    signOut,
    setInstitute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
