create
policy "Enable users to view their own data only"
on "public"."preferences"
as PERMISSIVE
for ALL
to authenticated
using (
  (select auth.uid()) = user_id
);