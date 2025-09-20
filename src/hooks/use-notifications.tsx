
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, Clock } from 'lucide-react';
import type { Transaction } from '@/lib/types';

export type Notification = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
};

// Helper function to play the notification sound, exported for use in other components
export const playNotificationSound = () => {
  const audio = new Audio("https://www.myinstants.com/media/sounds/pop-cat.mp3");
  audio.play().catch(error => {
    // Autoplay was prevented. This is a common browser restriction.
    // We can ignore this error as we have other mechanisms to unlock audio.
    console.warn("Audio play failed silently:", error.message);
  });
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
  const [isMounted, setIsMounted] = useState(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time listener for new transactions to play sound
  useEffect(() => {
    if (!db) return;

    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // To prevent playing sound on initial page load
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data() as Transaction;
          const validTypes = ['add', 'edit', 'out', 'in', 'delete'];
          if (validTypes.includes(data.type)) {
            console.log(`New transaction of type '${data.type}' detected, playing sound:`, data);
            playNotificationSound();
          }
        }
      });
    });

    return () => unsubscribe();
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
