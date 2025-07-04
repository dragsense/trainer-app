// React & Hooks
import { RouterProvider } from "react-router-dom";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Local
import appRouter from "./AppRoutes";
import { AuthProvider } from "./hooks/use-auth";

// Styles
import "./App.css";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, //5 * 60 * 1000,

      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
