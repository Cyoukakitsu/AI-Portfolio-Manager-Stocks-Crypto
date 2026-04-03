import { ModeToggle } from "@/components/custom/dashboard/mode-toggle";
import { LocaleSwitcher } from "@/components/custom/dashboard/locale-switcher";

export function HeaderControls() {
  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <ModeToggle />
    </div>
  );
}
