// app/visitor-logs/page.tsx
import React from "react";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import VisitorDashboardClient from "@/components/VisitorDashboardClient";

export const dynamic = "force-dynamic"; // ensure fresh data on each request

export default async function Page() {
  const supabase = await createServerSupabaseClient();

  const { data: visitorsData, error } = await supabase
    .from("visitors")
    .select("*")
    .order("in_time", { ascending: false });

  if (error) {
    // Optional: render error server-side so you can see it
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Visitor Logs</h1>
        <pre className="mt-4 text-sm text-red-600">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  const visitors = (visitorsData ?? []) as any[];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <VisitorDashboardClient initialVisitors={visitors} />
    </div>
  );
}
