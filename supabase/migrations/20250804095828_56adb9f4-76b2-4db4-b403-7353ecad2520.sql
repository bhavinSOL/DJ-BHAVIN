-- Update RLS policies for songs table to allow authenticated users to manage songs

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Only service role can modify songs" ON public.songs;

-- Create new policies that allow authenticated users to manage songs
CREATE POLICY "Authenticated users can update songs" 
ON public.songs 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete songs" 
ON public.songs 
FOR DELETE 
TO authenticated 
USING (true);