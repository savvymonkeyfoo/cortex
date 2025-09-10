// hooks/useTriageAssignments.ts
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from '../utils/supabase/info';
// Fallback to the same repo used by Live Assignments so Triage mirrors "In Review"
import { repo, type Assignment, type TaskStatus } from '../data/repo';

// Use the existing Supabase configuration
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

type DBRow = {
  id: string;
  assignment_id: string;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  title: string;
  assignees: string[] | null;
  // if you use v_triage_queue_details:
  detail?: any;
};

type SourceTag = "db" | "demo";

// simple demo data
function getDemoAssignments(): DBRow[] {
  return [
    {
      id: "demo-1",
      assignment_id: "demo-1",
      owner_id: "demo",
      status: "awaiting_review",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: "Critical security patch deployment",
      assignees: ["Lisa Park"],
      detail: {},
    },
    {
      id: "demo-2", 
      assignment_id: "demo-2",
      owner_id: "demo",
      status: "awaiting_review",
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      title: "Database performance optimization",
      assignees: ["Mike Chen"],
      detail: {},
    }
  ];
}

export function useTriageAssignments() {
  const [assignments, setAssignments] = useState<DBRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<SourceTag>("db");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Ensure there is a logged-in user
        let { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          // For development, we'll skip auth and try to query directly
          console.log("No active session found, attempting direct query...");
        }

        // 2) Query the invoker view or assignments table
        // Try triage views first, fall back to assignments
        let data, error;
        
        try {
          // Try the triage queue details view first
          const result = await supabase
            .from("v_triage_queue_details")
            .select("*")
            .order("created_at", { ascending: false });
          data = result.data;
          error = result.error;
        } catch (viewError) {
          console.log("Triage view not available, trying assignments table...");
          
          // Fall back to assignments table with review status filter
          const result = await supabase
            .from("assignments")
            .select(`
              id,
              title,
              description,
              status,
              assignee,
              created_at,
              updated_at
            `)
            .in("status", ["review", "awaiting_review", "needs_review", "waiting_review"])
            .order("created_at", { ascending: false });
          
          // Transform to DBRow format
          data = result.data?.map(row => ({
            id: row.id,
            assignment_id: row.id,
            owner_id: "system", // default for demo
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at || row.created_at,
            title: row.title,
            assignees: row.assignee ? [row.assignee] : null,
          }));
          error = result.error;
        }

        if (error) {
          // Common RLS outcomes
          if (error.code === "401" || error.code === "42501" || error.message?.toLowerCase().includes("permission")) {
            throw error;
          }
          throw error;
        }

        // If DB returned no rows, fall back to repo (same source as Live Assignments)
        if (!data || data.length === 0) {
          try {
            const reviewStatuses: TaskStatus[] = ["review"] as TaskStatus[];
            const repoAssignments: Assignment[] = await repo.list({ statuses: reviewStatuses });

            const transformed: DBRow[] = repoAssignments.map((a) => ({
              id: a.id,
              assignment_id: a.id,
              owner_id: "system",
              status: a.status,
              created_at: a.created_at,
              updated_at: a.created_at,
              title: a.title,
              assignees: Array.isArray(a.assignees) ? a.assignees : (a.assignees ? [a.assignees as any] : null),
            }));

            if (!cancelled) {
              setAssignments(transformed);
              // If ids look like mock data, tag as demo for the UI badge
              const isDemo = repoAssignments.some((a) => String(a.id).startsWith("mock-"));
              setSource(isDemo ? "demo" : "db");
            }
          } catch (fallbackErr) {
            console.log("Fallback to repo failed, using demo data:", fallbackErr);
            if (!cancelled) {
              setAssignments(getDemoAssignments());
              setSource("demo");
            }
          }
        } else if (!cancelled) {
          setAssignments(data ?? []);
          setSource("db");
        }
      } catch (e: any) {
        if (!cancelled) {
          // If auth/RLS blocks, drop to demo data once, do not loop forever
          console.log("Database query failed, using demo data:", e?.message);
          setError(e?.message ?? "Failed to fetch triage assignments");
          setAssignments(getDemoAssignments());
          setSource("demo");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  // helpers you already call from the UI:
  const addComment = async (assignmentId: string, author: string, text: string) => {
    // write to your triage_details comments column or a separate comments table
    // example placeholder:
    return Promise.resolve();
  };

  const updateAssignmentStatus = async (assignmentId: string, next: "todo" | "done" | "queued") => {
    try {
      const { error } = await supabase
        .from("assignments")
        .update({ status: next })
        .eq("id", assignmentId);
      if (error) throw error;
      // optimistic update
      setAssignments(a => a.map(r => r.assignment_id === assignmentId ? { ...r, status: next } : r));
    } catch (error) {
      console.log("Error updating assignment status:", error);
    }
  };

  return { assignments, loading, error, source, addComment, updateAssignmentStatus };
}
