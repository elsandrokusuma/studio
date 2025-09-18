
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, Clock } from 'lucide-react';

export type Notification = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notificationId = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNotificationCount = useRef(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize audio element here to ensure it's created on the client side.
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio("/nada-dering-mainan-tembakan-363154.mp3");
      audioRef.current.preload = 'auto';

      // This is the key part to unlock audio autoplay in browsers.
      // We need to play the audio in response to a direct user interaction.
      const unlockAudio = () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            // Immediately pause it. We just want the browser's permission.
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            console.log("Audio unlocked successfully.");
          }).catch(error => {
            // Autoplay was prevented. This is expected if user hasn't interacted.
            console.error("Audio unlock failed initially:", error);
          });
          // Remove the event listeners after the first interaction.
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
          document.removeEventListener('keydown', unlockAudio);
        }
      };

      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);
      document.addEventListener('keydown', unlockAudio);

      return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
    }
  }, []);

  useEffect(() => {
    if (!db || !isMounted) return;

    const unsubs: (() => void)[] = [];

    const lowStockQuery = query(collection(db, "inventory"), where("quantity", "<=", 5));
    const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
        setSystemNotifications(prev => {
            const others = prev.filter(n => n.id !== 'system-low_stock');
            if (!snapshot.empty) {
                return [{
                    id: 'system-low_stock',
                    title: 'Low Stock Items',
                    description: `You have ${snapshot.size} items with low stock.`,
                    href: '/inventory',
                    icon: AlertCircle,
                }, ...others];
            }
            return others;
        });
    });
    unsubs.push(unsubscribeLowStock);

    const setupListener = (
      collectionName: string,
      statusField: string,
      statusValue: string,
      groupByField: string,
      notificationType: string,
      title: string,
      href: string,
      icon: React.ElementType
    ) => {
      const q = query(collection(db, collectionName), where(statusField, "==", statusValue));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const uniqueItems = new Set(snapshot.docs.map(doc => doc.data()[groupByField]));
        
        setSystemNotifications(prev => {
          const others = prev.filter(n => n.id !== `system-${notificationType}`);
          if (uniqueItems.size > 0) {
            return [{
              id: `system-${notificationType}`,
              title: title,
              description: `You have ${uniqueItems.size} request(s) that need attention.`,
              href: href,
              icon: icon,
            }, ...others];
          }
          return others;
        });
      });
      unsubs.push(unsubscribe);
    };

    setupListener("pre-orders", "status", "Awaiting Approval", "poNumber", "stationery_approval", "Stationery Approvals", "/pre-orders", Clock);
    setupListener("sparepart-requests", "status", "Awaiting Approval", "requestNumber", "sparepart_approval", "Sparepart Approvals", "/approval-sparepart", Clock);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
    
  }, [isMounted]);
  
  const combinedNotifications = React.useMemo(() => {
    return [...userNotifications, ...systemNotifications].sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [userNotifications, systemNotifications]);

  useEffect(() => {
    if (isMounted && combinedNotifications.length > prevNotificationCount.current) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0; // Rewind to start before playing
          audioRef.current.play().catch(error => {
              console.error("Audio play failed:", error);
          });
        }
    }
    prevNotificationCount.current = combinedNotifications.length;
  }, [combinedNotifications, isMounted]);


  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotif = { ...notification, id: `notif-${notificationId++}` };
    setUserNotifications(prev => [newNotif, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    setUserNotifications([]);
  }, []);

  const value = { 
    notifications: combinedNotifications,
    addNotification, 
    clearNotifications 
  };

  return (
    <NotificationContext.Provider value={value}>
        {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
