
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

  // This effect will run only once on the client side after the initial render.
  useEffect(() => {
    if (!db) return;

    const unsubs: (() => void)[] = [];

    // Listener for low stock items
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

    // Generic listener setup function
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

    // Setting up listeners for approvals
    setupListener("pre-orders", "status", "Awaiting Approval", "poNumber", "stationery_approval", "Stationery Approvals", "/pre-orders", Clock);
    setupListener("sparepart-requests", "status", "Awaiting Approval", "requestNumber", "sparepart_approval", "Sparepart Approvals", "/approval-sparepart", Clock);

    // Cleanup function
    return () => {
      unsubs.forEach(unsub => unsub());
    };
    
  }, []);
  
  // Combine system notifications (persistent) and user notifications (temporary)
  const combinedNotifications = React.useMemo(() => {
    return [...userNotifications, ...systemNotifications];
  }, [userNotifications, systemNotifications]);

  // Effect to play sound on new notification
  useEffect(() => {
      if (combinedNotifications.length > prevNotificationCount.current) {
          audioRef.current?.play().catch(error => console.error("Audio play failed:", error));
      }
      prevNotificationCount.current = combinedNotifications.length;
  }, [combinedNotifications]);


  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    // Add to a temporary, client-side only state. This will not persist across reloads.
    const newNotif = { ...notification, id: `notif-${notificationId++}` };
    setUserNotifications(prev => [newNotif, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    // This will now only clear the temporary user notifications.
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
        {typeof window !== 'undefined' && (
          <audio ref={audioRef} src="/notification.mp3" preload="auto" />
        )}
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
