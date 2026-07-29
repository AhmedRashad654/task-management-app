import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/features/auth/hooks/auth-hooks";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate("/auth/sign-in", { replace: true });
      },
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link to="/projects" className="text-md md:text-lg font-semibold">
          Task Manager
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:block">{user?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
