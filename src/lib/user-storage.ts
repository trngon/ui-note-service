import fs from 'fs';
import path from 'path';
import { User } from '@/types/auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Utility functions for managing user data in JSON files
 */

/**
 * Ensure the data directory and users file exist
 */
function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Read all users from the JSON file
 */
export function readUsers(): User[] {
  ensureDataFile();
  
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

/**
 * Write users array to the JSON file
 */
export function writeUsers(users: User[]): void {
  ensureDataFile();
  
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Find a user by email
 */
export function findUserByEmail(email: string): User | null {
  const users = readUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find a user by ID
 */
export function findUserById(id: string): User | null {
  const users = readUsers();
  return users.find(user => user.id === id) || null;
}

/**
 * Create a new user
 */
export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const users = readUsers();
  
  // Check if user already exists
  if (findUserByEmail(userData.email)) {
    throw new Error('User with this email already exists');
  }
  
  const newUser: User = {
    ...userData,
    id: generateUserId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  writeUsers(users);
  
  return newUser;
}

/**
 * Generate a simple user ID
 */
function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
