import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen relative overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
