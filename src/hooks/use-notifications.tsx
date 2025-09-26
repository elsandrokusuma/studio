
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, Clock } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { useAudio } from './use-audio';

export type Notification = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  timestamp: number;
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notificationId = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { playNotificationSound } = useAudio();
  const systemNotificationCounts = useRef<Record<string, number>>({});


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !isMounted) return;

    const unsubs: (() => void)[] = [];

    const lowStockQuery = query(collection(db, "inventory"), where("quantity", "<=", 5));
    const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
        const hasLowStock = !snapshot.empty;
        const newCount = snapshot.size;
        const id = 'system-low_stock';

        setSystemNotifications(prev => {
            const others = prev.filter(n => n.id !== id);
            if (hasLowStock) {
                if (systemNotificationCounts.current[id] !== newCount) {
                    playNotificationSound();
                }
                systemNotificationCounts.current[id] = newCount;
                return [{
                    id,
                    title: 'Low Stock Items',
                    description: `You have ${newCount} items with low stock.`,
                    href: '/inventory',
                    icon: AlertCircle,
                    timestamp: Date.now(),
                }, ...others];
            }
            delete systemNotificationCounts.current[id];
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
        const newCount = uniqueItems.size;
        const id = `system-${notificationType}`;
        
        setSystemNotifications(prev => {
          const others = prev.filter(n => n.id !== id);
          if (newCount > 0) {
            if (systemNotificationCounts.current[id] !== newCount) {
                playNotificationSound();
            }
            systemNotificationCounts.current[id] = newCount;
            return [{
              id,
              title: title,
              description: `You have ${newCount} request(s) that need attention.`,
              href: href,
              icon: icon,
              timestamp: Date.now(),
            }, ...others];
          }
          delete systemNotificationCounts.current[id];
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
    
  }, [isMounted, playNotificationSound]);
  
  const combinedNotifications = React.useMemo(() => {
    return [...userNotifications, ...systemNotifications].sort((a, b) => b.timestamp - a.timestamp);
  }, [userNotifications, systemNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotif = { ...notification, id: `notif-${notificationId++}`, timestamp: Date.now() };
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

    