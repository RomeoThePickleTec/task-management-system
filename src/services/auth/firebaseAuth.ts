// src/services/auth/firebaseAuth.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
  User,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Authentication service
export const FirebaseAuthService = {
  // Register new user with email and password
  register: async (email: string, password: string): Promise<UserCredential> => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Logout current user
  logout: async (): Promise<void> => {
    return await signOut(auth);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Get auth token for API requests
  getAuthToken: async (forceRefresh: boolean = false): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    return await sendPasswordResetEmail(auth, email);
  },

  // Confirm password reset with code and new password
  confirmPasswordReset: async (code: string, newPassword: string): Promise<void> => {
    return await confirmPasswordReset(auth, code, newPassword);
  },

  // Verify password reset code
  verifyPasswordResetCode: async (code: string): Promise<string> => {
    return await verifyPasswordResetCode(auth, code);
  }
};

export default FirebaseAuthService;