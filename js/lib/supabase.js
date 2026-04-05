import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://cmmzqprrqdopypseyciz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbXpxcHJycWRvcHlwc2V5Y2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTkzMzEsImV4cCI6MjA5MDk3NTMzMX0.Thm9qThTd0hZWzNIwW9REZLEZ9-A39Fbr_JFb-HpX48';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
