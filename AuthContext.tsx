import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/api";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  totalBlasts?: number;
  activeOrders?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "blastmycv_user";

function normalizeUser(raw: any): UserProfile {
  return {
    id: String(raw.id ?? ""),
    firstName: raw.firstName ?? raw.first_name ?? raw.name?.split(" ")[0] ?? "",
    lastName:
      raw.lastName ??
      raw.last_name ??
      raw.name?.split(" ").slice(1).join(" ") ??
      "",
    email: raw.email ?? "",
    phone: raw.phone ?? raw.phone_number ?? undefined,
    avatar: raw.avatar ?? raw.profile_picture ?? undefined,
    jobTitle: raw.jobTitle ?? raw.job_title ?? raw.title ?? undefined,
    location: raw.location ?? undefined,
    bio: raw.bio ?? undefined,
    totalBlasts: raw.totalBlasts ?? raw.total_blasts ?? undefined,
    activeOrders: raw.activeOrders ?? raw.active_orders ?? undefined,
    createdAt: raw.createdAt ?? raw.created_at ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // Verify the session is still alive; if not, clear and force re-login
          try {
            const fresh = await api.get<any>(ENDPOINTS.auth.me);
            if (fresh && fresh.id) {
              const normalized = normalizeUser(fresh);
              setUser(normalized);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));
            }
          } catch {
            // Session expired — clear stored user so app shows login screen
            await AsyncStorage.removeItem(USER_KEY);
            setUser(null);
          }
        }
      } catch {
        // ignore storage errors
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<any>(ENDPOINTS.auth.login, { email, password });
    // PHP returns user data directly or nested under 'user'
    const raw = res.user ?? res;
    const normalized = normalizeUser(raw);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));
    setUser(normalized);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post<any>(ENDPOINTS.auth.register, data);
    const raw = res.user ?? res;
    const normalized = normalizeUser(raw);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = async () => {
    try {
      await api.post(ENDPOINTS.auth.logout);
    } catch {
      // ignore — session may already be gone
    }
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
