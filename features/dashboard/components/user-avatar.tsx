"use client";

import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/server/auth";
import { SettingsModal } from "./settings-modal";

interface UserAvatarProps {
  email: string;
}

export function UserAvatar({ email }: UserAvatarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const initial = email.charAt(0).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amber-500 text-white text-sm font-semibold select-none hover:bg-amber-600 transition-colors">
            {initial}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings />
            設定
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
            <LogOut />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
