
import AutoLogout from "../shared/auto-logout";
import { Toaster } from "@/components/ui/toaster";
import { TopNavigation } from "../shared/top-nav";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-gray-50 z-999">
      <AutoLogout inactivityLimit={10 * 60 * 1000} />
      <TopNavigation />
      <main className="px-4 mx-auto py-6">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
