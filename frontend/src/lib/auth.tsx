import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Plan = "free" | "pro";

export interface User {
  email: string;
  name: string;
  plan: Plan;
  createdAt: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setPlan: (plan: Plan) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "ig_users";
const SESSION_KEY = "ig_session";

function hash(input: string): string {
  // lightweight non-cryptographic hash for demo persistence only
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return String(h);
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): User | null {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const found = readUsers().find((u) => u.email === email);
  if (!found) return null;
  const { passwordHash: _ph, ...pub } = found;
  void _ph;
  return pub;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);

  async function register(name: string, email: string, password: string) {
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      throw new Error("Пользователь с таким e-mail уже зарегистрирован");
    }
    const stored: StoredUser = {
      name: name.trim() || normalized.split("@")[0],
      email: normalized,
      plan: "free",
      createdAt: new Date().toISOString(),
      passwordHash: hash(password),
    };
    writeUsers([...users, stored]);
    localStorage.setItem(SESSION_KEY, normalized);
    const { passwordHash: _ph, ...pub } = stored;
    void _ph;
    setUser(pub);
  }

  async function login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const found = readUsers().find((u) => u.email === normalized);
    if (!found || found.passwordHash !== hash(password)) {
      throw new Error("Неверный e-mail или пароль");
    }
    localStorage.setItem(SESSION_KEY, normalized);
    const { passwordHash: _ph, ...pub } = found;
    void _ph;
    setUser(pub);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  function setPlan(plan: Plan) {
    if (!user) return;
    const users = readUsers().map((u) =>
      u.email === user.email ? { ...u, plan } : u,
    );
    writeUsers(users);
    setUser({ ...user, plan });
  }

  const value: AuthContextValue = { user, login, register, logout, setPlan };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
