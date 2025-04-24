// src/services/auth/backendToFirebaseSync.ts
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    sendPasswordResetEmail,
    UserCredential
  } from 'firebase/auth';
  import { UserService } from '@/services/api/userService';
  import { IUser } from '@/core/interfaces/models';
  import { toast } from '@/components/ui/use-toast';
  
  /**
   * Service to synchronize backend database users to Firebase Authentication
   */
  export class BackendToFirebaseSync {
    /**
     * Checks if a user exists in Firebase by email
     */
    static async checkUserExistsInFirebase(email: string): Promise<boolean> {
      const auth = getAuth();
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length > 0;
      } catch (error) {
        console.error('Error checking if user exists in Firebase:', error);
        return false;
      }
    }
  
    /**
     * Creates a Firebase user from backend user data
     * Note: This requires a temporary password which will need to be reset
     */
    static async createFirebaseUser(
      backendUser: IUser, 
      tempPassword: string = 'TemporaryPassword123!'
    ): Promise<UserCredential | null> {
      if (!backendUser.email) {
        console.error('Backend user has no email address');
        return null;
      }
  
      const auth = getAuth();
      
      try {
        // Create the user in Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          backendUser.email, 
          tempPassword
        );
        
        // Update the display name
        await updateProfile(userCredential.user, {
          displayName: backendUser.full_name || backendUser.username
        });
        
        // Send password reset email so user can set their own password
        await sendPasswordResetEmail(auth, backendUser.email);
        
        console.log(`Created Firebase user for ${backendUser.email} and sent password reset email`);
        
        return userCredential;
      } catch (error) {
        console.error('Error creating Firebase user:', error);
        return null;
      }
    }
  
    /**
     * Synchronize all backend users to Firebase
     * Use with caution as this will create Firebase accounts for all users in your backend
     */
    static async syncAllBackendUsersToFirebase(
      sendPasswordResetEmails: boolean = false
    ): Promise<{created: number, existing: number, failed: number}> {
      const results = {
        created: 0,
        existing: 0,
        failed: 0
      };
      
      try {
        // Get all users from backend
        const backendUsers = await UserService.getUsers();
        
        // Process each user
        for (const user of backendUsers) {
          if (!user.email) {
            console.warn(`User ${user.id} has no email, skipping`);
            continue;
          }
          
          // Check if user already exists in Firebase
          const existsInFirebase = await this.checkUserExistsInFirebase(user.email);
          
          if (existsInFirebase) {
            console.log(`User ${user.email} already exists in Firebase`);
            results.existing++;
            continue;
          }
          
          // Create user in Firebase
          const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;
          const userCredential = await this.createFirebaseUser(user, tempPassword);
          
          if (userCredential) {
            results.created++;
            
            // Send password reset email if requested
            if (sendPasswordResetEmails) {
              try {
                await sendPasswordResetEmail(getAuth(), user.email);
              } catch (error) {
                console.error(`Failed to send password reset email to ${user.email}:`, error);
              }
            }
          } else {
            results.failed++;
          }
        }
        
        return results;
      } catch (error) {
        console.error('Error synchronizing backend users to Firebase:', error);
        throw error;
      }
    }
  
    /**
     * Synchronize a specific backend user to Firebase
     */
    static async syncBackendUserToFirebase(
      userId: number, 
      sendPasswordResetEmail: boolean = true
    ): Promise<boolean> {
      try {
        // Get user from backend
        const backendUser = await UserService.getUserById(userId);
        
        if (!backendUser || !backendUser.email) {
          console.error(`User ${userId} not found or has no email`);
          return false;
        }
        
        // Check if user already exists in Firebase
        const existsInFirebase = await this.checkUserExistsInFirebase(backendUser.email);
        
        if (existsInFirebase) {
          console.log(`User ${backendUser.email} already exists in Firebase`);
          return true;
        }
        
        // Create user in Firebase
        const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;
        const userCredential = await this.createFirebaseUser(backendUser, tempPassword);
        
        return userCredential !== null;
      } catch (error) {
        console.error(`Error synchronizing user ${userId} to Firebase:`, error);
        return false;
      }
    }
  }
  
  export default BackendToFirebaseSync;