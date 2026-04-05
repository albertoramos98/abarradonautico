// Menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
    
    // Filter buttons functionality (for products and gallery pages)
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Here you would add filtering logic based on data attributes
            // For now, it's just visual feedback
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add active class to current page in navigation
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    const currentPage = currentLocation.split('/').pop();
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.style.color = '#f5f5f5';
            link.style.fontWeight = 'bold';
        }
    });
});

// Image placeholder functionality
document.addEventListener('DOMContentLoaded', function() {
    const placeholderImages = document.querySelectorAll('img[src="images/placeholder.jpg"]');
    
    // Generate random colors for placeholders
    placeholderImages.forEach(img => {
        // Create canvas for placeholder
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set dimensions
        canvas.width = img.width || 300;
        canvas.height = img.height || 250;
        
        // Generate random color (red variations for Náutico theme)
        const r = Math.floor(Math.random() * 100) + 155; // Higher red values
        const g = Math.floor(Math.random() * 50); // Lower green
        const b = Math.floor(Math.random() * 50); // Lower blue
        
        // Fill background
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text or pattern
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Ultras Liberi", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Get alt text or default
        const text = img.alt || 'Centenários';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Replace image source with canvas data URL
        img.src = canvas.toDataURL();
    });
});
