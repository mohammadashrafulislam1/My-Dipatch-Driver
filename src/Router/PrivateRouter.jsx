import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Components/useAuth";
import LoadingScreen from "../Components/LoadingScreen";
import { useEffect, useState } from "react";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let timer;
    if (!loading) {
      // give extra 1.5s before deciding redirect
      timer = setTimeout(() => setChecking(false), 1500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading || checking) {
    return <LoadingScreen />;
  }

  if (user) {
    return children;
  }

  return (
    <Navigate
      to="/login"
      state={{ from: location }}
      replace
    />
  );
};

export default PrivateRoute;
