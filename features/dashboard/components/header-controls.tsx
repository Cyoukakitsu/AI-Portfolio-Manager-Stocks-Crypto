import { ModeToggle } from "@/features/dashboard/components/mode-toggle";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import { getAuthSession } from "@/features/auth/server/auth-helper";

export async function HeaderControls() {
  let email: string | null = null;
  try {
    const { user } = await getAuthSession();
    email = user.email ?? null;
  } catch {
    // セッションなし（ログアウト中など）はアバターを表示しない
  }

  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <ModeToggle />
      {email && <UserAvatar email={email} />}
    </div>
  );
}
