import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1fr)]">
      <section className="relative hidden overflow-hidden border-r border-border bg-muted lg:block">
        <div className="flex h-full flex-col justify-between p-10 text-foreground">
          <div className="text-xl font-semibold">Task Manager</div>
          <div className="max-w-md">
            <p className="text-3xl font-semibold leading-tight">
              Organize, track, and manage your team's work in one place.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in to continue managing your projects and tasks.
            </p>
          </div>
        </div>
      </section>
      <main className="flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
