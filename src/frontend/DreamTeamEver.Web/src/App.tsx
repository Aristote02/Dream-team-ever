import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAdmin } from "./components/RequireAdmin";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HistoricsPage } from "./pages/HistoricsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPaymentsPage } from "./pages/AdminPaymentsPage";
import { ManageUsersPage } from "./pages/ManageUsersPage";
import { PaymentCancelPage } from "./pages/PaymentCancelPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ViewPage } from "./pages/ViewPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="phone" element={<ViewPage />} />
        <Route
          path="students"
          element={
            <RequireAdmin>
              <ManageUsersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="admin/payments"
          element={
            <RequireAdmin>
              <AdminPaymentsPage />
            </RequireAdmin>
          }
        />
        <Route path="historics" element={<HistoricsPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment/success" element={<PaymentSuccessPage />} />
        <Route path="payment/cancel" element={<PaymentCancelPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
