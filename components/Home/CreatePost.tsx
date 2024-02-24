"use client";

import { addPost } from "@/features/postsSlice";
import { getUser } from "@/features/userSlice";
import uploadFile from "@/lib/uploadFile";
import { IUser } from "@/types";
import { Avatar, Button, Input } from "@nextui-org/react";
import axios from "axios";
import Image from "next/image";
import { useRef, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsFillImageFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";

export default function CreatePost() {
  const user: IUser = useSelector(getUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      text: "",
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFileUrl, setImageFileUrl] = useState<string | ArrayBuffer | null>(
    null
  );

  // react-hook-form's reset is not working, I had to write a custom control
  const [postBody, setPostBody] = useState("");

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const deleteImageFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setImageFileUrl(null);
    }
  };

  const convertToUrl = () => {
    if (
      FileReader &&
      fileInputRef.current &&
      fileInputRef.current.files &&
      fileInputRef.current.files[0]
    ) {
      const fr = new FileReader();
      fr.onload = () => {
        setImageFileUrl(fr.result);
      };
      fr.readAsDataURL(fileInputRef.current.files[0]);
    } else {
      setImageFileUrl(null);
    }
  };

  const submitPost = async (data: FieldValues) => {
    setIsLoading(true);
    if (
      fileInputRef.current &&
      fileInputRef.current.files &&
      fileInputRef.current.files[0]
    ) {
      data.photo = await uploadFile(fileInputRef.current.files[0]);
    }
    data.authorId = user.id;

    let aiResponse = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer TIHbjubvejR4Ay3y9gnIUwZGvYdj4A0JmQgyYAZjsBpgG4UT`,
        },
        body: JSON.stringify({
          model: "accounts/fireworks/models/firellava-13b",
          max_tokens: 512,
          top_p: 1,
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0,
          temperature: 0.6,
          messages: [
            {
              content: [
                {
                  type: "text",
                  text: 'Is this a pet or not? Only anwser in JSON. Example response: {"animal":true}',
                },
                {
                  type: "image_url",
                  image_url: {
                    url: data.photo,
                  },
                },
              ],
              role: "user",
            },
          ],
        }),
      }
    );

    // If the incoming respone is {"animal":true} then the image is a pet
    // If the incoming respone is {"animal":false} then the image is not a pet and dont let them post it
    let aiResponseData = await aiResponse.json();
    let contentResponse;
    try {
      // Replace single quotes with double quotes and remove leading/trailing characters if needed
      const correctedContent =
        aiResponseData.choices[0].message.content.replace(/'/g, '"');
      contentResponse = JSON.parse(correctedContent);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      toast.error("There was a problem processing the image.");
      setIsLoading(false);
      return; // Exit early, do not proceed with the post submission
    }

    contentResponse = JSON.parse(aiResponseData.choices[0].message.content);
    if (contentResponse.animal === false) {
      toast.error("This image is not a pet, please upload a pet image.");
      setIsLoading(false);
      return; // Exit early, do not proceed with the post submission
    }

    try {
      const res = await fetch("/api/posts", {
        method: "post",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Something went wrong, " + res.json());
      }
      const responseData = await res.json();
      deleteImageFile();
      dispatch(addPost(responseData.post));
      toast.success("Post added successfully");
      setPostBody("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" p-6 bg-white rounded-xl">
      <form className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <Image
            src={user.image!}
            alt="user"
            width={70}
            height={70}
            className="w-12 h-12 rounded-full"
          />
          <Input
            {...register("text", { required: "Post text is required" })}
            type="text"
            placeholder="Share something..."
            validationState={errors?.text ? "invalid" : "valid"}
            errorMessage={String(
              errors?.text?.message ? errors?.text?.message : ""
            )}
            isDisabled={isLoading}
            id="text-input"
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
          />
          <Button
            isDisabled={isLoading}
            onClick={handleButtonClick}
            size="sm"
            variant="ghost"
            className="!bg-[#0070F0] border-[#0070F0] !text-white hover:!bg-white hover:!text-[#0070F0] font-semibold"
            startContent={<BsFillImageFill className="text-xl" />}
            isIconOnly
          />
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          {imageFileUrl && (
            <div className="relative w-[300px]">
              <AiFillCloseCircle
                onClick={() => deleteImageFile()}
                className="absolute top-2 right-2 text-lg hover:scale-125 transition cursor-pointer"
              />
              <Image
                className="w-full rounded-lg"
                src={imageFileUrl.toString()}
                width={200}
                height={200}
                alt="preview"
              />
            </div>
          )}
          <input
            onChange={() => convertToUrl()}
            ref={fileInputRef}
            className="hidden"
            id="formFileLg"
            type="file"
          />
        </div>
        <Button
          isLoading={isLoading}
          onClick={handleSubmit(submitPost)}
          variant="solid"
          color="primary"
          className="font-bold"
          type="submit"
        >
          {" "}
          Publish
        </Button>
      </form>
    </div>
  );
}
