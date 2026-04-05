
     (function() {
         const URL = 'https://cmmzqprrrqdopypsecyiz.supabase.co';
         const KEY =
     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbXpxcHJycWRvcHlwc2V5Y2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTkzMzEsImV4cCI6MjA5MDk3NTMzMX0.Thm9qThTd0hZWzNIwW9REZLEZ9-A39Fbr_JFb-HpX48';
      
    
         if (typeof supabase !== 'undefined') {
             window.supabaseClient = supabase.createClient(URL, KEY);
             console.log("Supabase inicializado com sucesso!");
         } else {
            console.error("Erro: Biblioteca Supabase não carregada no HTML.");
        }
    })();