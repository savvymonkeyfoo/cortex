-- Add RLS policies for anonymous users (anon key access)
-- This allows the frontend to read triage assignments without authentication

-- Create policies for anonymous access
create policy "read_all_anon" on public.assignments for select to anon using (true);
create policy "read_all_anon" on public.assignment_steps for select to anon using (true);
create policy "read_all_anon" on public.assignment_provenance for select to anon using (true);
create policy "read_all_anon" on public.assignment_approval_chain for select to anon using (true);
create policy "read_all_anon" on public.assignment_citations for select to anon using (true);
create policy "read_all_anon" on public.assignment_comments for select to anon using (true);

-- Allow anonymous users to update assignment status and comments (for demo purposes)
create policy "update_anon" on public.assignments for update to anon using (true);
create policy "insert_comments_anon" on public.assignment_comments for insert to anon with check (true);