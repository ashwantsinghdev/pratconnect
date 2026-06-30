import { useContext, useEffect } from "react";
import Context from "../Context";
import HttpInterceptor from "../lib/HttpInterceptor";
import { Outlet, Navigate } from "react-router-dom";
import { Skeleton } from "antd";

const AuthGuard = () => {
  const { session, setSession } = useContext(Context);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await HttpInterceptor.get("/auth/session");
        setSession(data);
      } catch {
        setSession(false);
      }
    };
    getSession();
  }, []);

  if (session === null) return <Skeleton active />;
  if (session === false) return <Navigate to="/login" />;

  return <Outlet />;
};

export default AuthGuard;
