import React, { createContext, useContext, useState } from "react";

interface BranchContextType {
  selectedBranchId: string | null; 
  setSelectedBranchId: (id: string | null) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
 
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    () => {
      const saved = localStorage.getItem("admin_selected_branch_id");
      return saved === "all" ? null : saved;
    },
  );

  const handleSetBranch = (id: string | null) => {
    setSelectedBranchId(id);
    if (id) {
      localStorage.setItem("admin_selected_branch_id", id);
    } else {
      localStorage.setItem("admin_selected_branch_id", "all");
    }
  };

  return (
    <BranchContext.Provider
      value={{ selectedBranchId, setSelectedBranchId: handleSetBranch }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  
  return context || { selectedBranchId: null, setSelectedBranchId: () => {} };
};
