/* ============================================================================
   SOUNDBIRTH — configuração de ligação ao Supabase
   ============================================================================
   1. Supabase → o seu projeto → Project Settings → API
   2. Copie o "Project URL" e a "anon public key" para os dois campos abaixo.
   3. NUNCA coloque aqui a "service_role key".

   A anon key é pública por natureza: está em qualquer site que use Supabase
   e pode ir para o GitHub. Quem protege os dados são as regras de acesso
   (RLS) de database/01_schema.sql, não o segredo desta chave.
   ========================================================================= */

window.CREIC_CONFIG = {
  SUPABASE_URL: "https://iqlfavyfciokdzcxmqmv.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbGZhdnlmY2lva2R6Y3htcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDY3MjUsImV4cCI6MjEwNDgyMjcyNX0.OI_EIDQsELu6-1bCUiHWHf_Doprh_Pe8Xo1YIQr1kw0"
};
