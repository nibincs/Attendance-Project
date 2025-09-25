// Supabase client configuration for the browser
// Replace SUPABASE_URL and SUPABASE_ANON with your project's values
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://tfrakwyrmuqpbmswqsem.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcmFrd3lybXVxcGJtc3dxc2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzIyMzgsImV4cCI6MjA3NDMwODIzOH0.mbTp769Kx_458SvonHVd66q1fXxf2dZEfzEBK_NhcOE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export default supabase
