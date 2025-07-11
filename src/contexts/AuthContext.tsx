import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "student" | "teacher" | "admin";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createDefaultProfile = async (
    userId: string,
    userEmail: string,
    userName?: string,
  ) => {
    try {
      console.log("Creating default profile for user:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userEmail,
          full_name: userName || userEmail.split("@")[0],
          role: "student", // Default role
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating default profile:", error);
        throw error;
      }

      console.log("Default profile created successfully:", data);
      setProfile(data);

      toast({
        title: "Welcome!",
        description: "Your profile has been set up successfully.",
      });

      return data;
    } catch (error) {
      console.error("Error creating default profile:", error);
      throw error;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        // If profile doesn't exist (PGRST116 is "not found" error)
        if (error.code === "PGRST116") {
          console.log("Profile not found, need to create one...");

          // Get user info to create profile
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            await createDefaultProfile(
              userId,
              authUser.user.email || "",
              authUser.user.user_metadata?.full_name,
            );
            return;
          }
        }

        throw error;
      }

      console.log("Profile fetched successfully:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        userId,
      });

      // Show user-friendly error message
      toast({
        title: "Profile Error",
        description:
          "Failed to load user profile. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id);

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        // Defer profile fetching to prevent race conditions
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 100);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName || email.split("@")[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();

      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Continue even if this fails
        console.log("Global signout failed, continuing...", err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

        // Navigate to dashboard after short delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();

      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Ignore errors
        console.log("Signout error (ignored):", err);
      }

      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

      // Force page reload for clean state
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchProfile(user.id);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
