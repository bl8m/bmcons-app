import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore.js';
import Button from '../components/Button.jsx';
import NavDropdown from '../components/NavDropdown.jsx';
import logo from '../assets/images/bmcons-logo.png';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-primary-50 text-primary-600' : 'text-text hover:bg-gray-100'
  }`;

const ANAGRAFICHE_ITEMS = [
  { to: '/admin/customers', label: 'Clienti' },
  { to: '/admin/addresses', label: 'Indirizzi' },
  { to: '/admin/phones', label: 'Telefoni' },
  { to: '/admin/emails', label: 'Indirizzi email' },
  { to: '/admin/banks', label: 'Banche' },
  { to: '/admin/bank-accounts', label: 'Conti correnti' },
];

const MUTUI_ITEMS = [
  { to: '/admin/loans', label: 'Mutui' },
  { to: '/admin/loan-installments', label: 'Rate mutuo' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <img src={logo} alt="BM Cons" className="h-9 w-9 object-contain" />
          <nav className="flex items-center gap-1">
            <NavLink to="/admin" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
              Utenti
            </NavLink>
            <NavDropdown label="Anagrafiche" items={ANAGRAFICHE_ITEMS} />
            <NavDropdown label="Mutui" items={MUTUI_ITEMS} />
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
