import { useEffect, useState } from "react";
import { db } from "../utils/supabase/client";
import type { Assignment } from "../types/assignment";

export function useAssignment(id: string | null) {
  const [data, setData] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    
    let active = true;
    
    (async () => {
      try {
        setLoading(true);
        const assignment = await db.assignments.getById(id);
        
        if (active && assignment) {
          // Convert the database assignment to our Assignment type
          const formattedAssignment: Assignment = {
            ...assignment,
            createdBy: { id: 'system', name: 'System' }, // Default since we don't have this in DB yet
            steps: assignment.tags?.map((tag, index) => ({
              id: `step-${index}`,
              title: tag,
              status: index === 0 ? 'running' : 'pending'
            })) || [],
            scheduledFor: assignment.due_date || undefined,
            dueAt: assignment.due_date || undefined,
            estimatedHours: assignment.est_hours,
            actualHours: assignment.actual_hours,
            commentsCount: 0
          };
          
          setData(formattedAssignment);
        }
      } catch (error) {
        console.error('Error loading assignment:', error);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    
    // Set up live sync with polling (can be enhanced with real-time subscriptions)
    const sub = db.assignments.onChanges((payload: any) => {
      if (payload.new?.id === id && active) {
        const updatedAssignment: Assignment = {
          ...payload.new,
          createdBy: { id: 'system', name: 'System' },
          steps: payload.new.tags?.map((tag: string, index: number) => ({
            id: `step-${index}`,
            title: tag,
            status: index === 0 ? 'running' : 'pending'
          })) || [],
          scheduledFor: payload.new.due_date || undefined,
          dueAt: payload.new.due_date || undefined,
          estimatedHours: payload.new.est_hours,
          actualHours: payload.new.actual_hours,
          commentsCount: 0
        };
        setData(updatedAssignment);
      }
    });
    
    return () => { 
      active = false; 
      sub?.unsubscribe?.(); 
    };
  }, [id]);
  
  return { data, loading };
}