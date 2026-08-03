-- Account recovery without email: accounts are anonymous (password-only
-- sign-up, random public ID), so there was previously no way to recover a
-- lost account at all. This adds storage for a separate, high-entropy
-- "recovery code" secret (NOT the password) that can be used to reset the
-- password without knowing the old one — conceptually a 2FA-style backup
-- code / crypto-wallet seed phrase, not a weaker copy of the password.
--
-- Only a hash is ever stored here — never the plaintext code in either of
-- its two representations (block code / word phrase). See
-- server/src/db/recoveryCode.ts for generation/hashing and
-- server/src/routes/public/public.ts's /recovery/reset-password for
-- verification.
--
-- Both columns are nullable: existing accounts simply have no recovery code
-- configured until the user generates one from Settings. The code is
-- invalidated (set back to null) immediately after a successful recovery,
-- so a leaked-during-use code doesn't stay valid indefinitely.

alter table public.profiles
  add column recovery_code_hash text,
  add column recovery_code_generated_at timestamptz;
