"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { googleSignInAction, loginAction, signupAction, type AuthState } from "@/app/actions/auth";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function PasswordInput({ id, autoComplete, invalid }: { id: string; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={id} type={show ? "text" : "password"} autoComplete={autoComplete} required aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} className="pr-10" />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function GoogleButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <form action={googleSignInAction}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <Button type="submit" variant="outline" className="h-11 w-full">Continue with Google</Button>
      </form>
    </>
  );
}

export function LoginForm({ callbackUrl, googleEnabled, notice }: { callbackUrl?: string; googleEnabled: boolean; notice?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Sign in to see your garage and messages.</p>
      {notice && <p className="mb-4 rounded-lg bg-muted p-3 text-sm">{notice}</p>}
      <form action={action} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <Field id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} />
        </Field>
        <Field id="password" label="Password">
          <PasswordInput id="password" autoComplete="current-password" />
        </Field>
        {state.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
      {googleEnabled && <GoogleButton callbackUrl={callbackUrl} />}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to CarSwipe? <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">Create an account</Link>
      </p>
    </>
  );
}

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signupAction, {});
  const e = state.fieldErrors ?? {};
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Save cars, compare them and message sellers.</p>
      <form action={action} className="space-y-4" noValidate>
        <Field id="name" label="Full name" error={e.name}>
          <Input id="name" name="name" autoComplete="name" required defaultValue={state.values?.name} aria-invalid={!!e.name} aria-describedby={e.name ? "name-error" : undefined} />
        </Field>
        <Field id="email" label="Email" error={e.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} aria-invalid={!!e.email} aria-describedby={e.email ? "email-error" : undefined} />
        </Field>
        <Field id="password" label="Password" error={e.password}>
          <PasswordInput id="password" autoComplete="new-password" invalid={!!e.password} />
        </Field>
        <p className="text-xs text-muted-foreground">At least 8 characters with a letter and a number.</p>
        {state.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
      {googleEnabled && <GoogleButton />}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-medium text-foreground underline underline-offset-4">Sign in</Link>
      </p>
    </>
  );
}
