
import React, { createContext, useState } from 'react';
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userID, setUserID] = useState('');


  return (
    <UserContext.Provider value={{ userName, setUserName, userRole, setUserRole,userID,setUserID }}>
      {children}
    </UserContext.Provider>
  );
};
