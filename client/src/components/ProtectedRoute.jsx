import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetMeQuery } from "../store/api";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const location = useLocation();

  const { data, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
