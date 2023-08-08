"use client";

import { Button, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { AiFillGoogleCircle } from "react-icons/ai";
import { BsFacebook } from "react-icons/bs";

import { FieldValues, useForm } from "react-hook-form";
import { useState } from "react";

export const RegisterForm = () => {
  // Initialize react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>();

  // file upload error
  const [fileExists, setFileExists] = useState(true);

  // passwords match error
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // file upload input change
  const handleFile = (e: any) => {
    if (e.target.files.length === 0) {
      setFileExists(false);
      return;
    }
    setFileExists(true);
  };

  const submitForm = (data: FieldValues) => {
    // check picture exists
    const fileInput = document.getElementById("formFileLg") as HTMLInputElement;
    if (fileInput.files?.length === 0) {
      setFileExists(false);
    } else {
      setFileExists(true);
    }

    // check passwords match
    if (data.password !== data.confirm_password) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true);

    // todo: upload picture to cloud and add its link to the data
    // todo: register user
  };

  return (
    <form
      className="w-full max-w-[500px] flex flex-col items-center gap-5"
      onSubmit={handleSubmit(submitForm)}
    >
      <Input
        {...register("username", {
          required: "Username is required",
          minLength: {
            value: 6,
            message: "Username must contain at least 6 characters",
          },
        })}
        validationState={errors?.username ? "invalid" : "valid"}
        errorMessage={String(
          errors?.username?.message ? errors?.username?.message : ""
        )}
        type="text"
        label="Username"
        variant="bordered"
        classNames={{
          inputWrapper: ["border-gray-300"],
        }}
      />
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
        validationState={errors?.email ? "invalid" : "valid"}
        errorMessage={String(
          errors?.email?.message ? errors?.email?.message : ""
        )}
        type="email"
        label="Email"
        variant="bordered"
        classNames={{
          inputWrapper: ["border-gray-300"],
        }}
      />
      <Input
        {...register("password", {
          required: "Please enter a password",
          minLength: {
            value: 8,
            message: "Password must contain at least 8 characters",
          },
        })}
        validationState={errors?.password ? "invalid" : "valid"}
        errorMessage={String(
          errors?.password?.message ? errors?.password?.message : ""
        )}
        type="password"
        label="Password"
        variant="bordered"
        classNames={{
          inputWrapper: ["border-gray-300"],
        }}
      />
      <Input
        {...register("confirm_password")}
        validationState={!passwordsMatch ? "invalid" : "valid"}
        errorMessage={passwordsMatch ? "" : "Passwords don't match"}
        type="password"
        label="Confirm Password"
        variant="bordered"
        classNames={{
          inputWrapper: ["border-gray-300"],
        }}
      />
      <div className="mb-3 w-full">
        <input
          onChange={handleFile}
          className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded-lg border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] font-normal leading-[2.15] text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
          id="formFileLg"
          type="file"
        />
        {fileExists ? (
          <p className="text-xs text-gray-500 pt-1 pl-1">
            Choose a profile picture
          </p>
        ) : (
          <p className="text-xs text-rose-600 pt-1 pl-1">
            Profile picture is required
          </p>
        )}
      </div>
      <Button
        className="w-full bg-black border-2 border-black hover:bg-transparent hover:text-black text-white font-medium"
        type="submit"
      >
        Sign Up
      </Button>
      {/* <hr className="border-t-[2px] rounded-md w-3/5 border-gray-300 my-4" /> */}
      <Button
        startContent={<AiFillGoogleCircle className="text-3xl" />}
        className="w-full font-medium"
        color="danger"
        variant="ghost"
        onClick={() => signIn("google")}
      >
        Continue with Google
      </Button>
      <Button
        startContent={<BsFacebook className="text-2xl" />}
        className="w-full font-medium"
        color="primary"
        variant="ghost"
        onClick={() => signIn("facebook")}
      >
        Continue with Facebook
      </Button>

      <p className="text-sm text-gray-600">
        Already have an account ?{" "}
        <Link
          href={"/login"}
          className="text-black font-bold hover:text-gray-600 transition"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
};