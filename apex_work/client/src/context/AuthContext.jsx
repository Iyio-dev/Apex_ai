import React, { createContext, useContext } from "react";
export const Auth = createContext(null);
export const useAuth = () => useContext(Auth);
