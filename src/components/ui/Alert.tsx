import * as React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "default",
  className = ""
}) => {
  const baseStyles = "rounded-lg border p-4";
  const variantStyles = {
    default: "bg-gray-50 border-gray-200",
    destructive: "bg-red-50 border-red-200 text-red-800"
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<AlertTitleProps> = ({
  children,
  className = ""
}) => {
  return (
    <h5 className={`font-medium leading-none tracking-tight ${className}`}>
      {children}
    </h5>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
};