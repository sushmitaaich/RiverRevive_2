import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/index';

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {() => void} logout
 * @property {(userData: Partial<User>, password: string) => Promise<void>} register
 */

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'citizen@riverrevive.gov',
    password: 'citizen123',
    name: 'Raj Patel',
    role: 'citizen' as 'citizen',
    points: 150,
    location: 'Mumbai, Maharashtra'
  },
  {
    id: '2',
    email: 'collector@riverrevive.gov',
    password: 'collector123',
    name: 'Amit Kumar',
    role: 'collector' as 'collector',
    points: 320,
    location: 'Delhi, India'
  },
  {
    id: '3',
    email: 'admin@riverrevive.gov',
    password: 'admin123',
    name: 'Priya Singh',
    role: 'admin' as 'admin',
    points: 0,
    location: 'Bangalore, Karnataka'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  interface MockUser extends User {
    password: string;
  }

  const login = async (email: string, password: string): Promise<void> => {
    const foundUser = mockUsers.find(
      (u: MockUser) => u.email === email && u.password === password
    );
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  interface RegisterUserData {
    email?: string;
    name?: string;
    role?: 'citizen' | 'collector' | 'admin';
    location?: string;
  }

  const register = async (userData: RegisterUserData, password: string): Promise<void> => {
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'citizen',
      points: 0,
      location: userData.location || ''
    };
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}