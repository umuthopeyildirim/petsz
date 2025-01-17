"use client";

import { Button, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { AiFillGithub } from "react-icons/ai";
import { BsFacebook } from "react-icons/bs";

import { FieldValues, useForm } from "react-hook-form";
import { useState } from "react";
import { redirect } from "next/navigation";
import { FaCat } from "react-icons/fa6";

export const LoginForm = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>();

  const submitForm = async (data: FieldValues) => {
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: `${window.location.origin}/`,
      });

      setIsLoading(false);
      if (res?.error) {
        setError("Invalid email or password");
      }
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  return (
    <form
      className="w-full max-w-[500px] flex flex-col items-center gap-5 translate-y-10"
      onSubmit={handleSubmit(submitForm)}
    >
      <Input
        {...register("email", {
          required: {
            value: true,
            message: "Email field is required",
          },
          pattern: {
            value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            message: "Please enter a valid email",
          },
        })}
        isDisabled={isLoading}
        type="text"
        label="Email"
        variant="bordered"
        validationState={errors?.email ? "invalid" : "valid"}
        errorMessage={String(
          errors?.email?.message ? errors?.email?.message : ""
        )}
        classNames={{
          inputWrapper: ["border-gray-300"],
        }}
      />
      <Input
        {...register("password", { required: "Please enter a password" })}
        isDisabled={isLoading}
        type="password"
        label="Password"
        variant="bordered"
        validationState={errors?.password ? "invalid" : "valid"}
        errorMessage={String(
          errors?.password?.message ? errors?.password?.message : ""
        )}
        classNames={{
          inputWrapper: ["border-gray-300"],
        }}
      />
      {error && <p className="text-sm text-red-600 self-start">{error}</p>}
      <Button
        className="w-full bg-black border-2 border-black hover:bg-transparent hover:text-black text-white font-medium"
        type="submit"
        isLoading={isLoading}
      >
        Sign In
      </Button>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-600">
          Don't have an account ?{" "}
          <Link
            href={"/register"}
            className="text-black font-bold hover:text-gray-600 transition"
          >
            Sign Up
          </Link>
        </p>
        <Link href={"/recover"} className="text-sm text-sky-700 transition">
          Forgot password ?
        </Link>
      </div>
    </form>
  );
};
