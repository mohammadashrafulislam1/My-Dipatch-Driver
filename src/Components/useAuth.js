import { useContext } from "react";
import { AuthContext } from "../Router/AuthProvider";

const useAuth = () => useContext(AuthContext);
export default useAuth;
