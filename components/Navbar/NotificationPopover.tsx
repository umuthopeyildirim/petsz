import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Badge,
} from "@nextui-org/react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  getUser,
  updateNotification,
  updateUser,
} from "@/features/userSlice";
import { IUser } from "@/types";
import { pusherClient } from "@/lib/pusher";
import { toast } from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

export default function NotificationPopover() {
  const user: IUser = useSelector(getUser);
  const dispatch = useDispatch();
  const [count, setCount] = useState(
    user.Notifications?.filter((n) => !n.seen).length || 0
  );

  const displayNotification = (data: any) => {
    dispatch(addNotification(data));
    setCount((prevCount) => prevCount + 1);
  };

  const updateNotifications = async () => {
    try {
      dispatch(updateNotification(""));
      await axios.put("/api/notifications", {
        id: user.id,
      });
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };

  useEffect(() => {
    pusherClient.subscribe(user.id);
    pusherClient.bind("notification", displayNotification);

    return () => {
      pusherClient.unsubscribe(user.id);
      pusherClient.unbind("notification", displayNotification);
    };
  }, []);

  return (
    <Popover onClose={updateNotifications} placement="bottom" showArrow={true}>
      <PopoverTrigger onClick={() => setCount(0)} className="cursor-pointer">
        <div className="flex gap-2 items-center py-2 px-4 rounded-2xl hover:bg-slate-200 transition">
          <Badge content={count} color="primary" isInvisible={count === 0}>
            <IoMdNotificationsOutline className="text-2xl" />
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2 flex flex-col gap-3 max-h-[500px] overflow-y-scroll">
          <div className="text-small font-bold">Notifications</div>
          {user.Notifications!.length ? (
            user.Notifications!.map((notification) => {
              return (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className={`p-2 rounded-md ${
                    !notification.seen
                      ? "bg-slate-300 hover:bg-slate-200 transition"
                      : ""
                  }`}
                >
                  {notification.message}
                </Link>
              );
            })
          ) : (
            <p>There are no notifications</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
