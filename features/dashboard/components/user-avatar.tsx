"use client";

import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("settings.dropdown");
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
            {t("settings")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
            <LogOut />
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
