import React, { createContext, useState } from 'react';

// Define the shape of the context
interface ThemeContextType {
  themeColor: string;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  themeColor: 'blue',
});

// Create a provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor] = useState('blue');

  // The value that will be given to the context
  const value = {
    themeColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
