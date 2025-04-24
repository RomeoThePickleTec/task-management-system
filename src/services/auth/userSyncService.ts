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
      return null;
    }
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
      return null;
    }
  }

  /**
   * Update an existing user in the backend with Firebase data
   */
  private static async updateExistingUser(existingUser: IUser, firebaseUser: User): Promise<IUser | null> {
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
  }

  /**
   * Create a new user in the backend from Firebase data
   */
  private static async createNewUser(firebaseUser: User): Promise<IUser | null> {
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
  }

  /**
   * Update a user's profile in both Firebase and backend
   */
  static async updateUserProfile(
    userId: number, 
    firebaseUser: User, 
    profileData: { fullName?: string; workMode?: string; role?: UserRole }
  ): Promise<IUser | null> {
    try {
      // First update backend
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
      const updatedUser = await UserService.updateUser(userId, updates);

      // Update Firebase display name if provided
      if (profileData.fullName && firebaseUser) {
        await firebaseUser.updateProfile({
          displayName: profileData.fullName
        });
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  /**
   * Delete a user from both Firebase and backend
   */
  static async deleteUser(userId: number, firebaseUser: User): Promise<boolean> {
    try {
      // First delete from backend
      const backendDeleted = await UserService.deleteUser(userId);
      
      // Then delete from Firebase
      if (backendDeleted) {
        await firebaseUser.delete();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

export default UserSyncService;