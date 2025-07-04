import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  Header: React.ReactNode;

}

export default function PageInnerLayout({ Header, children }: MainLayoutProps) {
  return (
    <div className="max-h-[calc(100vh-180px)] overflow-auto">
      <div className="mb-2">
        {Header}
      </div>
      {children}
    </div>
  );
}
