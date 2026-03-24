import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Shirt } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/create-order', label: 'New Order', icon: Shirt },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-primary">
          ✨ FreshPress
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Dry Cleaning Management</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
