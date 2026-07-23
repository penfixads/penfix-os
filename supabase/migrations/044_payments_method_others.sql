-- "Add Payment" (Edit Job Order / New Job Order) now offers an "Others" method with a free-text
-- label for payment types we don't have a dedicated option for (e.g. a different e-wallet, a
-- trade/barter, a company account). The fixed whitelist on payments.payment_method can't hold
-- arbitrary staff-typed text, so drop it — recorded_by/remarks on this table were never
-- constrained either, this brings payment_method in line with that.
alter table payments drop constraint if exists payments_payment_method_check;
