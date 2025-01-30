"use client";
import AuthForm from "@/components/AuthForm";
import { signInWithCredentials } from "@/lib/actions/auth";
import { signInSchema } from "@/lib/validations";
import React from "react";

const SignIn = () => {
  return (
    <AuthForm
      type="SIGN-IN"
      schema={signInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={signInWithCredentials}
    />
  );
};

export default SignIn;
