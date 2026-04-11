import { ModeToggle } from "@/features/dashboard/components/mode-toggle";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";

export function HeaderControls() {
  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <ModeToggle />
    </div>
  );
}
