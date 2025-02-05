import * as React from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, className = "", children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex space-x-2 border-b mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = "" }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within a Tabs component");

  const isActive = context.value === value;

  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
        isActive
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      } ${className}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = "" }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within a Tabs component");

  return context.value === value ? <div className={className}>{children}</div> : null;
};