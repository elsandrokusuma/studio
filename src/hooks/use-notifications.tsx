
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Component is now mounted on the client
  }, []);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    // User-generated notifications are only stored in local state and not persisted.
    setNotifications(prev => [{ ...notification, id: `notif-${notificationId++}` }, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    // Only keep system notifications from Firestore
    setNotifications(prev => prev.filter(n => n.id.startsWith('system-')));
  }, []);

  useEffect(() => {
    if (!db || !isMounted) return; // Only run on client after mount

    const unsubs: (() => void)[] = [];

    const setupListener = (
      collectionName: string,
      statusField: string,
      statusValue: string,
      groupByField: string,
      notificationType: string, // Unique key for this notification type
      title: string,
      href: string,
      icon: React.ElementType
    ) => {
      const q = query(collection(db, collectionName), where(statusField, "==", statusValue));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const uniqueItems = new Set(snapshot.docs.map(doc => doc.data()[groupByField]));
        setNotifications(prev => {
          // Remove old notification of this type
          const others = prev.filter(n => n.id !== `system-${notificationType}` && !n.id.startsWith('notif-'));
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

    const lowStockQuery = query(collection(db, "inventory"), where("quantity", "<=", 5));
    const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
        setNotifications(prev => {
            // Keep user-added notifications and filter out old system notifications
            const userNotifications = prev.filter(n => n.id.startsWith('notif-'));
            const otherSystemNotifications = prev.filter(n => n.id.startsWith('system-') && n.id !== 'system-low_stock');
            
            let newNotifications = [...userNotifications, ...otherSystemNotifications];

            if (!snapshot.empty) {
                newNotifications.unshift({
                    id: 'system-low_stock',
                    title: 'Low Stock Items',
                    description: `You have ${snapshot.size} items with low stock.`,
                    href: '/inventory',
                    icon: AlertCircle,
                });
            }
            return newNotifications;
        });
    });
    unsubs.push(unsubscribeLowStock);

    setupListener("pre-orders", "status", "Awaiting Approval", "poNumber", "stationery_approval", "Stationery Approvals", "/pre-orders", Clock);
    setupListener("sparepart-requests", "status", "Awaiting Approval", "requestNumber", "sparepart_approval", "Sparepart Approvals", "/approval-sparepart", Clock);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
    
  }, [isMounted]);


  const value = { 
    notifications: isMounted ? notifications : [], // Return empty array until mounted
    addNotification, 
    clearNotifications 
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
