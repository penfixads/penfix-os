-- payment_proofs.payment_method only allowed G-Cash/Maya/Bank Transfer at launch (040) — Maya
-- was already wired end-to-end on the client tracking page but never on staff's Edit Job Order
-- modal, and Cheque wasn't allowed anywhere. Both now submit proof photos through both paths.
alter table payment_proofs drop constraint if exists payment_proofs_payment_method_check;
alter table payment_proofs add constraint payment_proofs_payment_method_check check (payment_method in (
  'G-Cash','Maya','Bank Transfer via BPI Acct.','Bank Transfer via BDO Acct.','Cheque'
));
