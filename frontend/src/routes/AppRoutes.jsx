import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRedirect from './RoleRedirect.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import CustomersPage from '../pages/CustomersPage.jsx';
import AddressesPage from '../pages/AddressesPage.jsx';
import PhonesPage from '../pages/PhonesPage.jsx';
import EmailAddressesPage from '../pages/EmailAddressesPage.jsx';
import BanksPage from '../pages/BanksPage.jsx';
import BankAccountsPage from '../pages/BankAccountsPage.jsx';
import MyProfilePage from '../pages/MyProfilePage.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* La root smista verso /admin o /customer in base al ruolo dell'utente autenticato */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleRedirect />} />
      </Route>

      <Route element={<ProtectedRoute role="administrator" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />

          {/* ANAGRAFICHE */}
          <Route path="/admin/customers" element={<CustomersPage />} />
          <Route path="/admin/addresses" element={<AddressesPage />} />
          <Route path="/admin/phones" element={<PhonesPage />} />
          <Route path="/admin/emails" element={<EmailAddressesPage />} />
          <Route path="/admin/banks" element={<BanksPage />} />
          <Route path="/admin/bank-accounts" element={<BankAccountsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="customer" />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer" element={<MyProfilePage />} />

          {/* I miei dati: gli stessi componenti della gestione amministratore,
              scoperti automaticamente al proprio cliente dal backend. */}
          <Route path="/customer/addresses" element={<AddressesPage />} />
          <Route path="/customer/phones" element={<PhonesPage />} />
          <Route path="/customer/emails" element={<EmailAddressesPage />} />
          <Route path="/customer/bank-accounts" element={<BankAccountsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
