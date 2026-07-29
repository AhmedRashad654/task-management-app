import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { useRegister } from "../hooks/auth-hooks";

const SignUp = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-130">
      <div className="mb-6 lg:hidden">
        <p className="text-xl font-semibold">Task Manager</p>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-normal">
          Create account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign up to start managing your tasks.
        </p>
      </div>

      <form id="sign-up-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-name"
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Button
            className="mt-2 w-full"
            size="lg"
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UserPlus />
            )}
            Create account
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium text-foreground underline-offset-4 hover:underline"
          to="/auth/sign-in"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
