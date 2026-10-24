import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentProfile, TeacherProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  register: (data: { name: string; email: string; role: UserRole; studentProfile?: StudentProfile; teacherProfile?: TeacherProfile }) => Promise<boolean>;
  switchDemoUser: (userId: string) => Promise<void>;
  updateProfile: (updates: { name?: string; studentProfile?: Partial<StudentProfile>; teacherProfile?: Partial<TeacherProfile> }) => Promise<boolean>;
  logout: () => void;
  allUsers: User[];
  refreshUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
        return data.users as User[];
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    return [];
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const users = await fetchUsers();

      // Check stored token or user
      const storedToken = localStorage.getItem('mm_token');
      const storedUserId = localStorage.getItem('mm_user_id');

      if (storedUserId && users.length > 0) {
        const matched = users.find((u) => u.id === storedUserId);
        if (matched) {
          setCurrentUser(matched);
          setToken(storedToken || `token-${matched.id}`);
          setIsLoading(false);
          return;
        }
      }

      // Default to Aarav Sharma (B.Tech CSE Student) for immediate rich exploration
      if (users.length > 0) {
        const defaultUser = users.find((u) => u.id === 'user-btech-student') || users[0];
        setCurrentUser(defaultUser);
        setToken(`token-${defaultUser.id}`);
        localStorage.setItem('mm_user_id', defaultUser.id);
        localStorage.setItem('mm_token', `token-${defaultUser.id}`);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('mm_user_id', data.user.id);
        localStorage.setItem('mm_token', data.token);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const register = async (data: {
    name: string;
    email: string;
    role: UserRole;
    studentProfile?: StudentProfile;
    teacherProfile?: TeacherProfile;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        setCurrentUser(result.user);
        setToken(result.token);
        localStorage.setItem('mm_user_id', result.user.id);
        localStorage.setItem('mm_token', result.token);
        await fetchUsers();
        return true;
      }
    } catch (err) {
      console.error('Register error:', err);
    }
    return false;
  };

  const switchDemoUser = async (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      const newToken = `token-${target.id}`;
      setToken(newToken);
      localStorage.setItem('mm_user_id', target.id);
      localStorage.setItem('mm_token', newToken);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    studentProfile?: Partial<StudentProfile>;
    teacherProfile?: Partial<TeacherProfile>;
  }): Promise<boolean> => {
    if (!currentUser || !token) return false;
    try {
      const payload: any = {};
      if (updates.name) payload.name = updates.name;
      if (updates.studentProfile && currentUser.studentProfile) {
        payload.studentProfile = { ...currentUser.studentProfile, ...updates.studentProfile };
      }
      if (updates.teacherProfile && currentUser.teacherProfile) {
        payload.teacherProfile = { ...currentUser.teacherProfile, ...updates.teacherProfile };
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setCurrentUser(result.user);
        await fetchUsers();
        return true;
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user_id');
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        login,
        register,
        switchDemoUser,
        updateProfile,
        logout,
        allUsers,
        refreshUsers: fetchUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
