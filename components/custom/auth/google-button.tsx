"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const GoogleButton = () => {
  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogle}
      className="w-full cursor-pointer"
    >
      Continue with Google
    </Button>
  );
};

export default GoogleButton;
