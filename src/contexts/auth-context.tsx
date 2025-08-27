
"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app, rtdb } from '@/lib/firebase';
import { ref, get, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';

const ADMIN_UIDS = ['acwv7Lgy8UeFP2JlOHzZ75DI55b2', 'qEIkvnpQLZaSjmkh47TRFOQAmVB3'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  propertyLimit: number;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false, propertyLimit: 1 });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [propertyLimit, setPropertyLimit] = useState(1);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        setIsAdmin(ADMIN_UIDS.includes(currentUser.uid));
        
        try {
          const userRef = ref(rtdb, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            // Set property limit from DB, or default to 1
            setPropertyLimit(userData?.propertyLimit ?? 1);
          } else {
            // Default for users who might not have a DB entry yet
            setPropertyLimit(1);
          }
        } catch (error) {
            console.error("Failed to fetch user data from RTDB", error);
            setPropertyLimit(1); // Default on error
        }
      } else {
        // No user, reset states
        setIsAdmin(false);
        setPropertyLimit(1);
      }
      
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth, router]);

  // Separate effect for real-time listeners on user data (like propertyLimit)
  useEffect(() => {
    if (user) {
      const userRef = ref(rtdb, `users/${user.uid}`);
      const unsubscribeDb = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          // This ensures the property limit is updated in real-time if changed by an admin
          setPropertyLimit(userData?.propertyLimit ?? 1);
        }
      });
      return () => unsubscribeDb();
    }
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, propertyLimit }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
