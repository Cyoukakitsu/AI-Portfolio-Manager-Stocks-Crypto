"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const UserDropdown = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    router.push("/sign-in");
  };

  const user = {
    name: "ZHAO JIAYI",
    email: "zjy@ui.com",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 bg-transparent border-none cursor-pointer px-4 py-2 rounded-md hover:bg-accent">
        <Avatar className="w-8 h-8">
          {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
          <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
            {user.name
              .split(" ")
              .map((name) => name.charAt(0))
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-gray-400 w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex relative items-center gap-3 py-2">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                  {user.name
                    .split(" ")
                    .map((name) => name.charAt(0))
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-400">
                  {user.name}
                </span>
                <span className="text-sm  text-gray-400">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-600" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-gray-100 font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2 hidden sm:block" />
          Logout
        </DropdownMenuItem>
        <DropdownMenuSeparator className="hidden sm:block bg-gray-600" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
