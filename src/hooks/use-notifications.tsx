
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

const NOTIFICATION_STORAGE_KEY = 'app-notifications';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load notifications from sessionStorage on initial mount
  useEffect(() => {
    setIsMounted(true); // Component is now mounted on the client
    try {
      const storedNotifications = sessionStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Failed to parse notifications from sessionStorage", error);
    }
  }, []);
  
  // Save notifications to sessionStorage whenever they change
  useEffect(() => {
    if (!isMounted) return; // Only run on client after mount
    try {
      sessionStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to sessionStorage", error);
    }
  }, [notifications, isMounted]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setNotifications(prev => [{ ...notification, id: `notif-${notificationId++}` }, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(n => n.id.startsWith('system-')));
    // Also clear the storage from non-system notifications
    try {
        const systemNotifications = notifications.filter(n => n.id.startsWith('system-'));
        sessionStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(systemNotifications));
    } catch (error) {
        console.error("Failed to clear notifications from sessionStorage", error);
    }
  }, [notifications]);

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

    const lowStockQuery = query(collection(db, "inventory"), where("quantity", "<=", 5));
    const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
        setNotifications(prev => {
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
