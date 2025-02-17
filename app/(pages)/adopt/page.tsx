"use client";

import FollowSkeleton from "@/components/Global/FollowSkeleton";
import { Button, Spinner, User } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { User as UserType } from "@prisma/client";
import { getUser, getUserError, getUserStatus } from "@/features/userSlice";
import Link from "next/link";

export default function Page() {
  const user: UserType = useSelector(getUser);
  const status = useSelector(getUserStatus);
  const error = useSelector(getUserError);
  const [isLoading, setIsLoading] = useState(false);
  const [pets, setPets] = useState<
    { id: string; title: string; thumb: string; permalink: string }[]
  >([]);

  const fetchPets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users/adopt", {
        method: "get",
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        throw new Error("Something went wrong, " + res.json());
      }
      const data = await res.json();
      setPets(data.pets);
    } catch (error: any) {
      toast.error("Something went wrong, please try again later !");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  if (status === "failed") {
    return <h1>{error}</h1>;
  }

  if (status === "loading" || !user?.id) {
    return (
      <main className="flex w-screen h-screen flex-col items-center justify-center absolute top-0 left-0">
        <Spinner size="lg" />
      </main>
    );
  }

  if (isLoading) {
    return (
      <div
        id="container"
        className="w-full flex flex-col justify-center max-w-[800px] bg-white rounded-xl gap-8 p-8 relative"
      >
        <h2 className="text-2xl font-semibold">Pets for adoption</h2>
        <FollowSkeleton />
        <FollowSkeleton />
        <FollowSkeleton />
        <FollowSkeleton />
        <FollowSkeleton />
      </div>
    );
  }

  if (!pets.length || (pets.length === 1 && pets[0].id === user.id)) {
    return (
      <div
        id="container"
        className="w-full flex flex-col justify-center max-w-[800px] bg-white rounded-xl gap-8 p-8 relative"
      >
        <h2 className="text-2xl font-semibold">Pets for adoption</h2>
        There are no pets available for you for adoption !
      </div>
    );
  }
  console.log(pets);
  return (
    <div
      id="container"
      className="w-full flex flex-col justify-center max-w-[800px] bg-white rounded-xl gap-8 p-8 relative"
    >
      <h2 className="text-2xl font-semibold">Pets for adoption</h2>
      {pets.map((pet) => {
        return (
          pet.id !== user.id && (
            <div
              key={pet.id}
              className="w-full flex justify-between items-center"
            >
              <User
                as="button"
                avatarProps={{
                  src: pet.thumb,
                  size: "lg",
                }}
                className="transition-transform gap-2 font-semibold capitalize"
                name={pet.title}
              />
              <Link href={pet.permalink}>
                <Button color="secondary" className="font-semibold">
                  Adopt
                </Button>
              </Link>
            </div>
          )
        );
      })}
    </div>
  );
}
