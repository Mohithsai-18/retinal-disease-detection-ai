import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Users, Stethoscope } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner class names
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analysis', path: '/upload', icon: UploadCloud },
    { name: 'Patients', path: '/history', icon: Users },
    { name: 'Compare', path: '/compare', icon: Stethoscope },
  ];

  return (
    <nav className="w-20 md:w-64 bg-surface border-r border-white/10 flex flex-col items-center md:items-start transition-all duration-300 z-10 glass-panel border-l-0 border-y-0 shadow-2xl">
      <div className="p-4 md:p-6 w-full flex items-center justify-center md:justify-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <h1 className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Retinal AI
        </h1>
      </div>

      <div className="flex flex-col gap-2 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={cn("w-6 h-6 z-10 relative", isActive ? "text-primary" : "")} />
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10"></div>
                    )}
                  </div>
                  <span className="hidden md:block font-medium">{item.name}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
