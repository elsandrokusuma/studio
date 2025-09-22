
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
    audioRef.current = new Audio("/nada-dering-mainan-tembakan-363154.mp3");
    audioRef.current.preload = 'auto';
  }, []);
  
  const unlockAudio = useCallback(() => {
    if (audioRef.current && !isUnlocked.current) {
        // Play and immediately pause the audio. This is a common trick
        // to get audio permissions from the browser on user interaction.
        audioRef.current.muted = true;
        audioRef.current.play().then(() => {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            audioRef.current!.muted = false;
            isUnlocked.current = true;
            console.log("Audio unlocked successfully.");
        }).catch(error => {
            console.error("Audio unlock failed:", error);
        });
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current && isUnlocked.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("Error playing notification sound:", error);
      });
    } else {
        console.warn("Audio context not unlocked. Sound was suppressed.");
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
