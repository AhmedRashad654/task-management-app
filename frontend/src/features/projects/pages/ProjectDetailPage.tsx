import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { useProject } from "../hooks/project-hooks";
import MembersTab from "../components/MembersTab";
import TasksTab from "../components/TasksTab";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useProject(projectId!);
  const user = useAuthStore((s) => s.user);

  const project = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-8 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="mt-6 flex gap-6">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-sm text-muted-foreground">
        Project not found.{' '}
        <Link to="/projects" className="text-primary underline underline-offset-4">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/projects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.description ?? "No description"}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              project.role === "owner"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            My role: {project.role}
          </span>
          <span className="text-xs text-muted-foreground">
            Created by {project.owner.name}
          </span>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="mt-8">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TasksTab
            projectId={projectId!}
            isOwner={project.role === "owner"}
            userId={user?.id ?? ""}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MembersTab
            projectId={projectId!}
            isOwner={project.role === "owner"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPage;
