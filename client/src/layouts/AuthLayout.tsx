// Assets
import logo from "@/assets/logos/logo.png";

// React Router
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto grid md:grid-cols-2 gap-10 p-4">

      {/* Left Panel */}
      <div className="flex flex-col items-center justify-center gap-1">
        <img src={logo} alt="FORMANCE Logo" className="w-6 md:w-6" />
        <h1 className="text-3xl font-bold text-center">Welcome to FORMANCE</h1>
        <p className="text-center text-sm max-w-sm">
          Empower coaches to manage clients, track progress, and deliver results — all in one simple, powerful tool.
        </p>
        <a
          href="https://linkedin.com/company/formance"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-secondary underline underline-offset-4"
        >
          Visit our LinkedIn
        </a>
      </div>

      {/* Right Panel */}

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>



    </div>
  );
}
