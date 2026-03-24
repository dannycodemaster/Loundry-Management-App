import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import MobileNav from './MobileNav';

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <AdminSidebar />
    <main className="flex-1 pb-20 lg:pb-0">
      <div className="mx-auto max-w-6xl p-4 lg:p-8">
        {children}
      </div>
    </main>
    <MobileNav />
  </div>
);

export default AdminLayout;
