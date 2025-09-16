
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
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
        const storedNotifications = sessionStorage.getItem('userNotifications');
        if (storedNotifications) {
            setUserNotifications(JSON.parse(storedNotifications));
        }
    } catch (error) {
        console.error("Failed to parse notifications from sessionStorage", error);
    }
  }, []);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setUserNotifications(prev => {
        const newNotif = { ...notification, id: `notif-${notificationId++}` };
        const updatedNotifications = [newNotif, ...prev];
        
        try {
            sessionStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
        } catch (error) {
            console.error("Failed to save notifications to sessionStorage", error);
        }
        
        return updatedNotifications;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setUserNotifications([]);
    try {
        sessionStorage.removeItem('userNotifications');
    } catch (error) {
        console.error("Failed to clear notifications from sessionStorage", error);
    }
  }, []);
  
  useEffect(() => {
    if (!db || !isMounted) return;

    const unsubs: (() => void)[] = [];

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

    setupListener("pre-orders", "status", "Awaiting Approval", "poNumber", "stationery_approval", "Stationery Approvals", "/pre-orders", Clock);
    setupListener("sparepart-requests", "status", "Awaiting Approval", "requestNumber", "sparepart_approval", "Sparepart Approvals", "/approval-sparepart", Clock);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
    
  }, [isMounted]);
  
  const combinedNotifications = React.useMemo(() => {
    if (!isMounted) return [];
    return [...userNotifications, ...systemNotifications];
  }, [isMounted, userNotifications, systemNotifications]);

  const value = { 
    notifications: combinedNotifications,
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
