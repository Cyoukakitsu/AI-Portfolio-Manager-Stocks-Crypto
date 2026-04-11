import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
