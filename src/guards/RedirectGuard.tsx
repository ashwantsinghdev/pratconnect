import { useContext, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import HttpInterceptor from "../lib/HttpInterceptor";
import Context from "../Context";
import { Skeleton } from "antd";

const RedirectGuard = () => {
  const { session, setSession } = useContext(Context);



  const getSession = async () => {
    try {
      const { data } = await HttpInterceptor.get("/auth/session");
      setSession(data);
    } catch {
      setSession(false);
    }
  };
    useEffect(() => {
      getSession();
    }, []);

  if (session === null) return <Skeleton active />;

  if (session === false) return <Outlet />;

  return <Navigate to="/app" />;
};

export default RedirectGuard;
