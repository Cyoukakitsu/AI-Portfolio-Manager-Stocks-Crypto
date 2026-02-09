import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-xs flex-col gap-6">
        <div className="flex justify-center gap-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex w-6 h-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="w-4 h-4" />
            </div>
            Alpha Seeker
          </a>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
