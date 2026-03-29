"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { NewOperationModal } from "@/components/modals/NewOperationModal";

interface ModalContextType {
  openNewOperation: (initialData?: any, operationToEdit?: any) => void;
  closeNewOperation: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isNewOpOpen, setIsNewOpOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [operationToEdit, setOperationToEdit] = useState<any>(null);

  const openNewOperation = useCallback((data?: any, op?: any) => {
    setInitialData(data || null);
    setOperationToEdit(op || null);
    setIsNewOpOpen(true);
  }, []);

  const closeNewOperation = useCallback(() => {
    setIsNewOpOpen(false);
    setInitialData(null);
    setOperationToEdit(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openNewOperation, closeNewOperation }}>
      {children}
      <NewOperationModal 
        isOpen={isNewOpOpen} 
        onClose={closeNewOperation} 
        initialData={initialData}
        operationToEdit={operationToEdit}
        onSuccess={() => {
          // Dispatch global event for refetching
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('operation-created'));
          }
          closeNewOperation();
        }}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
