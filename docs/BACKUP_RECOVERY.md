# Backup and recovery runbook

Pacifinance separates user-controlled export from operator database backup.

## User export

Use the in-app export to obtain a portable copy of transactions, balances, investments and goals. Store it encrypted and test importing a redacted copy periodically.

## Hosted Supabase backup

1. Enable daily Point-in-Time Recovery or scheduled database backups in Supabase.
2. Retain at least 30 days and encrypt exports at rest.
3. Restrict backup access to operators; never put dumps in Git or issue attachments.
4. Record the backup timestamp and schema/migration version.

## Restore drill

Restore into an isolated project, apply migrations, verify RLS, run `npm run test:server`, and test login, export and transaction read/write flows with synthetic data. Do not restore production data into development.
