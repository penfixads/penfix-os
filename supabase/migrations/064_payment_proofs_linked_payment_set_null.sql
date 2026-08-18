-- Editing a job order can remove a recorded payment (EditJOModal's handleSave deletes rows
-- in removedPaymentIds via `delete from payments where payment_id = ...`). If that payment
-- had a proof screenshot attached, payment_proofs.linked_payment_id still points at it, and
-- the FK (added with no ON DELETE behavior, i.e. NO ACTION) blocks the delete outright:
--   update or delete on table "payments" violates foreign key constraint
--   "payment_proofs_linked_payment_id_fkey" on table "payment_proofs"
--
-- The proof screenshot itself (and its row in the Payment Proofs gallery) should survive a
-- payment being removed/corrected -- it's kept for the audit trail -- it just shouldn't keep
-- blocking the delete. So: ON DELETE SET NULL instead of the implicit NO ACTION. The gallery
-- already renders linked_payment_id as optional (PaymentProofsClient only shows the "Payment:
-- <id>" line when it's set), so a null here is already a handled state, not a new one.
--
-- Idempotent: safe to re-run.

begin;

alter table payment_proofs
  drop constraint if exists payment_proofs_linked_payment_id_fkey;

alter table payment_proofs
  add constraint payment_proofs_linked_payment_id_fkey
  foreign key (linked_payment_id) references payments(payment_id) on delete set null;

commit;
