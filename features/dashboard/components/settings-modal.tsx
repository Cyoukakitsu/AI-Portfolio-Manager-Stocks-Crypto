"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { deleteAllAssets } from "@/features/assets/server/assets";
import { changePassword } from "@/features/auth/server/auth";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const t = useTranslations("settings");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handleDeleteAll() {
    setIsDeleting(true);
    try {
      await deleteAllAssets();
      toast.success(t("toast.deleteSuccess"));
      setConfirmDeleteOpen(false);
      onOpenChange(false);
    } catch {
      toast.error(t("toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(t("toast.currentPasswordRequired"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("toast.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("toast.passwordMismatch"));
      return;
    }
    setIsChangingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if ("errorCode" in result && result.errorCode) {
        toast.error(t(`toast.${result.errorCode}`));
      } else {
        toast.success(t("toast.passwordChanged"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error(t("toast.passwordChangeFailed"));
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{t("portfolioData.title")}</p>
              <p className="text-xs text-muted-foreground">
                {t("portfolioData.description")}
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-fit"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                {t("portfolioData.deleteButton")}
              </Button>
            </div>

            <Separator />

            <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
              <p className="text-sm font-medium">{t("password.title")}</p>
              <Input
                type="password"
                placeholder={t("password.currentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Input
                type="password"
                placeholder={t("password.newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder={t("password.confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                size="sm"
                className="w-fit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? t("password.changing") : t("password.submit")}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("portfolioData.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("portfolioData.confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default" disabled={isDeleting}>
              {t("portfolioData.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeleting}
            >
              {isDeleting ? t("portfolioData.deleting") : t("portfolioData.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
