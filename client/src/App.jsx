
import './App.css'
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Loading from "./components/Loading";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const Leads = lazy(() => import("./pages/Leads"));
const LeadDetails = lazy(() => import("./pages/LeadDetails"));

const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));

const Deals = lazy(() => import("./pages/Deals"));
const DealDetails = lazy(() => import("./pages/DealDetails"));

const Activities = lazy(() => import("./pages/Activities"));

const Notifications = lazy(() => import("./pages/Notifications"));

const Users = lazy(() => import("./pages/Users"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/leads" element={<Leads />} />

              <Route path="/leads/:id" element={<LeadDetails />} />

              <Route path="/customers" element={<Customers />} />

              <Route path="/customers/:id" element={<CustomerDetails />} />

              <Route path="/deals" element={<Deals />} />

              <Route path="/deals/:id" element={<DealDetails />} />

              <Route path="/activities" element={<Activities />} />

              <Route path="/notifications" element={<Notifications />} />

              <Route path="/users" element={<Users />} />
            </Route>
          </Route>

          {/* Unknown URL */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;

