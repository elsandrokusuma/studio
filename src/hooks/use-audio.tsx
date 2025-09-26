
'use client';

import React, { createContext, useContext, useRef, useCallback, ReactNode, useEffect } from 'react';

interface AudioContextType {
  playNotificationSound: () => void;
  unlockAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isUnlocked = useRef(false);

  useEffect(() => {
    // Initialize the audio element once on the client side
    audioRef.current = new Audio("/new-notification-024-370048.mp3");
    audioRef.current.preload = 'auto';
  }, []);
  
  // This function is to be called on the first user interaction (e.g., login click)
  const unlockAudio = useCallback(() => {
    if (audioRef.current && !isUnlocked.current) {
        // Play and immediately pause the audio. This is a common trick
        // to get audio permissions from the browser on user interaction.
        audioRef.current.muted = true;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                audioRef.current?.pause();
                audioRef.current!.currentTime = 0;
                audioRef.current!.muted = false;
                isUnlocked.current = true;
                console.log("Audio unlocked successfully.");
            }).catch(error => {
                console.error("Audio unlock failed:", error);
            });
        }
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      // Always try to play. If it's the first time, this might be blocked,
      // but subsequent calls after user interaction should succeed.
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Log error only if it's not the common "NotAllowedError"
        if (error.name !== 'NotAllowedError') {
            console.error("Error playing notification sound:", error);
        }
      });
    }
  }, []);

  return (
    <AudioContext.Provider value={{ playNotificationSound, unlockAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

    