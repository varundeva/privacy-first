'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FileContextType {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({
  children,
  initialFile = null,
}: {
  children: ReactNode;
  initialFile?: File | null;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <FileContext.Provider
      value={{ selectedFile, setSelectedFile, isProcessing, setIsProcessing }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
}
