
import AutoLogout from "../shared/auto-logout";
import { Toaster } from "@/components/ui/toaster";
import { TopNavigation } from "../shared/topNav";

export default function AdminLayout({
    children
  }: {
    children: React.ReactNode;
  })  {
  return (
    <div className="min-h-screen bg-gray-50">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />
      {/* <TopNav /> */}
      <TopNavigation />

      
      <Toaster />
    </div>
  )
}
