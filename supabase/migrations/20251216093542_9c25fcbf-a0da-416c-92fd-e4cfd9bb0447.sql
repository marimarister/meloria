-- Remove the policy that allows HR/Company users to view individual test results
DROP POLICY IF EXISTS "Company users can view group test results" ON public.test_results;