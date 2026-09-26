import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser } from "../types";
import { api } from "../services/api";
import { joinUserRoom } from "../services/socket";

export type PersonaRole = 'driver' | 'passenger' | 'admin';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  activePersona: PersonaRole;
  setActivePersona: (role: PersonaRole) => void;
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (
    persona: "aditya" | "rahul" | "priya" | "ananya" | "rohan" | "kabir" | "meera" | "tanvi" | "admin" | "moderator",
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DEMO_PASSWORD = "CampusRide2025!";

const DEMO_USERS = {
  aditya: { email: "aditya.kumar@college.edu", password: DEMO_PASSWORD, defaultRole: 'driver' as PersonaRole },
  rahul: { email: "rahul.sharma@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  priya: { email: "priya.singh@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  ananya: { email: "ananya.verma@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  rohan: { email: "rohan.mehta@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  kabir: { email: "kabir.sharma@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  meera: { email: "meera.nair@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  tanvi: { email: "tanvi.sharma@college.edu", password: DEMO_PASSWORD, defaultRole: 'passenger' as PersonaRole },
  admin: { email: "admin@campusride.edu", password: DEMO_PASSWORD, defaultRole: 'admin' as PersonaRole },
  moderator: { email: "moderator@campusride.edu", password: DEMO_PASSWORD, defaultRole: 'admin' as PersonaRole },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const isExplicitAuth = localStorage.getItem("campusride_auth_v2") === "true";
    if (!isExplicitAuth) {
      // Purge legacy auto-login tokens from earlier sessions so visitor is greeted with Sign In / Sign Up gateway
      localStorage.removeItem("campusride_token");
      localStorage.removeItem("campusride_persona");
      return null;
    }
    return localStorage.getItem("campusride_token");
  });
  const [loading, setLoading] = useState(true);
  const [activePersona, setActivePersonaState] = useState<PersonaRole>(() => {
    const saved = localStorage.getItem("campusride_persona") as PersonaRole;
    if (saved && ['driver', 'passenger', 'admin'].includes(saved)) {
      return saved;
    }
    return 'driver';
  });

  const setActivePersona = (role: PersonaRole) => {
    setActivePersonaState(role);
    localStorage.setItem("campusride_persona", role);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("campusride_user", JSON.stringify(data.user));
        localStorage.setItem("campusride_user_email", data.user.email);
        joinUserRoom(data.user._id);
        if (data.user.role === 'super_admin' || data.user.role === 'campus_admin' || data.user.role === 'moderator') {
          setActivePersona('admin');
        } else if (data.user.role === 'driver' || data.user.accountType === 'DRIVER') {
          setActivePersona('driver');
        } else {
          setActivePersona('passenger');
        }
      }
    } catch (err) {
      console.warn("[Auth] Failed to refresh user profile:", err);
      localStorage.removeItem("campusride_token");
      localStorage.removeItem("campusride_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password = DEMO_PASSWORD) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem("campusride_auth_v2", "true");
      localStorage.setItem("campusride_token", res.token);
      if (res.user) {
        localStorage.setItem("campusride_user", JSON.stringify(res.user));
        localStorage.setItem("campusride_user_email", res.user.email);
      }
      setToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
      if (res.user?.role === 'super_admin' || res.user?.role === 'campus_admin' || res.user?.role === 'moderator') {
        setActivePersona('admin');
      } else if (res.user?.role === 'driver' || res.user?.accountType === 'DRIVER') {
        setActivePersona('driver');
      } else {
        setActivePersona('passenger');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      localStorage.setItem("campusride_auth_v2", "true");
      localStorage.setItem("campusride_token", res.token);
      if (res.user) {
        localStorage.setItem("campusride_user", JSON.stringify(res.user));
        localStorage.setItem("campusride_user_email", res.user.email);
      }
      setToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
      if (res.user?.role === 'super_admin' || res.user?.role === 'campus_admin' || res.user?.role === 'moderator') {
        setActivePersona('admin');
      } else if (res.user?.role === 'driver' || res.user?.accountType === 'DRIVER') {
        setActivePersona('driver');
      } else {
        setActivePersona('passenger');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.updateProfile(data);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem("campusride_user", JSON.stringify(res.user));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("campusride_token");
    localStorage.removeItem("campusride_persona");
    localStorage.removeItem("campusride_auth_v2");
    localStorage.removeItem("campusride_user_email");
    localStorage.removeItem("campusride_user");
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (
    persona: "aditya" | "rahul" | "priya" | "ananya" | "rohan" | "kabir" | "meera" | "tanvi" | "admin" | "moderator",
  ) => {
    const creds = DEMO_USERS[persona];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activePersona,
        setActivePersona,
        login,
        register,
        updateProfile,
        logout,
        switchDemoUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
