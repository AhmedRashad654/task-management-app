import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/project-hooks";
import type { Project } from "../types";
import ProjectFormDialog from "../components/ProjectFormDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import CustomSkeletonTable from "@/components/ui/custom-skeleton-table";
import { truncateText } from "@/lib/truncateText";


const ProjectsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProjects(page);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const projects = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const isOwner = (p: Project) => p.role === "owner";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
          <Button onClick={()=>setCreateOpen(true)}><Plus className="size-4" />New project</Button>
          <ProjectFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            title="Create project"
            submitLabel="Create"
            onSubmit={(values) => {
              createMutation.mutate(values, {
                onSuccess: () =>{
                  setCreateOpen(false)
                } 
                
              });
            }}
            isPending={createMutation.isPending}
          />
      </div>

      {isLoading ? (
        <CustomSkeletonTable/>
      ) : projects.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center mt-20">No projects yet.</div>
      ) : (
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Tasks</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium min-w-50">Tasks And Members</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{truncateText(project.name)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {truncateText(project.description)}
                  </td>
                  <td className="px-4 py-3">{project._count.members} + Owner</td>
                  <td className="px-4 py-3">{project._count.tasks}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        isOwner(project)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {project.role}
                    </span>
                  </td>
                  <td>
                      <Link
                        to={`/projects/${project.id}`}
                        className="flex w-fit gap-3 px-6 size-7 items-center justify-center rounded-lg text-blue-400 hover:bg-muted hover:text-blue-600"
                      >
                        <ExternalLink className="size-4" />
                        Manage
                      </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                 

                      {isOwner(project) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setEditTarget(project)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeleteTarget(project)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit dialog */}
      {editTarget && (
        <ProjectFormDialog
          key={`edit-${editTarget.id}`}
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          title="Edit project"
          submitLabel="Save"
          defaultValues={{ name: editTarget.name, description: editTarget.description ?? "" }}
          onSubmit={(values) => {
            updateMutation.mutate(
              { id: editTarget.id, ...values },
              { onSuccess: () => setEditTarget(null) },
            );
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          key={`delete-${deleteTarget.id}`}
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
          onConfirm={() => {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
