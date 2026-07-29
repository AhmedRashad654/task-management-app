import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { addMemberSchema, type AddMemberFormValues } from "../schemas";



type AddMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => void;
  isPending: boolean;
};

const AddMemberDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddMemberDialogProps) => {
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = (values: AddMemberFormValues) => {
    onSubmit(values.email);
  };

  useEffect(()=>{
    form.reset()
  },[form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="member-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="member-email"
                    type="email"
                    placeholder="member@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={isPending}>
              Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
