-- Activities belong to a lead (person/inbound), not a Google place.
-- Prevent reusing a lead row for a different place/report once CRM history exists.

CREATE OR REPLACE FUNCTION public.prevent_lead_place_reassignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.place_id IS DISTINCT FROM OLD.place_id
        OR NEW.report_id IS DISTINCT FROM OLD.report_id
        OR NEW.business IS DISTINCT FROM OLD.business)
       AND EXISTS (
         SELECT 1 FROM public.lead_activities a WHERE a.lead_id = OLD.id
       ) THEN
      RAISE EXCEPTION
        'Cannot reassign place/report/business on lead % that already has CRM activity. Insert a new lead for the new inbound contact.',
        OLD.id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_lead_place_reassignment ON public.leads;
CREATE TRIGGER trg_prevent_lead_place_reassignment
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_lead_place_reassignment();

CREATE OR REPLACE FUNCTION public.prevent_shared_lead_across_places()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.presence_reports pr
      WHERE pr.lead_id = NEW.lead_id
        AND pr.id IS DISTINCT FROM NEW.id
        AND pr.place_id IS DISTINCT FROM NEW.place_id
    ) THEN
      RAISE EXCEPTION
        'Lead % is already linked to a different place. Create a new lead for report %.',
        NEW.lead_id, NEW.id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_shared_lead_across_places ON public.presence_reports;
CREATE TRIGGER trg_prevent_shared_lead_across_places
  BEFORE INSERT OR UPDATE OF lead_id, place_id ON public.presence_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_shared_lead_across_places();
