"use client";
import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-black/80"
    >
      Sign in with GitHub
    </button>
  );
}
export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-black/80"
    >
      Sign out
    </button>
  );
}
