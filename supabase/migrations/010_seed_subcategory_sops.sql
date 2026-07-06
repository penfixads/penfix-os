-- Seed a starting-point SOP checklist for every subcategory, generated from industry-standard
-- production flows grouped by category/production type (large-format print, sticker, acrylic
-- fabrication, apparel/sublimation, signage, collaterals, quick print, raw materials, services).
-- This is a DRAFT — edit each subcategory's steps in the Subcategory SOPs admin page to match
-- exactly how Penfix practices it (add/remove/reorder/rename as needed).
-- Only inserts for subcategories that don't already have any steps, so it's safe to re-run.

-- ACRYL-CPL01 :: Car Plates (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-CPL01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CPL01-STEP-1', 'ACRYL-CPL01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CPL01-STEP-2', 'ACRYL-CPL01', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CPL01-STEP-3', 'ACRYL-CPL01', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CPL01-STEP-4', 'ACRYL-CPL01', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CPL01-STEP-5', 'ACRYL-CPL01', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CPL01-STEP-6', 'ACRYL-CPL01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-DNP01 :: Desk Nameplates (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-DNP01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP01-STEP-1', 'ACRYL-DNP01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP01-STEP-2', 'ACRYL-DNP01', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP01-STEP-3', 'ACRYL-DNP01', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP01-STEP-4', 'ACRYL-DNP01', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP01-STEP-5', 'ACRYL-DNP01', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP01-STEP-6', 'ACRYL-DNP01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-DNP02 :: Desk Nameplates (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-DNP02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP02-STEP-1', 'ACRYL-DNP02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP02-STEP-2', 'ACRYL-DNP02', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP02-STEP-3', 'ACRYL-DNP02', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP02-STEP-4', 'ACRYL-DNP02', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP02-STEP-5', 'ACRYL-DNP02', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DNP02-STEP-6', 'ACRYL-DNP02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-CBX05 :: Donation Boxes (3mm) (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-CBX05') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CBX05-STEP-1', 'ACRYL-CBX05', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CBX05-STEP-2', 'ACRYL-CBX05', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CBX05-STEP-3', 'ACRYL-CBX05', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CBX05-STEP-4', 'ACRYL-CBX05', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CBX05-STEP-5', 'ACRYL-CBX05', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CBX05-STEP-6', 'ACRYL-CBX05', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-HPL01 :: House Plates (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-HPL01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-HPL01-STEP-1', 'ACRYL-HPL01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-HPL01-STEP-2', 'ACRYL-HPL01', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-HPL01-STEP-3', 'ACRYL-HPL01', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-HPL01-STEP-4', 'ACRYL-HPL01', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-HPL01-STEP-5', 'ACRYL-HPL01', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-HPL01-STEP-6', 'ACRYL-HPL01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-E1 :: Medals (3mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-E1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-1', 'ACRYL-MDL-E1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-2', 'ACRYL-MDL-E1', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-3', 'ACRYL-MDL-E1', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-4', 'ACRYL-MDL-E1', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-5', 'ACRYL-MDL-E1', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-6', 'ACRYL-MDL-E1', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E1-STEP-7', 'ACRYL-MDL-E1', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-P1 :: Medals (3mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-P1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-1', 'ACRYL-MDL-P1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-2', 'ACRYL-MDL-P1', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-3', 'ACRYL-MDL-P1', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-4', 'ACRYL-MDL-P1', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-5', 'ACRYL-MDL-P1', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-6', 'ACRYL-MDL-P1', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P1-STEP-7', 'ACRYL-MDL-P1', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-E2 :: Medals (4mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-E2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-1', 'ACRYL-MDL-E2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-2', 'ACRYL-MDL-E2', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-3', 'ACRYL-MDL-E2', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-4', 'ACRYL-MDL-E2', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-5', 'ACRYL-MDL-E2', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-6', 'ACRYL-MDL-E2', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E2-STEP-7', 'ACRYL-MDL-E2', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-P2 :: Medals (4mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-P2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-1', 'ACRYL-MDL-P2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-2', 'ACRYL-MDL-P2', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-3', 'ACRYL-MDL-P2', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-4', 'ACRYL-MDL-P2', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-5', 'ACRYL-MDL-P2', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-6', 'ACRYL-MDL-P2', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P2-STEP-7', 'ACRYL-MDL-P2', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-E3 :: Medals (5mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-E3') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-1', 'ACRYL-MDL-E3', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-2', 'ACRYL-MDL-E3', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-3', 'ACRYL-MDL-E3', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-4', 'ACRYL-MDL-E3', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-5', 'ACRYL-MDL-E3', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-6', 'ACRYL-MDL-E3', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E3-STEP-7', 'ACRYL-MDL-E3', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-P3 :: Medals (5mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-P3') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-1', 'ACRYL-MDL-P3', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-2', 'ACRYL-MDL-P3', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-3', 'ACRYL-MDL-P3', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-4', 'ACRYL-MDL-P3', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-5', 'ACRYL-MDL-P3', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-6', 'ACRYL-MDL-P3', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P3-STEP-7', 'ACRYL-MDL-P3', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-E4 :: Medals (6mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-E4') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-1', 'ACRYL-MDL-E4', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-2', 'ACRYL-MDL-E4', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-3', 'ACRYL-MDL-E4', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-4', 'ACRYL-MDL-E4', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-5', 'ACRYL-MDL-E4', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-6', 'ACRYL-MDL-E4', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-E4-STEP-7', 'ACRYL-MDL-E4', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MDL-P4 :: Medals (6mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MDL-P4') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-1', 'ACRYL-MDL-P4', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-2', 'ACRYL-MDL-P4', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-3', 'ACRYL-MDL-P4', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-4', 'ACRYL-MDL-P4', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-5', 'ACRYL-MDL-P4', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-6', 'ACRYL-MDL-P4', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MDL-P4-STEP-7', 'ACRYL-MDL-P4', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-MPL01 :: Motor Plates (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-MPL01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MPL01-STEP-1', 'ACRYL-MPL01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MPL01-STEP-2', 'ACRYL-MPL01', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MPL01-STEP-3', 'ACRYL-MPL01', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MPL01-STEP-4', 'ACRYL-MPL01', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MPL01-STEP-5', 'ACRYL-MPL01', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-MPL01-STEP-6', 'ACRYL-MPL01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-RBX01 :: Raffle Draw Box (3mm, pentagon) (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-RBX01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX01-STEP-1', 'ACRYL-RBX01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX01-STEP-2', 'ACRYL-RBX01', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX01-STEP-3', 'ACRYL-RBX01', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX01-STEP-4', 'ACRYL-RBX01', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX01-STEP-5', 'ACRYL-RBX01', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX01-STEP-6', 'ACRYL-RBX01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-RBX02 :: Raffle Draw Box (4mm, pentagon) (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-RBX02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX02-STEP-1', 'ACRYL-RBX02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX02-STEP-2', 'ACRYL-RBX02', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX02-STEP-3', 'ACRYL-RBX02', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX02-STEP-4', 'ACRYL-RBX02', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX02-STEP-5', 'ACRYL-RBX02', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX02-STEP-6', 'ACRYL-RBX02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-RBX03 :: Raffle Draw Box (5mm, pentagon) (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-RBX03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX03-STEP-1', 'ACRYL-RBX03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX03-STEP-2', 'ACRYL-RBX03', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX03-STEP-3', 'ACRYL-RBX03', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX03-STEP-4', 'ACRYL-RBX03', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX03-STEP-5', 'ACRYL-RBX03', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX03-STEP-6', 'ACRYL-RBX03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-RBX04 :: Raffle Draw Box (6mm, pentagon) (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-RBX04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX04-STEP-1', 'ACRYL-RBX04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX04-STEP-2', 'ACRYL-RBX04', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX04-STEP-3', 'ACRYL-RBX04', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX04-STEP-4', 'ACRYL-RBX04', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX04-STEP-5', 'ACRYL-RBX04', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-RBX04-STEP-6', 'ACRYL-RBX04', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-E1 :: Trophies/Plaques (3mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-E1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-1', 'ACRYL-TRP-E1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-2', 'ACRYL-TRP-E1', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-3', 'ACRYL-TRP-E1', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-4', 'ACRYL-TRP-E1', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-5', 'ACRYL-TRP-E1', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-6', 'ACRYL-TRP-E1', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E1-STEP-7', 'ACRYL-TRP-E1', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-P1 :: Trophies/Plaques (3mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-P1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-1', 'ACRYL-TRP-P1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-2', 'ACRYL-TRP-P1', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-3', 'ACRYL-TRP-P1', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-4', 'ACRYL-TRP-P1', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-5', 'ACRYL-TRP-P1', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-6', 'ACRYL-TRP-P1', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P1-STEP-7', 'ACRYL-TRP-P1', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-E2 :: Trophies/Plaques (4mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-E2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-1', 'ACRYL-TRP-E2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-2', 'ACRYL-TRP-E2', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-3', 'ACRYL-TRP-E2', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-4', 'ACRYL-TRP-E2', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-5', 'ACRYL-TRP-E2', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-6', 'ACRYL-TRP-E2', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E2-STEP-7', 'ACRYL-TRP-E2', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-P2 :: Trophies/Plaques (4mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-P2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-1', 'ACRYL-TRP-P2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-2', 'ACRYL-TRP-P2', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-3', 'ACRYL-TRP-P2', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-4', 'ACRYL-TRP-P2', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-5', 'ACRYL-TRP-P2', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-6', 'ACRYL-TRP-P2', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P2-STEP-7', 'ACRYL-TRP-P2', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-E3 :: Trophies/Plaques (5mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-E3') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-1', 'ACRYL-TRP-E3', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-2', 'ACRYL-TRP-E3', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-3', 'ACRYL-TRP-E3', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-4', 'ACRYL-TRP-E3', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-5', 'ACRYL-TRP-E3', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-6', 'ACRYL-TRP-E3', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E3-STEP-7', 'ACRYL-TRP-E3', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-P3 :: Trophies/Plaques (5mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-P3') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-1', 'ACRYL-TRP-P3', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-2', 'ACRYL-TRP-P3', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-3', 'ACRYL-TRP-P3', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-4', 'ACRYL-TRP-P3', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-5', 'ACRYL-TRP-P3', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-6', 'ACRYL-TRP-P3', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P3-STEP-7', 'ACRYL-TRP-P3', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-E4 :: Trophies/Plaques (6mm, engraved) (acrylicEngraved)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-E4') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-1', 'ACRYL-TRP-E4', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-2', 'ACRYL-TRP-E4', 'For Layout/Design', 2, true, false, false, false, 'Prepare the engraving/vector artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-3', 'ACRYL-TRP-E4', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-4', 'ACRYL-TRP-E4', 'Laser Engraving', 4, true, false, false, false, 'Engrave text/logo per approved design.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-5', 'ACRYL-TRP-E4', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-6', 'ACRYL-TRP-E4', 'Quality Check', 6, true, false, false, false, 'Check engraving depth/clarity and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-E4-STEP-7', 'ACRYL-TRP-E4', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-P4 :: Trophies/Plaques (6mm, printed sticker) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-P4') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-1', 'ACRYL-TRP-P4', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-2', 'ACRYL-TRP-P4', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-3', 'ACRYL-TRP-P4', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-4', 'ACRYL-TRP-P4', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-5', 'ACRYL-TRP-P4', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-6', 'ACRYL-TRP-P4', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-P4-STEP-7', 'ACRYL-TRP-P4', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-TRP-CSTM :: Trophies/Plaques (combination of materials) (acrylicPrintedSticker)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-TRP-CSTM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-1', 'ACRYL-TRP-CSTM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-2', 'ACRYL-TRP-CSTM', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork for the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-3', 'ACRYL-TRP-CSTM', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut the acrylic piece to size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-4', 'ACRYL-TRP-CSTM', 'Sticker Printing & Application', 4, true, false, false, false, 'Print and apply the sticker face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-5', 'ACRYL-TRP-CSTM', 'Assembly & Mounting', 5, true, false, false, false, 'Attach stands, backing, or hardware as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-6', 'ACRYL-TRP-CSTM', 'Quality Check', 6, true, false, false, false, 'Check sticker application and overall finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-TRP-CSTM-STEP-7', 'ACRYL-TRP-CSTM', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-CONT-CAB01 :: Acrylic Cabinet (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-CONT-CAB01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CONT-CAB01-STEP-1', 'ACRYL-CONT-CAB01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CONT-CAB01-STEP-2', 'ACRYL-CONT-CAB01', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CONT-CAB01-STEP-3', 'ACRYL-CONT-CAB01', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CONT-CAB01-STEP-4', 'ACRYL-CONT-CAB01', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CONT-CAB01-STEP-5', 'ACRYL-CONT-CAB01', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CONT-CAB01-STEP-6', 'ACRYL-CONT-CAB01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-GOLD-CUT :: Acrylic Gold Cut (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-GOLD-CUT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-GOLD-CUT-STEP-1', 'ACRYL-GOLD-CUT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-GOLD-CUT-STEP-2', 'ACRYL-GOLD-CUT', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-GOLD-CUT-STEP-3', 'ACRYL-GOLD-CUT', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-GOLD-CUT-STEP-4', 'ACRYL-GOLD-CUT', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-GOLD-CUT-STEP-5', 'ACRYL-GOLD-CUT', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-GOLD-CUT-STEP-6', 'ACRYL-GOLD-CUT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-DIFF-CUT :: Acrylic Diffuser Cut (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-DIFF-CUT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DIFF-CUT-STEP-1', 'ACRYL-DIFF-CUT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DIFF-CUT-STEP-2', 'ACRYL-DIFF-CUT', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DIFF-CUT-STEP-3', 'ACRYL-DIFF-CUT', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DIFF-CUT-STEP-4', 'ACRYL-DIFF-CUT', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DIFF-CUT-STEP-5', 'ACRYL-DIFF-CUT', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-DIFF-CUT-STEP-6', 'ACRYL-DIFF-CUT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- ACRYL-CHK-CUT :: Acrylic Chalk White Cut (acrylicPlainCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACRYL-CHK-CUT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CHK-CUT-STEP-1', 'ACRYL-CHK-CUT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CHK-CUT-STEP-2', 'ACRYL-CHK-CUT', 'For Layout/Design', 2, true, false, false, false, 'Confirm cut dimensions/pattern with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CHK-CUT-STEP-3', 'ACRYL-CHK-CUT', 'Material Preparation & Cutting', 3, true, false, true, false, 'Cut/fabricate per specification.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CHK-CUT-STEP-4', 'ACRYL-CHK-CUT', 'Assembly & Finishing', 4, true, false, false, false, 'Edge polishing, folding, or assembly as applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CHK-CUT-STEP-5', 'ACRYL-CHK-CUT', 'Quality Check', 5, true, false, false, false, 'Check cut accuracy and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACRYL-CHK-CUT-STEP-6', 'ACRYL-CHK-CUT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- BLO-15OZ-01 :: Blackout Print (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BLO-15OZ-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BLO-15OZ-01-STEP-1', 'BLO-15OZ-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BLO-15OZ-01-STEP-2', 'BLO-15OZ-01', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BLO-15OZ-01-STEP-3', 'BLO-15OZ-01', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BLO-15OZ-01-STEP-4', 'BLO-15OZ-01', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BLO-15OZ-01-STEP-5', 'BLO-15OZ-01', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BLO-15OZ-01-STEP-6', 'BLO-15OZ-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- CNVS-22OZ-01 :: Canvas Print (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'CNVS-22OZ-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('CNVS-22OZ-01-STEP-1', 'CNVS-22OZ-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('CNVS-22OZ-01-STEP-2', 'CNVS-22OZ-01', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('CNVS-22OZ-01-STEP-3', 'CNVS-22OZ-01', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('CNVS-22OZ-01-STEP-4', 'CNVS-22OZ-01', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('CNVS-22OZ-01-STEP-5', 'CNVS-22OZ-01', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('CNVS-22OZ-01-STEP-6', 'CNVS-22OZ-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- BKLIT-01 :: Backlit Film Print (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BKLIT-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BKLIT-01-STEP-1', 'BKLIT-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BKLIT-01-STEP-2', 'BKLIT-01', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BKLIT-01-STEP-3', 'BKLIT-01', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BKLIT-01-STEP-4', 'BKLIT-01', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BKLIT-01-STEP-5', 'BKLIT-01', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BKLIT-01-STEP-6', 'BKLIT-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- FLEX-20OZ-01 :: Korflex Print (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'FLEX-20OZ-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('FLEX-20OZ-01-STEP-1', 'FLEX-20OZ-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('FLEX-20OZ-01-STEP-2', 'FLEX-20OZ-01', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('FLEX-20OZ-01-STEP-3', 'FLEX-20OZ-01', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('FLEX-20OZ-01-STEP-4', 'FLEX-20OZ-01', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('FLEX-20OZ-01-STEP-5', 'FLEX-20OZ-01', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('FLEX-20OZ-01-STEP-6', 'FLEX-20OZ-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- TARP-03 :: Tarpaulin Print (12oz) (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'TARP-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-03-STEP-1', 'TARP-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-03-STEP-2', 'TARP-03', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-03-STEP-3', 'TARP-03', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-03-STEP-4', 'TARP-03', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-03-STEP-5', 'TARP-03', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-03-STEP-6', 'TARP-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- TARP-04 :: Tarpaulin UV Print (12oz) (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'TARP-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-04-STEP-1', 'TARP-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-04-STEP-2', 'TARP-04', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-04-STEP-3', 'TARP-04', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-04-STEP-4', 'TARP-04', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-04-STEP-5', 'TARP-04', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-04-STEP-6', 'TARP-04', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- TARP-02 :: Tarpaulin Print (10oz) (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'TARP-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-02-STEP-1', 'TARP-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-02-STEP-2', 'TARP-02', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-02-STEP-3', 'TARP-02', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-02-STEP-4', 'TARP-02', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-02-STEP-5', 'TARP-02', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-02-STEP-6', 'TARP-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- TARP-01 :: Tarpaulin Print (8oz) (banner)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'TARP-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-01-STEP-1', 'TARP-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-01-STEP-2', 'TARP-01', 'For Layout/Design', 2, true, false, false, false, 'GA prepares/confirms the print-ready file with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-01-STEP-3', 'TARP-01', 'For Printing', 3, true, false, true, false, 'Large-format print run on the specified media.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-01-STEP-4', 'TARP-01', 'Trimming & Eyelets', 4, true, false, false, false, 'Trim to size and install eyelets/hemming as needed.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-01-STEP-5', 'TARP-01', 'Quality Check', 5, true, false, false, false, 'Check print quality, color accuracy, and finishing before releasing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('TARP-01-STEP-6', 'TARP-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR01 :: Brochure (4pcs in 1 A4) Front Only (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-1', 'BMC-STNRY-BR01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-2', 'BMC-STNRY-BR01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-3', 'BMC-STNRY-BR01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-4', 'BMC-STNRY-BR01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-5', 'BMC-STNRY-BR01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-6', 'BMC-STNRY-BR01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR01-STEP-7', 'BMC-STNRY-BR01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR02 :: Brochure (3pcs in 1 A4) Front Only (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-1', 'BMC-STNRY-BR02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-2', 'BMC-STNRY-BR02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-3', 'BMC-STNRY-BR02', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-4', 'BMC-STNRY-BR02', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-5', 'BMC-STNRY-BR02', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-6', 'BMC-STNRY-BR02', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR02-STEP-7', 'BMC-STNRY-BR02', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR03 :: Brochure (2pcs in 1 A4) Front Only (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-1', 'BMC-STNRY-BR03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-2', 'BMC-STNRY-BR03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-3', 'BMC-STNRY-BR03', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-4', 'BMC-STNRY-BR03', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-5', 'BMC-STNRY-BR03', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-6', 'BMC-STNRY-BR03', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR03-STEP-7', 'BMC-STNRY-BR03', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR04 :: Brochure (4pcs in 1 A4) Back to Back (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-1', 'BMC-STNRY-BR04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-2', 'BMC-STNRY-BR04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-3', 'BMC-STNRY-BR04', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-4', 'BMC-STNRY-BR04', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-5', 'BMC-STNRY-BR04', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-6', 'BMC-STNRY-BR04', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR04-STEP-7', 'BMC-STNRY-BR04', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR05 :: Brochure (3pcs in 1 A4) Back to Back (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR05') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-1', 'BMC-STNRY-BR05', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-2', 'BMC-STNRY-BR05', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-3', 'BMC-STNRY-BR05', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-4', 'BMC-STNRY-BR05', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-5', 'BMC-STNRY-BR05', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-6', 'BMC-STNRY-BR05', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR05-STEP-7', 'BMC-STNRY-BR05', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR06 :: Brochure (2pcs in 1 A4) Back to Back (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR06') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-1', 'BMC-STNRY-BR06', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-2', 'BMC-STNRY-BR06', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-3', 'BMC-STNRY-BR06', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-4', 'BMC-STNRY-BR06', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-5', 'BMC-STNRY-BR06', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-6', 'BMC-STNRY-BR06', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR06-STEP-7', 'BMC-STNRY-BR06', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR07 :: Brochure (Bi-fold)  (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR07') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-1', 'BMC-STNRY-BR07', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-2', 'BMC-STNRY-BR07', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-3', 'BMC-STNRY-BR07', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-4', 'BMC-STNRY-BR07', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-5', 'BMC-STNRY-BR07', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-6', 'BMC-STNRY-BR07', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR07-STEP-7', 'BMC-STNRY-BR07', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-BR08 :: Brochure (Tri-fold) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-BR08') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-1', 'BMC-STNRY-BR08', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-2', 'BMC-STNRY-BR08', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-3', 'BMC-STNRY-BR08', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-4', 'BMC-STNRY-BR08', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-5', 'BMC-STNRY-BR08', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-6', 'BMC-STNRY-BR08', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-BR08-STEP-7', 'BMC-STNRY-BR08', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-CC06 :: Calling Card (C2S premium, Back to Back, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-CC06') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-1', 'BMC-STNRY-CC06', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-2', 'BMC-STNRY-CC06', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-3', 'BMC-STNRY-CC06', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-4', 'BMC-STNRY-CC06', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-5', 'BMC-STNRY-CC06', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-6', 'BMC-STNRY-CC06', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC06-STEP-7', 'BMC-STNRY-CC06', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-CC03 :: Calling Card (C2S premium, Front Only, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-CC03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-1', 'BMC-STNRY-CC03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-2', 'BMC-STNRY-CC03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-3', 'BMC-STNRY-CC03', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-4', 'BMC-STNRY-CC03', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-5', 'BMC-STNRY-CC03', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-6', 'BMC-STNRY-CC03', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC03-STEP-7', 'BMC-STNRY-CC03', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-CC05 :: Calling Card (Glossy, Back to Back, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-CC05') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-1', 'BMC-STNRY-CC05', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-2', 'BMC-STNRY-CC05', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-3', 'BMC-STNRY-CC05', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-4', 'BMC-STNRY-CC05', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-5', 'BMC-STNRY-CC05', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-6', 'BMC-STNRY-CC05', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC05-STEP-7', 'BMC-STNRY-CC05', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-CC02 :: Calling Card (Glossy, Front Only, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-CC02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-1', 'BMC-STNRY-CC02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-2', 'BMC-STNRY-CC02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-3', 'BMC-STNRY-CC02', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-4', 'BMC-STNRY-CC02', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-5', 'BMC-STNRY-CC02', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-6', 'BMC-STNRY-CC02', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC02-STEP-7', 'BMC-STNRY-CC02', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-CC04 :: Calling Card (Matte, Back to Back, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-CC04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-1', 'BMC-STNRY-CC04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-2', 'BMC-STNRY-CC04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-3', 'BMC-STNRY-CC04', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-4', 'BMC-STNRY-CC04', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-5', 'BMC-STNRY-CC04', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-6', 'BMC-STNRY-CC04', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC04-STEP-7', 'BMC-STNRY-CC04', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-CC01 :: Calling Card (Matte, Front Only, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-CC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-1', 'BMC-STNRY-CC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-2', 'BMC-STNRY-CC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-3', 'BMC-STNRY-CC01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-4', 'BMC-STNRY-CC01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-5', 'BMC-STNRY-CC01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-6', 'BMC-STNRY-CC01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-CC01-STEP-7', 'BMC-STNRY-CC01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-SMFP-CF01 :: Certificate (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-SMFP-CF01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-1', 'BMC-SMFP-CF01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-2', 'BMC-SMFP-CF01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-3', 'BMC-SMFP-CF01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-4', 'BMC-SMFP-CF01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-5', 'BMC-SMFP-CF01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-6', 'BMC-SMFP-CF01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-CF01-STEP-7', 'BMC-SMFP-CF01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-SMFP-GC01 :: Gift Cheque (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-SMFP-GC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-1', 'BMC-SMFP-GC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-2', 'BMC-SMFP-GC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-3', 'BMC-SMFP-GC01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-4', 'BMC-SMFP-GC01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-5', 'BMC-SMFP-GC01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-6', 'BMC-SMFP-GC01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-GC01-STEP-7', 'BMC-SMFP-GC01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-SMFP-ID01 :: ID Card (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-SMFP-ID01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-1', 'BMC-SMFP-ID01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-2', 'BMC-SMFP-ID01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-3', 'BMC-SMFP-ID01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-4', 'BMC-SMFP-ID01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-5', 'BMC-SMFP-ID01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-6', 'BMC-SMFP-ID01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-ID01-STEP-7', 'BMC-SMFP-ID01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LF01 :: Leaflet/Flyer (A4) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LF01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-1', 'BMC-STNRY-LF01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-2', 'BMC-STNRY-LF01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-3', 'BMC-STNRY-LF01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-4', 'BMC-STNRY-LF01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-5', 'BMC-STNRY-LF01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-6', 'BMC-STNRY-LF01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF01-STEP-7', 'BMC-STNRY-LF01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LF02 :: Leaflet/Flyer (A5 - Half A4) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LF02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-1', 'BMC-STNRY-LF02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-2', 'BMC-STNRY-LF02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-3', 'BMC-STNRY-LF02', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-4', 'BMC-STNRY-LF02', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-5', 'BMC-STNRY-LF02', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-6', 'BMC-STNRY-LF02', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF02-STEP-7', 'BMC-STNRY-LF02', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LF03 :: Leaflet/Flyer (A6 - Half A5) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LF03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-1', 'BMC-STNRY-LF03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-2', 'BMC-STNRY-LF03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-3', 'BMC-STNRY-LF03', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-4', 'BMC-STNRY-LF03', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-5', 'BMC-STNRY-LF03', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-6', 'BMC-STNRY-LF03', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF03-STEP-7', 'BMC-STNRY-LF03', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LF04 :: Leaflet/Flyer (DL - 1/3 A4) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LF04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-1', 'BMC-STNRY-LF04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-2', 'BMC-STNRY-LF04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-3', 'BMC-STNRY-LF04', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-4', 'BMC-STNRY-LF04', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-5', 'BMC-STNRY-LF04', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-6', 'BMC-STNRY-LF04', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LF04-STEP-7', 'BMC-STNRY-LF04', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LFB2B1 :: Leaflet/Flyer Back-to-Back (A4) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LFB2B1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-1', 'BMC-STNRY-LFB2B1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-2', 'BMC-STNRY-LFB2B1', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-3', 'BMC-STNRY-LFB2B1', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-4', 'BMC-STNRY-LFB2B1', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-5', 'BMC-STNRY-LFB2B1', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-6', 'BMC-STNRY-LFB2B1', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B1-STEP-7', 'BMC-STNRY-LFB2B1', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LFB2B2 :: Leaflet/Flyer Back-to-Back (A5 - Half A4) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LFB2B2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-1', 'BMC-STNRY-LFB2B2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-2', 'BMC-STNRY-LFB2B2', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-3', 'BMC-STNRY-LFB2B2', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-4', 'BMC-STNRY-LFB2B2', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-5', 'BMC-STNRY-LFB2B2', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-6', 'BMC-STNRY-LFB2B2', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B2-STEP-7', 'BMC-STNRY-LFB2B2', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LFB2B3 :: Leaflet/Flyer Back-to-Back (A6 - Half A5) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LFB2B3') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-1', 'BMC-STNRY-LFB2B3', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-2', 'BMC-STNRY-LFB2B3', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-3', 'BMC-STNRY-LFB2B3', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-4', 'BMC-STNRY-LFB2B3', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-5', 'BMC-STNRY-LFB2B3', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-6', 'BMC-STNRY-LFB2B3', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B3-STEP-7', 'BMC-STNRY-LFB2B3', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LFB2B4 :: Leaflet/Flyer Back-to-Back (DL - 1/3 A4) - 10pcs (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LFB2B4') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-1', 'BMC-STNRY-LFB2B4', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-2', 'BMC-STNRY-LFB2B4', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-3', 'BMC-STNRY-LFB2B4', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-4', 'BMC-STNRY-LFB2B4', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-5', 'BMC-STNRY-LFB2B4', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-6', 'BMC-STNRY-LFB2B4', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LFB2B4-STEP-7', 'BMC-STNRY-LFB2B4', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LH01 :: Letterhead - 1 ream (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LH01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-1', 'BMC-STNRY-LH01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-2', 'BMC-STNRY-LH01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-3', 'BMC-STNRY-LH01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-4', 'BMC-STNRY-LH01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-5', 'BMC-STNRY-LH01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-6', 'BMC-STNRY-LH01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LH01-STEP-7', 'BMC-STNRY-LH01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LC02 :: Loyalty Card (Back to Back, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LC02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-1', 'BMC-STNRY-LC02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-2', 'BMC-STNRY-LC02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-3', 'BMC-STNRY-LC02', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-4', 'BMC-STNRY-LC02', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-5', 'BMC-STNRY-LC02', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-6', 'BMC-STNRY-LC02', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC02-STEP-7', 'BMC-STNRY-LC02', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-STNRY-LC01 :: Loyalty Card (Front Only, 100pcs/set) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-STNRY-LC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-1', 'BMC-STNRY-LC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-2', 'BMC-STNRY-LC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-3', 'BMC-STNRY-LC01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-4', 'BMC-STNRY-LC01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-5', 'BMC-STNRY-LC01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-6', 'BMC-STNRY-LC01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-STNRY-LC01-STEP-7', 'BMC-STNRY-LC01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-SMFP-RT02 :: Raffle tickets (10 pcs per A4, 105 x 59 mm) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-SMFP-RT02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-1', 'BMC-SMFP-RT02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-2', 'BMC-SMFP-RT02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-3', 'BMC-SMFP-RT02', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-4', 'BMC-SMFP-RT02', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-5', 'BMC-SMFP-RT02', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-6', 'BMC-SMFP-RT02', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT02-STEP-7', 'BMC-SMFP-RT02', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-SMFP-RT01 :: Raffle tickets (6 pcs per A4, 105mm x 99 mm) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-SMFP-RT01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-1', 'BMC-SMFP-RT01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-2', 'BMC-SMFP-RT01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-3', 'BMC-SMFP-RT01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-4', 'BMC-SMFP-RT01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-5', 'BMC-SMFP-RT01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-6', 'BMC-SMFP-RT01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT01-STEP-7', 'BMC-SMFP-RT01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-SMFP-RT03 :: Raffle tickets (DL size (1/3 A4), 3pcs in A4) (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-SMFP-RT03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-1', 'BMC-SMFP-RT03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-2', 'BMC-SMFP-RT03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-3', 'BMC-SMFP-RT03', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-4', 'BMC-SMFP-RT03', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-5', 'BMC-SMFP-RT03', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-6', 'BMC-SMFP-RT03', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-SMFP-RT03-STEP-7', 'BMC-SMFP-RT03', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-FORM-RB02 :: Receipt/Pads (1/2 A4, A5) 50 sheets per booklet (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-FORM-RB02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-1', 'BMC-FORM-RB02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-2', 'BMC-FORM-RB02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-3', 'BMC-FORM-RB02', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-4', 'BMC-FORM-RB02', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-5', 'BMC-FORM-RB02', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-6', 'BMC-FORM-RB02', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB02-STEP-7', 'BMC-FORM-RB02', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-FORM-RB03 :: Receipt/Pads (1/3 A4, DL) 50 sheets per booklet (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-FORM-RB03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-1', 'BMC-FORM-RB03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-2', 'BMC-FORM-RB03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-3', 'BMC-FORM-RB03', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-4', 'BMC-FORM-RB03', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-5', 'BMC-FORM-RB03', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-6', 'BMC-FORM-RB03', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB03-STEP-7', 'BMC-FORM-RB03', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-FORM-RB04 :: Receipt/Pads (1/4 A4, A6) 50 sheets per booklet (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-FORM-RB04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-1', 'BMC-FORM-RB04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-2', 'BMC-FORM-RB04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-3', 'BMC-FORM-RB04', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-4', 'BMC-FORM-RB04', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-5', 'BMC-FORM-RB04', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-6', 'BMC-FORM-RB04', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB04-STEP-7', 'BMC-FORM-RB04', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- BMC-FORM-RB01 :: Receipt/Pads (A4) 50 sheets per booklet (collateral)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'BMC-FORM-RB01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-1', 'BMC-FORM-RB01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-2', 'BMC-FORM-RB01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready file.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-3', 'BMC-FORM-RB01', 'For Client Approval', 3, true, false, false, false, 'Client reviews and approves the layout before printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-4', 'BMC-FORM-RB01', 'For Printing', 4, true, false, true, false, 'Print run on the specified stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-5', 'BMC-FORM-RB01', 'Cutting & Finishing', 5, true, false, false, false, 'Cut to size; bind into pads/booklets if applicable.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-6', 'BMC-FORM-RB01', 'Quality Check', 6, true, false, false, false, 'Check print quality and finishing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('BMC-FORM-RB01-STEP-7', 'BMC-FORM-RB01', 'Ready For Pickup/Delivery', 7, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-AKC01 :: Acrylic Keychain (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-AKC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-AKC01-STEP-1', 'MERCH-AKC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-AKC01-STEP-2', 'MERCH-AKC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-AKC01-STEP-3', 'MERCH-AKC01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-AKC01-STEP-4', 'MERCH-AKC01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-AKC01-STEP-5', 'MERCH-AKC01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-AKC01-STEP-6', 'MERCH-AKC01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-DSB01 :: Drawstring Bag (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-DSB01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-DSB01-STEP-1', 'MERCH-DSB01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-DSB01-STEP-2', 'MERCH-DSB01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-DSB01-STEP-3', 'MERCH-DSB01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-DSB01-STEP-4', 'MERCH-DSB01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-DSB01-STEP-5', 'MERCH-DSB01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-DSB01-STEP-6', 'MERCH-DSB01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-HDJ01 :: Hoodie / Jacket with a4 Size Print (apparelPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-HDJ01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-1', 'MERCH-HDJ01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-2', 'MERCH-HDJ01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-3', 'MERCH-HDJ01', 'Garment Preparation', 3, true, false, true, false, 'Pre-treat/prepare garment for printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-4', 'MERCH-HDJ01', 'Printing/Pressing', 4, true, false, false, false, 'Apply print via DTF/heat transfer/screen print.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-5', 'MERCH-HDJ01', 'Curing & Finishing', 5, true, false, false, false, 'Cure print and do final trimming/folding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-6', 'MERCH-HDJ01', 'Quality Check', 6, true, false, false, false, 'Check print placement, adhesion, and garment condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-HDJ01-STEP-7', 'MERCH-HDJ01', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-IDL01 :: ID Lace with Badge Holder (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-IDL01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-IDL01-STEP-1', 'MERCH-IDL01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-IDL01-STEP-2', 'MERCH-IDL01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-IDL01-STEP-3', 'MERCH-IDL01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-IDL01-STEP-4', 'MERCH-IDL01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-IDL01-STEP-5', 'MERCH-IDL01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-IDL01-STEP-6', 'MERCH-IDL01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-LNY01 :: Lanyard (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-LNY01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-LNY01-STEP-1', 'MERCH-LNY01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-LNY01-STEP-2', 'MERCH-LNY01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-LNY01-STEP-3', 'MERCH-LNY01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-LNY01-STEP-4', 'MERCH-LNY01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-LNY01-STEP-5', 'MERCH-LNY01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-LNY01-STEP-6', 'MERCH-LNY01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-MGC01 :: Mug Ceramic (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-MGC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGC01-STEP-1', 'MERCH-MGC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGC01-STEP-2', 'MERCH-MGC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGC01-STEP-3', 'MERCH-MGC01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGC01-STEP-4', 'MERCH-MGC01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGC01-STEP-5', 'MERCH-MGC01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGC01-STEP-6', 'MERCH-MGC01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-MGF01 :: Mug Frosted (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-MGF01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGF01-STEP-1', 'MERCH-MGF01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGF01-STEP-2', 'MERCH-MGF01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGF01-STEP-3', 'MERCH-MGF01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGF01-STEP-4', 'MERCH-MGF01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGF01-STEP-5', 'MERCH-MGF01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGF01-STEP-6', 'MERCH-MGF01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-MGM01 :: Mug Magic (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-MGM01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGM01-STEP-1', 'MERCH-MGM01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGM01-STEP-2', 'MERCH-MGM01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGM01-STEP-3', 'MERCH-MGM01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGM01-STEP-4', 'MERCH-MGM01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGM01-STEP-5', 'MERCH-MGM01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-MGM01-STEP-6', 'MERCH-MGM01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-POLO1 :: Polo Shirt with Front Logo Print (apparelPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-POLO1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-1', 'MERCH-POLO1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-2', 'MERCH-POLO1', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-3', 'MERCH-POLO1', 'Garment Preparation', 3, true, false, true, false, 'Pre-treat/prepare garment for printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-4', 'MERCH-POLO1', 'Printing/Pressing', 4, true, false, false, false, 'Apply print via DTF/heat transfer/screen print.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-5', 'MERCH-POLO1', 'Curing & Finishing', 5, true, false, false, false, 'Cure print and do final trimming/folding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-6', 'MERCH-POLO1', 'Quality Check', 6, true, false, false, false, 'Check print placement, adhesion, and garment condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO1-STEP-7', 'MERCH-POLO1', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-POLO2 :: Polo Shirt with Front Logo Print and Back Print (apparelPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-POLO2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-1', 'MERCH-POLO2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-2', 'MERCH-POLO2', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-3', 'MERCH-POLO2', 'Garment Preparation', 3, true, false, true, false, 'Pre-treat/prepare garment for printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-4', 'MERCH-POLO2', 'Printing/Pressing', 4, true, false, false, false, 'Apply print via DTF/heat transfer/screen print.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-5', 'MERCH-POLO2', 'Curing & Finishing', 5, true, false, false, false, 'Cure print and do final trimming/folding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-6', 'MERCH-POLO2', 'Quality Check', 6, true, false, false, false, 'Check print placement, adhesion, and garment condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-POLO2-STEP-7', 'MERCH-POLO2', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-TSC01 :: T-Shirt Cotton (apparelPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-TSC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-1', 'MERCH-TSC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-2', 'MERCH-TSC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-3', 'MERCH-TSC01', 'Garment Preparation', 3, true, false, true, false, 'Pre-treat/prepare garment for printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-4', 'MERCH-TSC01', 'Printing/Pressing', 4, true, false, false, false, 'Apply print via DTF/heat transfer/screen print.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-5', 'MERCH-TSC01', 'Curing & Finishing', 5, true, false, false, false, 'Cure print and do final trimming/folding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-6', 'MERCH-TSC01', 'Quality Check', 6, true, false, false, false, 'Check print placement, adhesion, and garment condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSC01-STEP-7', 'MERCH-TSC01', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-TSD01 :: T-Shirt Dri-Fit (apparelPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-TSD01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-1', 'MERCH-TSD01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-2', 'MERCH-TSD01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-3', 'MERCH-TSD01', 'Garment Preparation', 3, true, false, true, false, 'Pre-treat/prepare garment for printing.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-4', 'MERCH-TSD01', 'Printing/Pressing', 4, true, false, false, false, 'Apply print via DTF/heat transfer/screen print.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-5', 'MERCH-TSD01', 'Curing & Finishing', 5, true, false, false, false, 'Cure print and do final trimming/folding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-6', 'MERCH-TSD01', 'Quality Check', 6, true, false, false, false, 'Check print placement, adhesion, and garment condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TSD01-STEP-7', 'MERCH-TSD01', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-TBC01 :: Tote Bag Canvas (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-TBC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBC01-STEP-1', 'MERCH-TBC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBC01-STEP-2', 'MERCH-TBC01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBC01-STEP-3', 'MERCH-TBC01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBC01-STEP-4', 'MERCH-TBC01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBC01-STEP-5', 'MERCH-TBC01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBC01-STEP-6', 'MERCH-TBC01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-TBP01 :: Tumbler Plastic (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-TBP01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBP01-STEP-1', 'MERCH-TBP01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBP01-STEP-2', 'MERCH-TBP01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBP01-STEP-3', 'MERCH-TBP01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBP01-STEP-4', 'MERCH-TBP01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBP01-STEP-5', 'MERCH-TBP01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBP01-STEP-6', 'MERCH-TBP01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-TBS01 :: Tumbler Stainless (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-TBS01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBS01-STEP-1', 'MERCH-TBS01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBS01-STEP-2', 'MERCH-TBS01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBS01-STEP-3', 'MERCH-TBS01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBS01-STEP-4', 'MERCH-TBS01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBS01-STEP-5', 'MERCH-TBS01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-TBS01-STEP-6', 'MERCH-TBS01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-UMF01 :: Umbrella (Foldable) (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-UMF01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMF01-STEP-1', 'MERCH-UMF01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMF01-STEP-2', 'MERCH-UMF01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMF01-STEP-3', 'MERCH-UMF01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMF01-STEP-4', 'MERCH-UMF01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMF01-STEP-5', 'MERCH-UMF01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMF01-STEP-6', 'MERCH-UMF01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-UMG01 :: Umbrella (Golf) (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-UMG01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMG01-STEP-1', 'MERCH-UMG01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMG01-STEP-2', 'MERCH-UMG01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMG01-STEP-3', 'MERCH-UMG01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMG01-STEP-4', 'MERCH-UMG01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMG01-STEP-5', 'MERCH-UMG01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-UMG01-STEP-6', 'MERCH-UMG01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- MERCH-WB01 :: Water Bottle (promoItem)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'MERCH-WB01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-WB01-STEP-1', 'MERCH-WB01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-WB01-STEP-2', 'MERCH-WB01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print/engraving-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-WB01-STEP-3', 'MERCH-WB01', 'Material Preparation', 3, true, false, true, false, 'Prepare the item/material for branding.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-WB01-STEP-4', 'MERCH-WB01', 'Printing/Engraving Application', 4, true, false, false, false, 'Apply the design via print, engrave, or embroidery.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-WB01-STEP-5', 'MERCH-WB01', 'Quality Check', 5, true, false, false, false, 'Check branding placement and item condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('MERCH-WB01-STEP-6', 'MERCH-WB01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-LPST-01 :: Lamp Post Banner (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-LPST-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-01-STEP-1', 'DSP-LPST-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-01-STEP-2', 'DSP-LPST-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-01-STEP-3', 'DSP-LPST-01', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-01-STEP-4', 'DSP-LPST-01', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-01-STEP-5', 'DSP-LPST-01', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-01-STEP-6', 'DSP-LPST-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-LPST-02 :: Wood Framed Tarpaulin (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-LPST-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-02-STEP-1', 'DSP-LPST-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-02-STEP-2', 'DSP-LPST-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-02-STEP-3', 'DSP-LPST-02', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-02-STEP-4', 'DSP-LPST-02', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-02-STEP-5', 'DSP-LPST-02', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-02-STEP-6', 'DSP-LPST-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-LPST-03 :: Steel Framed Tarpaulin (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-LPST-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-03-STEP-1', 'DSP-LPST-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-03-STEP-2', 'DSP-LPST-03', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-03-STEP-3', 'DSP-LPST-03', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-03-STEP-4', 'DSP-LPST-03', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-03-STEP-5', 'DSP-LPST-03', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-LPST-03-STEP-6', 'DSP-LPST-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-PSTR-01 :: Photoprint (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-PSTR-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-01-STEP-1', 'DSP-PSTR-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-01-STEP-2', 'DSP-PSTR-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-01-STEP-3', 'DSP-PSTR-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-01-STEP-4', 'DSP-PSTR-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-01-STEP-5', 'DSP-PSTR-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-01-STEP-6', 'DSP-PSTR-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-PSTR-02 :: Poster (12" x 18") (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-PSTR-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-02-STEP-1', 'DSP-PSTR-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-02-STEP-2', 'DSP-PSTR-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-02-STEP-3', 'DSP-PSTR-02', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-02-STEP-4', 'DSP-PSTR-02', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-02-STEP-5', 'DSP-PSTR-02', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-02-STEP-6', 'DSP-PSTR-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-PSTR-03 :: Poster (13" x 19") (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-PSTR-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-03-STEP-1', 'DSP-PSTR-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-03-STEP-2', 'DSP-PSTR-03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-03-STEP-3', 'DSP-PSTR-03', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-03-STEP-4', 'DSP-PSTR-03', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-03-STEP-5', 'DSP-PSTR-03', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-PSTR-03-STEP-6', 'DSP-PSTR-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-POP-STK :: Shelf Talker (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-POP-STK') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-STK-STEP-1', 'DSP-POP-STK', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-STK-STEP-2', 'DSP-POP-STK', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-STK-STEP-3', 'DSP-POP-STK', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-STK-STEP-4', 'DSP-POP-STK', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-STK-STEP-5', 'DSP-POP-STK', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-STK-STEP-6', 'DSP-POP-STK', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-04 :: Sintra Cube (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-04-STEP-1', 'DSP-SNTR-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-04-STEP-2', 'DSP-SNTR-04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-04-STEP-3', 'DSP-SNTR-04', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-04-STEP-4', 'DSP-SNTR-04', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-04-STEP-5', 'DSP-SNTR-04', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-04-STEP-6', 'DSP-SNTR-04', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-POP-DGL-01 :: Sintra Dangler (4-edged) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-POP-DGL-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-DGL-01-STEP-1', 'DSP-POP-DGL-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-DGL-01-STEP-2', 'DSP-POP-DGL-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-DGL-01-STEP-3', 'DSP-POP-DGL-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-DGL-01-STEP-4', 'DSP-POP-DGL-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-DGL-01-STEP-5', 'DSP-POP-DGL-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-DGL-01-STEP-6', 'DSP-POP-DGL-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-01 :: Sintra Standee (4-edged) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-01-STEP-1', 'DSP-SNTR-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-01-STEP-2', 'DSP-SNTR-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-01-STEP-3', 'DSP-SNTR-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-01-STEP-4', 'DSP-SNTR-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-01-STEP-5', 'DSP-SNTR-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-01-STEP-6', 'DSP-SNTR-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-02 :: Sintra Standee (A-stand) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-02-STEP-1', 'DSP-SNTR-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-02-STEP-2', 'DSP-SNTR-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-02-STEP-3', 'DSP-SNTR-02', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-02-STEP-4', 'DSP-SNTR-02', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-02-STEP-5', 'DSP-SNTR-02', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-02-STEP-6', 'DSP-SNTR-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-03 :: Sintra Standee (free form/cut to image) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-03-STEP-1', 'DSP-SNTR-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-03-STEP-2', 'DSP-SNTR-03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-03-STEP-3', 'DSP-SNTR-03', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-03-STEP-4', 'DSP-SNTR-03', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-03-STEP-5', 'DSP-SNTR-03', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-03-STEP-6', 'DSP-SNTR-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-SQ-01 :: Sintra with Stickers (4-edged) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-SQ-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-01-STEP-1', 'DSP-SNTR-SQ-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-01-STEP-2', 'DSP-SNTR-SQ-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-01-STEP-3', 'DSP-SNTR-SQ-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-01-STEP-4', 'DSP-SNTR-SQ-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-01-STEP-5', 'DSP-SNTR-SQ-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-01-STEP-6', 'DSP-SNTR-SQ-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-SQ-02 :: Sintra with Stickers (wall design with installation) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-SQ-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-02-STEP-1', 'DSP-SNTR-SQ-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-02-STEP-2', 'DSP-SNTR-SQ-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-02-STEP-3', 'DSP-SNTR-SQ-02', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-02-STEP-4', 'DSP-SNTR-SQ-02', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-02-STEP-5', 'DSP-SNTR-SQ-02', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-02-STEP-6', 'DSP-SNTR-SQ-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-SQ-03 :: Sintra with Stickers (wall design with installation and laminate) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-SQ-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-03-STEP-1', 'DSP-SNTR-SQ-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-03-STEP-2', 'DSP-SNTR-SQ-03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-03-STEP-3', 'DSP-SNTR-SQ-03', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-03-STEP-4', 'DSP-SNTR-SQ-03', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-03-STEP-5', 'DSP-SNTR-SQ-03', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-03-STEP-6', 'DSP-SNTR-SQ-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNTR-SQ-04 :: Sintra with Stickers (3D Buildup Frame) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNTR-SQ-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-04-STEP-1', 'DSP-SNTR-SQ-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-04-STEP-2', 'DSP-SNTR-SQ-04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-04-STEP-3', 'DSP-SNTR-SQ-04', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-04-STEP-4', 'DSP-SNTR-SQ-04', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-04-STEP-5', 'DSP-SNTR-SQ-04', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNTR-SQ-04-STEP-6', 'DSP-SNTR-SQ-04', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-ACRY-01 :: Acrylic Standee (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-ACRY-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-ACRY-01-STEP-1', 'DSP-ACRY-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-ACRY-01-STEP-2', 'DSP-ACRY-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-ACRY-01-STEP-3', 'DSP-ACRY-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-ACRY-01-STEP-4', 'DSP-ACRY-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-ACRY-01-STEP-5', 'DSP-ACRY-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-ACRY-01-STEP-6', 'DSP-ACRY-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-01 :: Snap Frame LED Poster (40cm x 50cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-01-STEP-1', 'DSP-SNPF-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-01-STEP-2', 'DSP-SNPF-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-01-STEP-3', 'DSP-SNPF-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-01-STEP-4', 'DSP-SNPF-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-01-STEP-5', 'DSP-SNPF-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-01-STEP-6', 'DSP-SNPF-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-02 :: Snap Frame LED Poster (40cm x 60cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-02-STEP-1', 'DSP-SNPF-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-02-STEP-2', 'DSP-SNPF-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-02-STEP-3', 'DSP-SNPF-02', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-02-STEP-4', 'DSP-SNPF-02', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-02-STEP-5', 'DSP-SNPF-02', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-02-STEP-6', 'DSP-SNPF-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-07 :: Snap Frame LED Poster (50cm x 100cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-07') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-07-STEP-1', 'DSP-SNPF-07', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-07-STEP-2', 'DSP-SNPF-07', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-07-STEP-3', 'DSP-SNPF-07', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-07-STEP-4', 'DSP-SNPF-07', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-07-STEP-5', 'DSP-SNPF-07', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-07-STEP-6', 'DSP-SNPF-07', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-03 :: Snap Frame LED Poster (50cm x 60cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-03-STEP-1', 'DSP-SNPF-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-03-STEP-2', 'DSP-SNPF-03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-03-STEP-3', 'DSP-SNPF-03', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-03-STEP-4', 'DSP-SNPF-03', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-03-STEP-5', 'DSP-SNPF-03', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-03-STEP-6', 'DSP-SNPF-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-04 :: Snap Frame LED Poster (50cm x 70cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-04-STEP-1', 'DSP-SNPF-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-04-STEP-2', 'DSP-SNPF-04', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-04-STEP-3', 'DSP-SNPF-04', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-04-STEP-4', 'DSP-SNPF-04', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-04-STEP-5', 'DSP-SNPF-04', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-04-STEP-6', 'DSP-SNPF-04', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-08 :: Snap Frame LED Poster (60cm x 100cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-08') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-08-STEP-1', 'DSP-SNPF-08', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-08-STEP-2', 'DSP-SNPF-08', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-08-STEP-3', 'DSP-SNPF-08', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-08-STEP-4', 'DSP-SNPF-08', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-08-STEP-5', 'DSP-SNPF-08', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-08-STEP-6', 'DSP-SNPF-08', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-09 :: Snap Frame LED Poster (60cm x 120cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-09') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-09-STEP-1', 'DSP-SNPF-09', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-09-STEP-2', 'DSP-SNPF-09', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-09-STEP-3', 'DSP-SNPF-09', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-09-STEP-4', 'DSP-SNPF-09', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-09-STEP-5', 'DSP-SNPF-09', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-09-STEP-6', 'DSP-SNPF-09', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-05 :: Snap Frame LED Poster (60cm x 80cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-05') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-05-STEP-1', 'DSP-SNPF-05', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-05-STEP-2', 'DSP-SNPF-05', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-05-STEP-3', 'DSP-SNPF-05', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-05-STEP-4', 'DSP-SNPF-05', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-05-STEP-5', 'DSP-SNPF-05', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-05-STEP-6', 'DSP-SNPF-05', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-SNPF-06 :: Snap Frame LED Poster (60cm x 90cm) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-SNPF-06') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-06-STEP-1', 'DSP-SNPF-06', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-06-STEP-2', 'DSP-SNPF-06', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-06-STEP-3', 'DSP-SNPF-06', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-06-STEP-4', 'DSP-SNPF-06', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-06-STEP-5', 'DSP-SNPF-06', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-SNPF-06-STEP-6', 'DSP-SNPF-06', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-POP-WBL :: Wobbler (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-POP-WBL') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-WBL-STEP-1', 'DSP-POP-WBL', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-WBL-STEP-2', 'DSP-POP-WBL', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-WBL-STEP-3', 'DSP-POP-WBL', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-WBL-STEP-4', 'DSP-POP-WBL', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-WBL-STEP-5', 'DSP-POP-WBL', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-POP-WBL-STEP-6', 'DSP-POP-WBL', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DSP-XBAN-01 :: X-Banner (Set with Print 2ft x 5ft) (displayAd)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DSP-XBAN-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-XBAN-01-STEP-1', 'DSP-XBAN-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-XBAN-01-STEP-2', 'DSP-XBAN-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-XBAN-01-STEP-3', 'DSP-XBAN-01', 'For Printing', 3, true, false, true, false, 'Print onto the specified material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-XBAN-01-STEP-4', 'DSP-XBAN-01', 'Mounting/Cutting/Assembly', 4, true, false, false, false, 'Mount onto substrate, cut to shape, or assemble stand/frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-XBAN-01-STEP-5', 'DSP-XBAN-01', 'Quality Check', 5, true, false, false, false, 'Check print quality and assembly sturdiness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DSP-XBAN-01-STEP-6', 'DSP-XBAN-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-DOC-01 :: Document Printing (Black and White) -Short/A4 (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-DOC-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-01-STEP-1', 'DPT-DOC-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-01-STEP-2', 'DPT-DOC-01', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-01-STEP-3', 'DPT-DOC-01', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-01-STEP-4', 'DPT-DOC-01', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-DOC-02 :: Document Printing (Colored) -Short/A4 (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-DOC-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-02-STEP-1', 'DPT-DOC-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-02-STEP-2', 'DPT-DOC-02', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-02-STEP-3', 'DPT-DOC-02', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-02-STEP-4', 'DPT-DOC-02', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-DOC-03 :: Document Printing (Black and White) -Long (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-DOC-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-03-STEP-1', 'DPT-DOC-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-03-STEP-2', 'DPT-DOC-03', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-03-STEP-3', 'DPT-DOC-03', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-03-STEP-4', 'DPT-DOC-03', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-DOC-04 :: Document Printing (Colored) - Long (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-DOC-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-04-STEP-1', 'DPT-DOC-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-04-STEP-2', 'DPT-DOC-04', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-04-STEP-3', 'DPT-DOC-04', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-DOC-04-STEP-4', 'DPT-DOC-04', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-PPP-01 :: Cardboard Print (Front Only) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-PPP-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-01-STEP-1', 'DPT-PPP-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-01-STEP-2', 'DPT-PPP-01', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-01-STEP-3', 'DPT-PPP-01', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-01-STEP-4', 'DPT-PPP-01', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-PPP-02 :: Cardboard Print (Back to Back) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-PPP-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-02-STEP-1', 'DPT-PPP-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-02-STEP-2', 'DPT-PPP-02', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-02-STEP-3', 'DPT-PPP-02', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-PPP-02-STEP-4', 'DPT-PPP-02', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-XRX-01 :: Xerox (Black and White) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-XRX-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-01-STEP-1', 'DPT-XRX-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-01-STEP-2', 'DPT-XRX-01', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-01-STEP-3', 'DPT-XRX-01', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-01-STEP-4', 'DPT-XRX-01', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-XRX-02 :: Xerox (Colored) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-XRX-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-02-STEP-1', 'DPT-XRX-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-02-STEP-2', 'DPT-XRX-02', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-02-STEP-3', 'DPT-XRX-02', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-02-STEP-4', 'DPT-XRX-02', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-XRX-03 :: Laminate (A4 Size) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-XRX-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-03-STEP-1', 'DPT-XRX-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-03-STEP-2', 'DPT-XRX-03', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-03-STEP-3', 'DPT-XRX-03', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-03-STEP-4', 'DPT-XRX-03', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-XRX-04 :: Laminate (Long Size) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-XRX-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-04-STEP-1', 'DPT-XRX-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-04-STEP-2', 'DPT-XRX-04', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-04-STEP-3', 'DPT-XRX-04', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-04-STEP-4', 'DPT-XRX-04', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- DPT-XRX-05 :: Laminate (Id Size 2.2X3.5) (quickPrint)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'DPT-XRX-05') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-05-STEP-1', 'DPT-XRX-05', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-05-STEP-2', 'DPT-XRX-05', 'For Printing/Reproduction', 2, true, false, true, false, 'Print, photocopy, or laminate the client-provided file/document.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-05-STEP-3', 'DPT-XRX-05', 'Quality Check', 3, true, false, false, false, 'Check output quality and completeness.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('DPT-XRX-05-STEP-4', 'DPT-XRX-05', 'Ready For Pickup/Delivery', 4, true, true, false, true, NULL);
  end if;
end $$;

-- PSVC-DC01 :: Die-Cutting Service (cuttingService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-DC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-DC01-STEP-1', 'PSVC-DC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-DC01-STEP-2', 'PSVC-DC01', 'Material Preparation', 2, true, false, false, false, 'Prepare and position the client-provided material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-DC01-STEP-3', 'PSVC-DC01', 'Cutting', 3, true, false, true, false, 'Perform the die-cut/laser-cut/miscellaneous cutting job.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-DC01-STEP-4', 'PSVC-DC01', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-DC01-STEP-5', 'PSVC-DC01', 'Ready For Pickup/Delivery', 5, true, true, false, true, NULL);
  end if;
end $$;

-- PSVC-LZ01 :: Laser Cutting Service (cuttingService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-LZ01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LZ01-STEP-1', 'PSVC-LZ01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LZ01-STEP-2', 'PSVC-LZ01', 'Material Preparation', 2, true, false, false, false, 'Prepare and position the client-provided material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LZ01-STEP-3', 'PSVC-LZ01', 'Cutting', 3, true, false, true, false, 'Perform the die-cut/laser-cut/miscellaneous cutting job.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LZ01-STEP-4', 'PSVC-LZ01', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LZ01-STEP-5', 'PSVC-LZ01', 'Ready For Pickup/Delivery', 5, true, true, false, true, NULL);
  end if;
end $$;

-- PSVC-LD04 :: Layout & Design (Logo Concept & Design) (designService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-LD04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD04-STEP-1', 'PSVC-LD04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD04-STEP-2', 'PSVC-LD04', 'For Layout/Design', 2, true, false, true, false, 'Produce the design/layout per client brief.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD04-STEP-3', 'PSVC-LD04', 'For Client Review', 3, true, false, false, false, 'Client reviews the draft.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD04-STEP-4', 'PSVC-LD04', 'Revision', 4, true, false, false, false, 'Apply requested revisions, if any.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD04-STEP-5', 'PSVC-LD04', 'Final Files Released', 5, true, true, false, true, 'Final design files delivered to the client.');
  end if;
end $$;

-- PSVC-LD02 :: Layout & Design (Menus) (designService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-LD02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD02-STEP-1', 'PSVC-LD02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD02-STEP-2', 'PSVC-LD02', 'For Layout/Design', 2, true, false, true, false, 'Produce the design/layout per client brief.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD02-STEP-3', 'PSVC-LD02', 'For Client Review', 3, true, false, false, false, 'Client reviews the draft.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD02-STEP-4', 'PSVC-LD02', 'Revision', 4, true, false, false, false, 'Apply requested revisions, if any.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD02-STEP-5', 'PSVC-LD02', 'Final Files Released', 5, true, true, false, true, 'Final design files delivered to the client.');
  end if;
end $$;

-- PSVC-LD01 :: Layout & Design (Regular Events) (designService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-LD01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD01-STEP-1', 'PSVC-LD01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD01-STEP-2', 'PSVC-LD01', 'For Layout/Design', 2, true, false, true, false, 'Produce the design/layout per client brief.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD01-STEP-3', 'PSVC-LD01', 'For Client Review', 3, true, false, false, false, 'Client reviews the draft.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD01-STEP-4', 'PSVC-LD01', 'Revision', 4, true, false, false, false, 'Apply requested revisions, if any.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD01-STEP-5', 'PSVC-LD01', 'Final Files Released', 5, true, true, false, true, 'Final design files delivered to the client.');
  end if;
end $$;

-- PSVC-LD03 :: Layout & Design (Vector Art) (designService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-LD03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD03-STEP-1', 'PSVC-LD03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD03-STEP-2', 'PSVC-LD03', 'For Layout/Design', 2, true, false, true, false, 'Produce the design/layout per client brief.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD03-STEP-3', 'PSVC-LD03', 'For Client Review', 3, true, false, false, false, 'Client reviews the draft.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD03-STEP-4', 'PSVC-LD03', 'Revision', 4, true, false, false, false, 'Apply requested revisions, if any.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-LD03-STEP-5', 'PSVC-LD03', 'Final Files Released', 5, true, true, false, true, 'Final design files delivered to the client.');
  end if;
end $$;

-- PSVC-CUT1 :: Miscellaneous Cutting (cuttingService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-CUT1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-CUT1-STEP-1', 'PSVC-CUT1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-CUT1-STEP-2', 'PSVC-CUT1', 'Material Preparation', 2, true, false, false, false, 'Prepare and position the client-provided material.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-CUT1-STEP-3', 'PSVC-CUT1', 'Cutting', 3, true, false, true, false, 'Perform the die-cut/laser-cut/miscellaneous cutting job.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-CUT1-STEP-4', 'PSVC-CUT1', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material condition.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-CUT1-STEP-5', 'PSVC-CUT1', 'Ready For Pickup/Delivery', 5, true, true, false, true, NULL);
  end if;
end $$;

-- PSVC-SC01 :: Signage Cleaning (onSiteService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-SC01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC01-STEP-1', 'PSVC-SC01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC01-STEP-2', 'PSVC-SC01', 'Scheduled for Site Visit', 2, true, false, true, false, 'Coordinate schedule with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC01-STEP-3', 'PSVC-SC01', 'Service In Progress', 3, true, false, false, false, 'On-site work (installation, dismantling, cleaning, relocation, etc.).');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC01-STEP-4', 'PSVC-SC01', 'Completed & Verified', 4, true, true, false, true, 'Client confirms the on-site work is complete.');
  end if;
end $$;

-- PSVC-SC02 :: Change SignageFlex Only (onSiteService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-SC02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC02-STEP-1', 'PSVC-SC02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC02-STEP-2', 'PSVC-SC02', 'Scheduled for Site Visit', 2, true, false, true, false, 'Coordinate schedule with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC02-STEP-3', 'PSVC-SC02', 'Service In Progress', 3, true, false, false, false, 'On-site work (installation, dismantling, cleaning, relocation, etc.).');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC02-STEP-4', 'PSVC-SC02', 'Completed & Verified', 4, true, true, false, true, 'Client confirms the on-site work is complete.');
  end if;
end $$;

-- PSVC-SC03 :: Signage Installation/Dismantling (onSiteService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-SC03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC03-STEP-1', 'PSVC-SC03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC03-STEP-2', 'PSVC-SC03', 'Scheduled for Site Visit', 2, true, false, true, false, 'Coordinate schedule with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC03-STEP-3', 'PSVC-SC03', 'Service In Progress', 3, true, false, false, false, 'On-site work (installation, dismantling, cleaning, relocation, etc.).');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC03-STEP-4', 'PSVC-SC03', 'Completed & Verified', 4, true, true, false, true, 'Client confirms the on-site work is complete.');
  end if;
end $$;

-- PSVC-SC04 :: Signage Relocation (onSiteService)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'PSVC-SC04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC04-STEP-1', 'PSVC-SC04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC04-STEP-2', 'PSVC-SC04', 'Scheduled for Site Visit', 2, true, false, true, false, 'Coordinate schedule with the client.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC04-STEP-3', 'PSVC-SC04', 'Service In Progress', 3, true, false, false, false, 'On-site work (installation, dismantling, cleaning, relocation, etc.).');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('PSVC-SC04-STEP-4', 'PSVC-SC04', 'Completed & Verified', 4, true, true, false, true, 'Client confirms the on-site work is complete.');
  end if;
end $$;

-- SGN3D-LT :: Acrylic 3D Build-up (Lighted) (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN3D-LT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-1', 'SGN3D-LT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-2', 'SGN3D-LT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-3', 'SGN3D-LT', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-4', 'SGN3D-LT', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-5', 'SGN3D-LT', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-6', 'SGN3D-LT', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN3D-LT-STEP-7', 'SGN3D-LT', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGNCHNLET-LT :: Channel Letters (Lighted) (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNCHNLET-LT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-1', 'SGNCHNLET-LT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-2', 'SGNCHNLET-LT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-3', 'SGNCHNLET-LT', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-4', 'SGNCHNLET-LT', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-5', 'SGNCHNLET-LT', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-6', 'SGNCHNLET-LT', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-LT-STEP-7', 'SGNCHNLET-LT', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGNDFLEX-LT :: Digiflex (Lighted) (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNDFLEX-LT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-1', 'SGNDFLEX-LT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-2', 'SGNDFLEX-LT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-3', 'SGNDFLEX-LT', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-4', 'SGNDFLEX-LT', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-5', 'SGNDFLEX-LT', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-6', 'SGNDFLEX-LT', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-LT-STEP-7', 'SGNDFLEX-LT', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-LIT-01 :: Light Box (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-LIT-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-1', 'SGN-LIT-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-2', 'SGN-LIT-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-3', 'SGN-LIT-01', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-4', 'SGN-LIT-01', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-5', 'SGN-LIT-01', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-6', 'SGN-LIT-01', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-LIT-01-STEP-7', 'SGN-LIT-01', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-NEON :: Neon LED Signage (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-NEON') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-1', 'SGN-NEON', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-2', 'SGN-NEON', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-3', 'SGN-NEON', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-4', 'SGN-NEON', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-5', 'SGN-NEON', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-6', 'SGN-NEON', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-NEON-STEP-7', 'SGN-NEON', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGNPFLEX-LT :: Panaflex (Lighted) (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNPFLEX-LT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-1', 'SGNPFLEX-LT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-2', 'SGNPFLEX-LT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-3', 'SGNPFLEX-LT', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-4', 'SGNPFLEX-LT', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-5', 'SGNPFLEX-LT', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-6', 'SGNPFLEX-LT', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-LT-STEP-7', 'SGNPFLEX-LT', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGNSTNLS-LT :: Stainless Letters (Lighted) (signageLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNSTNLS-LT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-1', 'SGNSTNLS-LT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-2', 'SGNSTNLS-LT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-3', 'SGNSTNLS-LT', 'Frame & Housing Fabrication', 3, true, false, true, false, 'Fabricate the frame/housing structure.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-4', 'SGNSTNLS-LT', 'Face/Panel Production', 4, true, false, false, false, 'Produce and mount the acrylic/panaflex face.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-5', 'SGNSTNLS-LT', 'LED/Electrical Installation & Wiring', 5, true, false, false, false, 'Install LED modules and wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-6', 'SGNSTNLS-LT', 'Testing & Quality Check', 6, true, false, false, false, 'Test lighting, check for even illumination and safe wiring.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-LT-STEP-7', 'SGNSTNLS-LT', 'Ready For Pickup/Delivery/Installation', 7, true, true, false, true, NULL);
  end if;
end $$;

-- SGN4D-NLT :: Acrylic 3D Build-up (Non-Lighted) (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN4D-NLT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN4D-NLT-STEP-1', 'SGN4D-NLT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN4D-NLT-STEP-2', 'SGN4D-NLT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN4D-NLT-STEP-3', 'SGN4D-NLT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN4D-NLT-STEP-4', 'SGN4D-NLT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN4D-NLT-STEP-5', 'SGN4D-NLT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN4D-NLT-STEP-6', 'SGN4D-NLT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGNCHNLET-NLT :: Channel Letters (Non-Lighted) (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNCHNLET-NLT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-NLT-STEP-1', 'SGNCHNLET-NLT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-NLT-STEP-2', 'SGNCHNLET-NLT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-NLT-STEP-3', 'SGNCHNLET-NLT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-NLT-STEP-4', 'SGNCHNLET-NLT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-NLT-STEP-5', 'SGNCHNLET-NLT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNCHNLET-NLT-STEP-6', 'SGNCHNLET-NLT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGNDFLEX-NLT :: Digiflex (Non-Lighted) with GI Frame (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNDFLEX-NLT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-NLT-STEP-1', 'SGNDFLEX-NLT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-NLT-STEP-2', 'SGNDFLEX-NLT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-NLT-STEP-3', 'SGNDFLEX-NLT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-NLT-STEP-4', 'SGNDFLEX-NLT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-NLT-STEP-5', 'SGNDFLEX-NLT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNDFLEX-NLT-STEP-6', 'SGNDFLEX-NLT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-GIFRM2 :: Double Face GI Frame Beneath GI Sheet with Sticker (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-GIFRM2') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM2-STEP-1', 'SGN-GIFRM2', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM2-STEP-2', 'SGN-GIFRM2', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM2-STEP-3', 'SGN-GIFRM2', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM2-STEP-4', 'SGN-GIFRM2', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM2-STEP-5', 'SGN-GIFRM2', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM2-STEP-6', 'SGN-GIFRM2', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-3MM :: 3mm Clear Acrylic Signs with Mirrored Sticker and a_bolt (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-3MM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-STEP-1', 'SGN-ACRF-3MM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-STEP-2', 'SGN-ACRF-3MM', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-STEP-3', 'SGN-ACRF-3MM', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-STEP-4', 'SGN-ACRF-3MM', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-STEP-5', 'SGN-ACRF-3MM', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-STEP-6', 'SGN-ACRF-3MM', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-4MM :: 4mm Clear Acrylic Signs with Mirrored Sticker and a_bolt (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-4MM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4MM-STEP-1', 'SGN-ACRF-4MM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4MM-STEP-2', 'SGN-ACRF-4MM', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4MM-STEP-3', 'SGN-ACRF-4MM', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4MM-STEP-4', 'SGN-ACRF-4MM', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4MM-STEP-5', 'SGN-ACRF-4MM', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4MM-STEP-6', 'SGN-ACRF-4MM', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-5MM :: 5mm Clear Acrylic Signs with Mirrored Sticker and a_bolt (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-5MM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-5MM-STEP-1', 'SGN-ACRF-5MM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-5MM-STEP-2', 'SGN-ACRF-5MM', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-5MM-STEP-3', 'SGN-ACRF-5MM', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-5MM-STEP-4', 'SGN-ACRF-5MM', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-5MM-STEP-5', 'SGN-ACRF-5MM', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-5MM-STEP-6', 'SGN-ACRF-5MM', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-6MM :: 6mm Clear Acrylic Signs with Mirrored Sticker and a_bolt (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-6MM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-6MM-STEP-1', 'SGN-ACRF-6MM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-6MM-STEP-2', 'SGN-ACRF-6MM', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-6MM-STEP-3', 'SGN-ACRF-6MM', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-6MM-STEP-4', 'SGN-ACRF-6MM', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-6MM-STEP-5', 'SGN-ACRF-6MM', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-6MM-STEP-6', 'SGN-ACRF-6MM', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-3MM-WYT :: 3mm Diffuser/Chalk White Cutout Letters/Logos (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-3MM-WYT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-WYT-STEP-1', 'SGN-ACRF-3MM-WYT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-WYT-STEP-2', 'SGN-ACRF-3MM-WYT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-WYT-STEP-3', 'SGN-ACRF-3MM-WYT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-WYT-STEP-4', 'SGN-ACRF-3MM-WYT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-WYT-STEP-5', 'SGN-ACRF-3MM-WYT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-WYT-STEP-6', 'SGN-ACRF-3MM-WYT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-3MM-BLK :: 3mm Black Cutout Letters/Logos (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-3MM-BLK') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-BLK-STEP-1', 'SGN-ACRF-3MM-BLK', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-BLK-STEP-2', 'SGN-ACRF-3MM-BLK', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-BLK-STEP-3', 'SGN-ACRF-3MM-BLK', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-BLK-STEP-4', 'SGN-ACRF-3MM-BLK', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-BLK-STEP-5', 'SGN-ACRF-3MM-BLK', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-BLK-STEP-6', 'SGN-ACRF-3MM-BLK', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-4PT5MM-WYT :: 4.5MM Diffuser/Chalk White Cutout Letters/Logos (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-4PT5MM-WYT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-WYT-STEP-1', 'SGN-ACRF-4PT5MM-WYT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-WYT-STEP-2', 'SGN-ACRF-4PT5MM-WYT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-WYT-STEP-3', 'SGN-ACRF-4PT5MM-WYT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-WYT-STEP-4', 'SGN-ACRF-4PT5MM-WYT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-WYT-STEP-5', 'SGN-ACRF-4PT5MM-WYT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-WYT-STEP-6', 'SGN-ACRF-4PT5MM-WYT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-4PT5MM-BLK :: 4.5MM 3mm Black Cutout Letters/Logos (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-4PT5MM-BLK') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-BLK-STEP-1', 'SGN-ACRF-4PT5MM-BLK', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-BLK-STEP-2', 'SGN-ACRF-4PT5MM-BLK', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-BLK-STEP-3', 'SGN-ACRF-4PT5MM-BLK', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-BLK-STEP-4', 'SGN-ACRF-4PT5MM-BLK', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-BLK-STEP-5', 'SGN-ACRF-4PT5MM-BLK', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-4PT5MM-BLK-STEP-6', 'SGN-ACRF-4PT5MM-BLK', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-3MM-3MM :: Sandwiched 2-pc 3mm Clear Acrylic Signs with Sticker and a_bolt (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-3MM-3MM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-3MM-STEP-1', 'SGN-ACRF-3MM-3MM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-3MM-STEP-2', 'SGN-ACRF-3MM-3MM', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-3MM-STEP-3', 'SGN-ACRF-3MM-3MM', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-3MM-STEP-4', 'SGN-ACRF-3MM-3MM', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-3MM-STEP-5', 'SGN-ACRF-3MM-3MM', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-3MM-3MM-STEP-6', 'SGN-ACRF-3MM-3MM', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-ACRF-2MM-3MM :: Sandwiched 2mm w/ 3mm Clear Acrylic Signs with Sticker and a_bolt (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-ACRF-2MM-3MM') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-2MM-3MM-STEP-1', 'SGN-ACRF-2MM-3MM', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-2MM-3MM-STEP-2', 'SGN-ACRF-2MM-3MM', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-2MM-3MM-STEP-3', 'SGN-ACRF-2MM-3MM', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-2MM-3MM-STEP-4', 'SGN-ACRF-2MM-3MM', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-2MM-3MM-STEP-5', 'SGN-ACRF-2MM-3MM', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-ACRF-2MM-3MM-STEP-6', 'SGN-ACRF-2MM-3MM', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGNPFLEX-NLT :: Panaflex (Non-Lighted) (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNPFLEX-NLT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-NLT-STEP-1', 'SGNPFLEX-NLT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-NLT-STEP-2', 'SGNPFLEX-NLT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-NLT-STEP-3', 'SGNPFLEX-NLT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-NLT-STEP-4', 'SGNPFLEX-NLT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-NLT-STEP-5', 'SGNPFLEX-NLT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNPFLEX-NLT-STEP-6', 'SGNPFLEX-NLT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-PRKSYN :: Parking Signs (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-PRKSYN') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-PRKSYN-STEP-1', 'SGN-PRKSYN', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-PRKSYN-STEP-2', 'SGN-PRKSYN', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-PRKSYN-STEP-3', 'SGN-PRKSYN', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-PRKSYN-STEP-4', 'SGN-PRKSYN', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-PRKSYN-STEP-5', 'SGN-PRKSYN', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-PRKSYN-STEP-6', 'SGN-PRKSYN', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-RDSYN :: Road Signs (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-RDSYN') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-RDSYN-STEP-1', 'SGN-RDSYN', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-RDSYN-STEP-2', 'SGN-RDSYN', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-RDSYN-STEP-3', 'SGN-RDSYN', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-RDSYN-STEP-4', 'SGN-RDSYN', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-RDSYN-STEP-5', 'SGN-RDSYN', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-RDSYN-STEP-6', 'SGN-RDSYN', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGN-GIFRM1 :: Single Face GI Frame Beneath GI Sheet with Sticker (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGN-GIFRM1') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM1-STEP-1', 'SGN-GIFRM1', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM1-STEP-2', 'SGN-GIFRM1', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM1-STEP-3', 'SGN-GIFRM1', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM1-STEP-4', 'SGN-GIFRM1', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM1-STEP-5', 'SGN-GIFRM1', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGN-GIFRM1-STEP-6', 'SGN-GIFRM1', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SGNSTNLS-NLT :: Stainless Letters (Non-Lighted) (signageNonLighted)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SGNSTNLS-NLT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-NLT-STEP-1', 'SGNSTNLS-NLT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-NLT-STEP-2', 'SGNSTNLS-NLT', 'For Layout/Design', 2, true, false, false, false, 'Prepare artwork and confirm sign dimensions.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-NLT-STEP-3', 'SGNSTNLS-NLT', 'Frame/Substrate Fabrication', 3, true, false, true, false, 'Fabricate the frame, cutout, or substrate.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-NLT-STEP-4', 'SGNSTNLS-NLT', 'Print/Sticker Application & Mounting', 4, true, false, false, false, 'Apply printed material/sticker and mount onto the frame.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-NLT-STEP-5', 'SGNSTNLS-NLT', 'Quality Check', 5, true, false, false, false, 'Check alignment, sturdiness, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SGNSTNLS-NLT-STEP-6', 'SGNSTNLS-NLT', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-HLG-02 :: Die-cut Holographic Sticker (per sqin) (stickerDieCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-HLG-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-02-STEP-1', 'STK-HLG-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-02-STEP-2', 'STK-HLG-02', 'Material Preparation', 2, true, false, false, false, 'Load and prep the plain sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-02-STEP-3', 'STK-HLG-02', 'Die-Cutting', 3, true, false, true, false, 'Cut to the specified shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-02-STEP-4', 'STK-HLG-02', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-02-STEP-5', 'STK-HLG-02', 'Ready For Pickup/Delivery/Installation', 5, true, true, false, true, NULL);
  end if;
end $$;

-- STK-RFL-DCT :: Die-cut Reflective Sticker (per sqin) (stickerDieCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-RFL-DCT') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-DCT-STEP-1', 'STK-RFL-DCT', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-DCT-STEP-2', 'STK-RFL-DCT', 'Material Preparation', 2, true, false, false, false, 'Load and prep the plain sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-DCT-STEP-3', 'STK-RFL-DCT', 'Die-Cutting', 3, true, false, true, false, 'Cut to the specified shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-DCT-STEP-4', 'STK-RFL-DCT', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-DCT-STEP-5', 'STK-RFL-DCT', 'Ready For Pickup/Delivery/Installation', 5, true, true, false, true, NULL);
  end if;
end $$;

-- STK-DCT-01 :: Die-cut Vinyl Sticker (per sqin) (stickerDieCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-DCT-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-DCT-01-STEP-1', 'STK-DCT-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-DCT-01-STEP-2', 'STK-DCT-01', 'Material Preparation', 2, true, false, false, false, 'Load and prep the plain sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-DCT-01-STEP-3', 'STK-DCT-01', 'Die-Cutting', 3, true, false, true, false, 'Cut to the specified shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-DCT-01-STEP-4', 'STK-DCT-01', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-DCT-01-STEP-5', 'STK-DCT-01', 'Ready For Pickup/Delivery/Installation', 5, true, true, false, true, NULL);
  end if;
end $$;

-- STK-HLG-01 :: Printable Holographic Sticker (Printable) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-HLG-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-01-STEP-1', 'STK-HLG-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-01-STEP-2', 'STK-HLG-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-01-STEP-3', 'STK-HLG-01', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-01-STEP-4', 'STK-HLG-01', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-01-STEP-5', 'STK-HLG-01', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-HLG-01-STEP-6', 'STK-HLG-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-RFL-PRT-01 :: Printable Reflective Sticker (Engineering Grade) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-RFL-PRT-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-PRT-01-STEP-1', 'STK-RFL-PRT-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-PRT-01-STEP-2', 'STK-RFL-PRT-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-PRT-01-STEP-3', 'STK-RFL-PRT-01', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-PRT-01-STEP-4', 'STK-RFL-PRT-01', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-PRT-01-STEP-5', 'STK-RFL-PRT-01', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-RFL-PRT-01-STEP-6', 'STK-RFL-PRT-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-VNL-CLR-01 :: Printable Vinyl Sticker (Clear) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-VNL-CLR-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-CLR-01-STEP-1', 'STK-VNL-CLR-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-CLR-01-STEP-2', 'STK-VNL-CLR-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-CLR-01-STEP-3', 'STK-VNL-CLR-01', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-CLR-01-STEP-4', 'STK-VNL-CLR-01', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-CLR-01-STEP-5', 'STK-VNL-CLR-01', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-CLR-01-STEP-6', 'STK-VNL-CLR-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-VNL-GLO-01 :: Printable Vinyl Sticker (Glossy) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-VNL-GLO-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-GLO-01-STEP-1', 'STK-VNL-GLO-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-GLO-01-STEP-2', 'STK-VNL-GLO-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-GLO-01-STEP-3', 'STK-VNL-GLO-01', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-GLO-01-STEP-4', 'STK-VNL-GLO-01', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-GLO-01-STEP-5', 'STK-VNL-GLO-01', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-GLO-01-STEP-6', 'STK-VNL-GLO-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-FRSTD-01 :: Printable Frosted Sticker (Dusted White) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-FRSTD-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-01-STEP-1', 'STK-FRSTD-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-01-STEP-2', 'STK-FRSTD-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-01-STEP-3', 'STK-FRSTD-01', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-01-STEP-4', 'STK-FRSTD-01', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-01-STEP-5', 'STK-FRSTD-01', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-01-STEP-6', 'STK-FRSTD-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-FRSTD-02 :: Printable Frosted Sticker (Glittered) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-FRSTD-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-02-STEP-1', 'STK-FRSTD-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-02-STEP-2', 'STK-FRSTD-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-02-STEP-3', 'STK-FRSTD-02', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-02-STEP-4', 'STK-FRSTD-02', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-02-STEP-5', 'STK-FRSTD-02', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-02-STEP-6', 'STK-FRSTD-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-FRSTD-03 :: Frosted Sticker Cut(Glittered/Plain) (stickerDieCut)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-FRSTD-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-03-STEP-1', 'STK-FRSTD-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-03-STEP-2', 'STK-FRSTD-03', 'Material Preparation', 2, true, false, false, false, 'Load and prep the plain sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-03-STEP-3', 'STK-FRSTD-03', 'Die-Cutting', 3, true, false, true, false, 'Cut to the specified shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-03-STEP-4', 'STK-FRSTD-03', 'Quality Check', 4, true, false, false, false, 'Check cut accuracy and material finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-FRSTD-03-STEP-5', 'STK-FRSTD-03', 'Ready For Pickup/Delivery/Installation', 5, true, true, false, true, NULL);
  end if;
end $$;

-- STK-VNL-MAT-01 :: Printable Vinyl Sticker (Matte) (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-VNL-MAT-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-MAT-01-STEP-1', 'STK-VNL-MAT-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-MAT-01-STEP-2', 'STK-VNL-MAT-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-MAT-01-STEP-3', 'STK-VNL-MAT-01', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-MAT-01-STEP-4', 'STK-VNL-MAT-01', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-MAT-01-STEP-5', 'STK-VNL-MAT-01', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-MAT-01-STEP-6', 'STK-VNL-MAT-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- STK-VNL-WRP :: Printable Sticker Car Wrap (stickerPrintable)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'STK-VNL-WRP') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-WRP-STEP-1', 'STK-VNL-WRP', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-WRP-STEP-2', 'STK-VNL-WRP', 'For Layout/Design', 2, true, false, false, false, 'Prepare print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-WRP-STEP-3', 'STK-VNL-WRP', 'For Printing', 3, true, false, true, false, 'Print onto the sticker stock.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-WRP-STEP-4', 'STK-VNL-WRP', 'Die-Cutting/Trimming', 4, true, false, false, false, 'Cut to final shape/size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-WRP-STEP-5', 'STK-VNL-WRP', 'Quality Check', 5, true, false, false, false, 'Check adhesion, color, and cut accuracy.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('STK-VNL-WRP-STEP-6', 'STK-VNL-WRP', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SIN-3MM-01 :: 3mm Sintra Board 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SIN-3MM-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SIN-3MM-01-STEP-1', 'SIN-3MM-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SIN-3MM-01-STEP-2', 'SIN-3MM-01', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SIN-3MM-01-STEP-3', 'SIN-3MM-01', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- SIN-5MM-01 :: 5mm Sintra Board 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SIN-5MM-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SIN-5MM-01-STEP-1', 'SIN-5MM-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SIN-5MM-01-STEP-2', 'SIN-5MM-01', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SIN-5MM-01-STEP-3', 'SIN-5MM-01', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-01 :: 2mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-01-STEP-1', 'ACR-3MM-CLR-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-01-STEP-2', 'ACR-3MM-CLR-01', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-01-STEP-3', 'ACR-3MM-CLR-01', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-02 :: 3mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-02-STEP-1', 'ACR-3MM-CLR-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-02-STEP-2', 'ACR-3MM-CLR-02', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-02-STEP-3', 'ACR-3MM-CLR-02', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-03 :: 4.5mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-03-STEP-1', 'ACR-3MM-CLR-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-03-STEP-2', 'ACR-3MM-CLR-03', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-03-STEP-3', 'ACR-3MM-CLR-03', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-04 :: 5mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-04') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-04-STEP-1', 'ACR-3MM-CLR-04', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-04-STEP-2', 'ACR-3MM-CLR-04', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-04-STEP-3', 'ACR-3MM-CLR-04', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-05 :: 6mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-05') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-05-STEP-1', 'ACR-3MM-CLR-05', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-05-STEP-2', 'ACR-3MM-CLR-05', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-05-STEP-3', 'ACR-3MM-CLR-05', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-06 :: 8mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-06') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-06-STEP-1', 'ACR-3MM-CLR-06', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-06-STEP-2', 'ACR-3MM-CLR-06', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-06-STEP-3', 'ACR-3MM-CLR-06', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-07 :: 10mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-07') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-07-STEP-1', 'ACR-3MM-CLR-07', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-07-STEP-2', 'ACR-3MM-CLR-07', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-07-STEP-3', 'ACR-3MM-CLR-07', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-08 :: 12mm Clear Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-08') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-08-STEP-1', 'ACR-3MM-CLR-08', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-08-STEP-2', 'ACR-3MM-CLR-08', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-08-STEP-3', 'ACR-3MM-CLR-08', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-09 :: 2mm Diffuser White Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-09') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-09-STEP-1', 'ACR-3MM-CLR-09', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-09-STEP-2', 'ACR-3MM-CLR-09', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-09-STEP-3', 'ACR-3MM-CLR-09', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-10 :: 3mm Diffuser White Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-10') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-10-STEP-1', 'ACR-3MM-CLR-10', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-10-STEP-2', 'ACR-3MM-CLR-10', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-10-STEP-3', 'ACR-3MM-CLR-10', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-11 :: 4.5mm Diffuser White Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-11') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-11-STEP-1', 'ACR-3MM-CLR-11', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-11-STEP-2', 'ACR-3MM-CLR-11', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-11-STEP-3', 'ACR-3MM-CLR-11', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-12 :: 2mm Black Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-12') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-12-STEP-1', 'ACR-3MM-CLR-12', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-12-STEP-2', 'ACR-3MM-CLR-12', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-12-STEP-3', 'ACR-3MM-CLR-12', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-13 :: 3mm Black Acrylic 4x8 (per_sheet) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-13') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-13-STEP-1', 'ACR-3MM-CLR-13', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-13-STEP-2', 'ACR-3MM-CLR-13', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-13-STEP-3', 'ACR-3MM-CLR-13', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-14 :: 3mm Sintra Board 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-14') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-14-STEP-1', 'ACR-3MM-CLR-14', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-14-STEP-2', 'ACR-3MM-CLR-14', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-14-STEP-3', 'ACR-3MM-CLR-14', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-15 :: 5mm Sintra Board 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-15') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-15-STEP-1', 'ACR-3MM-CLR-15', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-15-STEP-2', 'ACR-3MM-CLR-15', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-15-STEP-3', 'ACR-3MM-CLR-15', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-16 :: 2mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-16') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-16-STEP-1', 'ACR-3MM-CLR-16', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-16-STEP-2', 'ACR-3MM-CLR-16', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-16-STEP-3', 'ACR-3MM-CLR-16', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-17 :: 3mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-17') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-17-STEP-1', 'ACR-3MM-CLR-17', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-17-STEP-2', 'ACR-3MM-CLR-17', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-17-STEP-3', 'ACR-3MM-CLR-17', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-18 :: 4.5mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-18') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-18-STEP-1', 'ACR-3MM-CLR-18', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-18-STEP-2', 'ACR-3MM-CLR-18', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-18-STEP-3', 'ACR-3MM-CLR-18', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-19 :: 5mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-19') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-19-STEP-1', 'ACR-3MM-CLR-19', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-19-STEP-2', 'ACR-3MM-CLR-19', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-19-STEP-3', 'ACR-3MM-CLR-19', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-20 :: 6mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-20') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-20-STEP-1', 'ACR-3MM-CLR-20', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-20-STEP-2', 'ACR-3MM-CLR-20', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-20-STEP-3', 'ACR-3MM-CLR-20', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-21 :: 8mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-21') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-21-STEP-1', 'ACR-3MM-CLR-21', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-21-STEP-2', 'ACR-3MM-CLR-21', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-21-STEP-3', 'ACR-3MM-CLR-21', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-22 :: 10mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-22') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-22-STEP-1', 'ACR-3MM-CLR-22', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-22-STEP-2', 'ACR-3MM-CLR-22', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-22-STEP-3', 'ACR-3MM-CLR-22', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-23 :: 12mm Clear Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-23') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-23-STEP-1', 'ACR-3MM-CLR-23', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-23-STEP-2', 'ACR-3MM-CLR-23', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-23-STEP-3', 'ACR-3MM-CLR-23', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-24 :: 2mm Diffuser White Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-24') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-24-STEP-1', 'ACR-3MM-CLR-24', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-24-STEP-2', 'ACR-3MM-CLR-24', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-24-STEP-3', 'ACR-3MM-CLR-24', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-25 :: 3mm Diffuser White Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-25') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-25-STEP-1', 'ACR-3MM-CLR-25', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-25-STEP-2', 'ACR-3MM-CLR-25', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-25-STEP-3', 'ACR-3MM-CLR-25', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-26 :: 4.5mm Diffuser White Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-26') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-26-STEP-1', 'ACR-3MM-CLR-26', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-26-STEP-2', 'ACR-3MM-CLR-26', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-26-STEP-3', 'ACR-3MM-CLR-26', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-27 :: 2mm Black Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-27') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-27-STEP-1', 'ACR-3MM-CLR-27', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-27-STEP-2', 'ACR-3MM-CLR-27', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-27-STEP-3', 'ACR-3MM-CLR-27', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-28 :: 3mm Black Acrylic 4x8 (per_sqft) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-28') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-28-STEP-1', 'ACR-3MM-CLR-28', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-28-STEP-2', 'ACR-3MM-CLR-28', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-28-STEP-3', 'ACR-3MM-CLR-28', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-29 :: Advertising Bolt (8mm) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-29') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-29-STEP-1', 'ACR-3MM-CLR-29', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-29-STEP-2', 'ACR-3MM-CLR-29', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-29-STEP-3', 'ACR-3MM-CLR-29', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-30 :: Advertising Bolt (12mm) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-30') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-30-STEP-1', 'ACR-3MM-CLR-30', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-30-STEP-2', 'ACR-3MM-CLR-30', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-30-STEP-3', 'ACR-3MM-CLR-30', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-31 :: Plain Tarp (12oz) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-31') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-31-STEP-1', 'ACR-3MM-CLR-31', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-31-STEP-2', 'ACR-3MM-CLR-31', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-31-STEP-3', 'ACR-3MM-CLR-31', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-32 :: Plain Flex (19oz) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-32') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-32-STEP-1', 'ACR-3MM-CLR-32', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-32-STEP-2', 'ACR-3MM-CLR-32', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-32-STEP-3', 'ACR-3MM-CLR-32', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-33 :: Plain Blackout (15oz) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-33') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-33-STEP-1', 'ACR-3MM-CLR-33', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-33-STEP-2', 'ACR-3MM-CLR-33', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-33-STEP-3', 'ACR-3MM-CLR-33', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-34 :: Plain Stickers (glossy) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-34') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-34-STEP-1', 'ACR-3MM-CLR-34', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-34-STEP-2', 'ACR-3MM-CLR-34', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-34-STEP-3', 'ACR-3MM-CLR-34', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-35 :: Plain Stickers (matte) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-35') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-35-STEP-1', 'ACR-3MM-CLR-35', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-35-STEP-2', 'ACR-3MM-CLR-35', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-35-STEP-3', 'ACR-3MM-CLR-35', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- ACR-3MM-CLR-36 :: Plain Stickers (clear) (rawMaterial)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'ACR-3MM-CLR-36') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-36-STEP-1', 'ACR-3MM-CLR-36', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-36-STEP-2', 'ACR-3MM-CLR-36', 'Material Preparation', 2, true, false, true, false, 'Cut/prepare the material to the ordered size.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('ACR-3MM-CLR-36-STEP-3', 'ACR-3MM-CLR-36', 'Ready For Pickup/Delivery', 3, true, true, false, true, NULL);
  end if;
end $$;

-- SUB-FUL-01 :: Sublimation Print with Cloth (sublimation)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SUB-FUL-01') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-01-STEP-1', 'SUB-FUL-01', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-01-STEP-2', 'SUB-FUL-01', 'For Layout/Design', 2, true, false, false, false, 'Prepare the sublimation print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-01-STEP-3', 'SUB-FUL-01', 'Sublimation Printing', 3, true, false, true, false, 'Print the design onto sublimation transfer paper.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-01-STEP-4', 'SUB-FUL-01', 'Heat Press & Curing', 4, true, false, false, false, 'Heat press the transfer onto the item.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-01-STEP-5', 'SUB-FUL-01', 'Quality Check', 5, true, false, false, false, 'Check color transfer, alignment, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-01-STEP-6', 'SUB-FUL-01', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SUB-FUL-02 :: Sublimation Tshirt (sublimation)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SUB-FUL-02') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-02-STEP-1', 'SUB-FUL-02', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-02-STEP-2', 'SUB-FUL-02', 'For Layout/Design', 2, true, false, false, false, 'Prepare the sublimation print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-02-STEP-3', 'SUB-FUL-02', 'Sublimation Printing', 3, true, false, true, false, 'Print the design onto sublimation transfer paper.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-02-STEP-4', 'SUB-FUL-02', 'Heat Press & Curing', 4, true, false, false, false, 'Heat press the transfer onto the item.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-02-STEP-5', 'SUB-FUL-02', 'Quality Check', 5, true, false, false, false, 'Check color transfer, alignment, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-02-STEP-6', 'SUB-FUL-02', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

-- SUB-FUL-03 :: Sublimation Polo shirt (sublimation)
do $$
begin
  if not exists (select 1 from subcategory_sop where subcategory_id = 'SUB-FUL-03') then
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-03-STEP-1', 'SUB-FUL-03', 'Received', 1, true, false, false, true, NULL);
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-03-STEP-2', 'SUB-FUL-03', 'For Layout/Design', 2, true, false, false, false, 'Prepare the sublimation print-ready artwork.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-03-STEP-3', 'SUB-FUL-03', 'Sublimation Printing', 3, true, false, true, false, 'Print the design onto sublimation transfer paper.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-03-STEP-4', 'SUB-FUL-03', 'Heat Press & Curing', 4, true, false, false, false, 'Heat press the transfer onto the item.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-03-STEP-5', 'SUB-FUL-03', 'Quality Check', 5, true, false, false, false, 'Check color transfer, alignment, and finish.');
    insert into subcategory_sop (sop_id, subcategory_id, status_name, sequence, is_active, is_terminal, is_production_start, visible_to_client, description) values ('SUB-FUL-03-STEP-6', 'SUB-FUL-03', 'Ready For Pickup/Delivery/Installation', 6, true, true, false, true, NULL);
  end if;
end $$;

