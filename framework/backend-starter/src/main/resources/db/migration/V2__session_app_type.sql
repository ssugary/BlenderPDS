-- P1.10: a room now declares which application owns it, so the framework can host more
-- than one domain and the WebSocket layer can pick handlers/policies per app type.
-- Every room that existed before the framework is 'design': the editor was the only
-- application until now.
ALTER TABLE public.sessions
    ADD COLUMN app_type character varying(32) NOT NULL DEFAULT 'design';
