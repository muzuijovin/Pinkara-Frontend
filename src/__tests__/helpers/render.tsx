import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

// render komponen dengan React Query baru per test (tanpa retry supaya error langsung tampil)
export function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  };
}

// bentuk response axios { data: { success, message, data, meta } }
export const apiResponse = <T,>(data: T, meta?: unknown) => ({ data: { success: true, message: "ok", data, ...(meta ? { meta } : {}) } });
