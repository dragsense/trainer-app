// UI Components
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";


interface AppHeader2Props {
  title: string;
}

export function AppHeader2({ title = "" }: AppHeader2Props) {
  return (
    <header
      className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-40 flex h-40 shrink-0 gap-2 transition-[width,height] ease-linear
     bg-gradient-to-r from-white to-blue-500 dark:from-gray-100 dark:to-blue-600
    relative
    "
    >
      <div className="flex w-full justify-between gap-1 px-4 py-8 lg:gap-2 lg:px-6">
        <div className="flex w-full  gap-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </div>
    </header>
  );
}
