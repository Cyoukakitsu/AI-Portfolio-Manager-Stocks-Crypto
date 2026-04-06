"use client";

// 参考：https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=framework&framework=nextjs&queryGroups=environment&environment=client
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
