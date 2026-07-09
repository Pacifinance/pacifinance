-- ============================================================
-- Migrazione: rimuove tags.translations (ora gestite via i18n frontend)
-- Da lanciare UNA TANTUM sul DB Supabase già inizializzato con schema.sql
-- ============================================================

alter table public.tags drop column if exists translations;
