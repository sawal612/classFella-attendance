"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, CalendarCheck, FileText, Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { gsap } from "gsap";

const navItems = [
  { name: "Dashboard", href: "/cr/dashboard", icon: LayoutDashboard },
  { name: "Classes & Students", href: "/cr/class", icon: Users },
  { name: "Attendance", href: "/cr/attendance", icon: CalendarCheck },
  { name: "Reports", href: "/cr/reports", icon: FileText },
];

export default function MobileResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Page GSAP animation
  useEffect(() => {
    gsap.fromTo(
      ".gsap-page-content",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1c1c1e] border-b border-[#2c2c2e]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:bg-[#2c2c2e] rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-100 tracking-tight">
            ClassFella<span className="text-indigo-500">Pro</span>
          </h1>
        </div>
        <div className="flex items-center shrink-0">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1c1c1e] border-r border-[#2c2c2e] shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2c2c2e]">
          <h1 className="text-xl font-extrabold text-gray-100 tracking-tight">
            ClassFella<span className="text-indigo-500">Pro</span>
          </h1>
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 shadow-sm" 
                    : "text-gray-400 hover:text-indigo-400 hover:bg-[#2c2c2e]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-gray-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 bg-[#0a0a0a]">
        <header className="hidden md:flex h-16 bg-[#1c1c1e] border-b border-[#2c2c2e] items-center justify-between px-6 shrink-0">
          <div className="text-lg font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
            CR Portal
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full gsap-page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
