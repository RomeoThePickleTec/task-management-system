// src/services/auth/userSyncService.ts
import { User } from 'firebase/auth';
import { UserService } from '@/services/api/userService';
import { IUser, UserRole, WorkMode } from '@/core/interfaces/models';

/**
 * Service to synchronize Firebase users with backend database users
 */
export class UserSyncService {
  /**
   * Synchronize a Firebase user with the backend
   * Creates a new user if it doesn't exist, or updates an existing one
   * Gracefully handles backend connection failures
   */
  static async syncUserWithBackend(firebaseUser: User): Promise<IUser | null> {
    if (!firebaseUser.email) {
      console.error('Firebase user has no email');
      return null;
    }

    try {
      // Check if user already exists in the backend
      const existingUser = await this.findUserByEmail(firebaseUser.email);
      
      if (existingUser) {
        // User exists, update any necessary fields
        return await this.updateExistingUser(existingUser, firebaseUser);
      } else {
        // User doesn't exist, create a new one
        return await this.createNewUser(firebaseUser);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
      
      // Return a fallback user object based on Firebase data
      // This allows the app to function even if backend sync fails
      return this.createFallbackUserFromFirebase(firebaseUser);
    }
  }

  /**
   * Create a fallback user object from Firebase data
   * Used when backend connection fails
   */
  private static createFallbackUserFromFirebase(firebaseUser: User): IUser {
    const username = firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 8);
    
    return {
      id: null, // No ID since this isn't from backend
      username,
      email: firebaseUser.email!,
      full_name: firebaseUser.displayName || username,
      role: UserRole.DEVELOPER, // Default role
      work_mode: WorkMode.REMOTE, // Default work mode
      active: true,
      created_at: firebaseUser.metadata.creationTime,
      updated_at: firebaseUser.metadata.lastSignInTime,
      last_login: firebaseUser.metadata.lastSignInTime
    };
  }

  /**
   * Find a user in the backend by email
   */
  static async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      // Get all users from backend
      const users = await UserService.getUsers();
      
      // Find user with matching email
      return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error; // Let the calling function handle this
    }
  }

  /**
   * Update an existing user in the backend with Firebase data
   */
  private static async updateExistingUser(existingUser: IUser, firebaseUser: User): Promise<IUser | null> {
    try {
      // Check if we need to update any fields
      // For this implementation, we'll just ensure last_login is updated
      const updates: Partial<IUser> = {
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        // Only update these if they're different
        username: existingUser.username,
        email: firebaseUser.email || existingUser.email,
        // Preserve other fields
        full_name: existingUser.full_name,
        work_mode: existingUser.work_mode,
        role: existingUser.role,
        active: true
      };

      // If the user has a display name in Firebase but not in backend, update it
      if (firebaseUser.displayName && (!existingUser.full_name || existingUser.full_name === '')) {
        updates.full_name = firebaseUser.displayName;
      }

      // If user has an id, update the user
      if (existingUser.id) {
        return await UserService.updateUser(existingUser.id, updates);
      }
      
      return existingUser;
    } catch (error) {
      console.error('Error updating existing user:', error);
      return existingUser; // Return the original user if update fails
    }
  }

  /**
   * Create a new user in the backend from Firebase data
   */
  private static async createNewUser(firebaseUser: User): Promise<IUser | null> {
    try {
      // Create a username from email (remove domain)
      const username = firebaseUser.email?.split('@')[0] || firebaseUser.uid.substring(0, 8);
      
      // Create a new user with default values
      const newUser: Omit<IUser, 'id' | 'created_at' | 'updated_at'> = {
        username,
        email: firebaseUser.email!,
        full_name: firebaseUser.displayName || username,
        role: UserRole.DEVELOPER, // Default role
        work_mode: WorkMode.REMOTE, // Default work mode
        active: true,
        last_login: new Date().toISOString()
      };

      return await UserService.createUser(newUser);
    } catch (error) {
      console.error('Error creating new user:', error);
      // Return fallback user if creation fails
      return this.createFallbackUserFromFirebase(firebaseUser);
    }
  }

  /**
   * Update a user's profile in both Firebase and backend
   * Handles backend connection failures gracefully
   */
  static async updateUserProfile(
    userId: number | null, 
    firebaseUser: User, 
    profileData: { fullName?: string; workMode?: string; role?: UserRole }
  ): Promise<IUser | null> {
    // Always update Firebase profile if fullName is provided
    if (profileData.fullName && firebaseUser) {
      try {
        await firebaseUser.updateProfile({
          displayName: profileData.fullName
        });
      } catch (error) {
        console.error('Error updating Firebase profile:', error);
        // Continue with backend update even if Firebase update fails
      }
    }

    // If we don't have a userId, we can't update the backend
    if (userId === null) {
      // Return a fallback user with the updated profile data
      return this.createFallbackUserFromFirebase({
        ...firebaseUser,
        displayName: profileData.fullName || firebaseUser.displayName
      });
    }

    // Try to update backend
    try {
      const updates: Partial<IUser> = {
        updated_at: new Date().toISOString()
      };

      if (profileData.fullName) {
        updates.full_name = profileData.fullName;
      }

      if (profileData.workMode) {
        updates.work_mode = profileData.workMode;
      }

      if (profileData.role) {
        updates.role = profileData.role;
      }

      // Update user in backend
      return await UserService.updateUser(userId, updates);
    } catch (error) {
      console.error('Error updating user profile in backend:', error);
      
      // Return a fallback user with the updated profile data
      return this.createFallbackUserFromFirebase({
        ...firebaseUser,
        displayName: profileData.fullName || firebaseUser.displayName
      });
    }
  }

  /**
   * Delete a user from both Firebase and backend
   */
  static async deleteUser(userId: number | null, firebaseUser: User): Promise<boolean> {
    let backendDeleted = false;
    
    // Try to delete from backend if we have a userId
    if (userId !== null) {
      try {
        backendDeleted = await UserService.deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user from backend:', error);
        // Continue with Firebase deletion even if backend deletion fails
      }
    }
    
    // Try to delete from Firebase
    try {
      await firebaseUser.delete();
      return true; // Return true if Firebase deletion succeeds
    } catch (error) {
      console.error('Error deleting Firebase user:', error);
      return backendDeleted; // Return backend result if Firebase deletion fails
    }
  }
}

export default UserSyncService;