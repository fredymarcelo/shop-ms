"use client"
import {QueryClient} from "@tanstack/query-core";
import {QueryClientProvider as QueryClientProviderComponente} from "@tanstack/react-query";
import {PropsWithChildren} from "react";

const queryClient = new QueryClient()

export function QueryClientProvider({children}: Readonly<PropsWithChildren>) {
  return <QueryClientProviderComponente client={queryClient}>
    {children}
  </QueryClientProviderComponente>;
}