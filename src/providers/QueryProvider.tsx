"use client"

import {QueryClientProvider} from "@tanstack/react-query"
import {getQueryClient} from "@/providers/get-query-client";


export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const client = getQueryClient()
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}