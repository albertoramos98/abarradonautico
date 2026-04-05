 // js/supabase-config.js
    
     // 1. Verifique se a URL abaixo começa com https://
     // Se não, pegue a correta no Supabase em Settings -> API -> Project URL
     const S_URL = 'sb_publishable_LyMrellyhNlFpSOTBeMUOA_SSwVrdZo'; 
     const S_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb
      XpxcHJycWRvcHlwc2V5Y2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTkzMzEsImV4cCI6
      MjA5MDk3NTMzMX0.Thm9qThTd0hZWzNIwW9REZLEZ9-A39Fbr_JFb-HpX48';
    
     // 2. Criamos o cliente com um nome diferente para não dar erro
     const supabaseClientInstance = supabase.createClient(S_URL, S_KEY);
   
    // 3. Exportamos para o window para o Admin conseguir ler
    window.supabaseClient = supabaseClientInstance;