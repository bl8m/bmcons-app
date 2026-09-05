import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore.js';
import Button from '../components/Button.jsx';
import logo from '../assets/images/bmcons-logo.png';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-primary-50 text-primary-600' : 'text-text hover:bg-gray-100'
  }`;

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <img src={logo} alt="BM Cons" className="h-9 w-9 object-contain" />
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/customer" end className={navLinkClass}>
              I miei dati
            </NavLink>
            <NavLink to="/customer/addresses" className={navLinkClass}>
              Indirizzi
            </NavLink>
            <NavLink to="/customer/phones" className={navLinkClass}>
              Telefoni
            </NavLink>
            <NavLink to="/customer/emails" className={navLinkClass}>
              Email
            </NavLink>
            <NavLink to="/customer/bank-accounts" className={navLinkClass}>
              Conti correnti
            </NavLink>
            <NavLink to="/customer/loans" className={navLinkClass}>
              Mutui
            </NavLink>
            <NavLink to="/customer/loan-installments" className={navLinkClass}>
              Rate mutuo
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text">{user?.name}</span>
          <Button variant="secondary" onClick={logout}>
            Esci
          </Button>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
