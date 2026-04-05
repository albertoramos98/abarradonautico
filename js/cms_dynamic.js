// Fetch and update site content from Supabase
document.addEventListener('DOMContentLoaded', async function() {
    async function fetchCMS() {
        const { data, error } = await window.supabaseClient
            .from('site_content')
            .select('*');

        if (error) {
            console.error('Error fetching CMS:', error);
            return;
        }

        applyCMS(data);
    }

    function applyCMS(content) {
        content.forEach(item => {
            const elements = document.querySelectorAll(`[data-cms="${item.key}"]`);
            elements.forEach(el => {
                if (el.tagName === 'IMG') {
                    el.src = item.value;
                } else {
                    el.innerHTML = item.value;
                }
            });
        });
    }

    fetchCMS();
});
