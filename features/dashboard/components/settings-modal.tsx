"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handleDeleteAll() {
    setIsDeleting(true);
    try {
      await deleteAllAssets();
      toast.success("ポートフォリオデータをすべて削除しました");
      setConfirmDeleteOpen(false);
      onOpenChange(false);
    } catch {
      toast.error("削除に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("パスワードは6文字以上で設定してください");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }
    setIsChangingPassword(true);
    try {
      const result = await changePassword(newPassword);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("パスワードを変更しました");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("パスワードの変更に失敗しました");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>設定</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">ポートフォリオデータ</p>
              <p className="text-xs text-muted-foreground">
                現在のポートフォリオにある全てのデータを削除します。この操作は取り消せません。
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-fit"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                全データを削除
              </Button>
            </div>

            <Separator />

            <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
              <p className="text-sm font-medium">パスワード変更</p>
              <Input
                type="password"
                placeholder="新しいパスワード（6文字以上）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="新しいパスワード（確認）"
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
                {isChangingPassword ? "変更中..." : "パスワードを変更"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              ポートフォリオ内の全ての資産と取引履歴が完全に削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default" disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
