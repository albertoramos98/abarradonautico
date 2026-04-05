 (function() {
         // Ajustado: Adicionado o "n" em "cmmzqprrrqdopypsecyizn"
         const URL = 'https://cmmzqprrrqdopypsecyizn.supabase.co';
         const KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbXpxcHJycWRvcHlwc2V5Y2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTkzMzEsImV4cCI6MjA5MDk3NTMzMX0.Thm9qThTd0hZWzNIwW9REZLEZ9-A39Fbr_JFb-HpX48';
      
    
         if (typeof supabase !== 'undefined') {
             // Criamos o cliente e atribuímos ao objeto global que o Admin usa
             window.supabaseClient = supabase.createClient(URL, KEY);
             console.log("Supabase inicializado corretamente com a URL corrigida!");
         } else {
             console.error("Erro: Biblioteca Supabase não encontrada.");
         }
    })();