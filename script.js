// Product data - will be loaded from JSON file
let products = [];
let storeInfo = {};

// Load products from JSON file
async function loadProductsFromJSON() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        products = data.products;
        storeInfo = data.storeInfo;
        loadProducts();
        updateStoreInfo();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data if JSON loading fails
        products = [
            {
                id: 1,
                name: "باقة الورد الأحمر",
                description: "باقة جميلة من الورد الأحمر الصناعي، مثالية للهدايا والمناسبات الخاصة",
                price: "150 ريال",
                image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400&h=300&fit=crop"
            },
            {
                id: 2,
                name: "باقة الورد الأبيض",
                description: "باقة أنيقة من الورد الأبيض الصناعي، ترمز للنقاء والجمال",
                price: "180 ريال",
                image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=400&h=300&fit=crop"
            }
        ];
        loadProducts();
    }
}

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const closeModal = document.querySelector('.close');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Load products
function loadProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach((product, idx) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.setProperty('--fade-delay', (idx * 0.12) + 's');

        // Badge (جديد أو خصم)
        let badge = '';
        if (product.isNew) {
            badge = '<span class="product-badge">جديد</span>';
        } else if (product.discount) {
            badge = `<span class="product-badge">خصم ${product.discount}%</span>`;
        }

        // صورة البطاقة: أول صورة من images أو image
        const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;

        // Add stock status
        const stockStatus = product.inStock ? 
            '<span class="stock-status in-stock">متوفر</span>' : 
            '<span class="stock-status out-of-stock">غير متوفر</span>';
        
        // Add rating if available
        const ratingHTML = product.rating ? `
            <div class="product-rating">
                <span class="stars">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span class="rating-text">${product.rating} (${product.reviews || 0} تقييم)</span>
            </div>
        ` : '';

        // Overlay with buttons
        const overlay = `
            <div class="product-overlay">
                <button class="buy-button" onclick="openModal(${product.id})">عرض التفاصيل</button>
                <button class="whatsapp-button" onclick="orderOnWhatsApp(${product.id})">
                    <i class='fab fa-whatsapp'></i> طلب عبر واتساب
                </button>
            </div>
        `;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${mainImage}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\"display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:3rem;\\"'>🖼️</div>'">
                ${badge}
                ${stockStatus}
                ${overlay}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                ${ratingHTML}
                <div class="product-price">
                    <span class="current-price">${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Update store information
function updateStoreInfo() {
    if (storeInfo) {
        // Update contact information
        const phoneElement = document.querySelector('.contact-item:nth-child(1) p');
        const emailElement = document.querySelector('.contact-item:nth-child(2) p');
        
        if (phoneElement) phoneElement.textContent = storeInfo.phone;
        if (emailElement) emailElement.textContent = storeInfo.email;
        
        // Update footer
        const footerName = document.querySelector('.footer-section h3');
        const footerDesc = document.querySelector('.footer-section p');
        if (footerName) footerName.textContent = storeInfo.name;
        if (footerDesc) footerDesc.textContent = storeInfo.description;
        // لا تعرض أو تحدث ساعات العمل إطلاقًا
    }
}

// --- دعم عرض عدة صور في نافذة التفاصيل (سلايدر) ---
let currentModalImages = [];
let currentModalImageIndex = 0;

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // دعم الصور المتعددة
        currentModalImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
        currentModalImageIndex = 0;
        updateModalImage();
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description;
        modalPrice.textContent = product.price;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // إظهار أو إخفاء الأسهم
        updateModalArrows();
    }
}

function updateModalImage() {
    // حركة Fade عند تغيير الصورة
    modalImage.classList.add('fade-out');
    setTimeout(() => {
        modalImage.src = currentModalImages[currentModalImageIndex];
        modalImage.alt = modalTitle.textContent + ' - صورة ' + (currentModalImageIndex + 1);
        modalImage.classList.remove('fade-out');
    }, 200);
}

function updateModalArrows() {
    const leftArrow = document.querySelector('.modal-arrow-left');
    const rightArrow = document.querySelector('.modal-arrow-right');
    if (currentModalImages.length > 1) {
        leftArrow.style.display = currentModalImageIndex > 0 ? 'block' : 'none';
        rightArrow.style.display = currentModalImageIndex < currentModalImages.length - 1 ? 'block' : 'none';
    } else {
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
    }
}

// تحكم الأسهم
const leftArrow = document.querySelector('.modal-arrow-left');
const rightArrow = document.querySelector('.modal-arrow-right');
if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', function(e) {
        if (currentModalImageIndex > 0) {
            currentModalImageIndex--;
            updateModalImage();
            updateModalArrows();
        }
    });
    rightArrow.addEventListener('click', function(e) {
        if (currentModalImageIndex < currentModalImages.length - 1) {
            currentModalImageIndex++;
            updateModalImage();
            updateModalArrows();
        }
    });
}

// Close modal
function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Mobile navigation toggle
function toggleNav() {
    navMenu.classList.toggle('active');
}

// Smooth scrolling for navigation links
function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        navMenu.classList.remove('active');
    }
}

// Form submission
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'جاري الإرسال...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
        e.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Order on WhatsApp functionality
function orderOnWhatsApp(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const phoneNumber = storeInfo.whatsapp || '966501234567';
        const message = `مرحباً، أريد طلب المنتج التالي:
        
اسم المنتج: ${product.name}
السعر: ${product.price}
الوصف: ${product.description}

هل يمكنني الحصول على مزيد من المعلومات؟`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Order on WhatsApp from modal
function orderOnWhatsAppFromModal() {
    const productName = document.getElementById('modalTitle').textContent;
    const productPrice = document.getElementById('modalPrice').textContent;
    const productDescription = document.getElementById('modalDescription').textContent;
    
    const phoneNumber = storeInfo.whatsapp || '966501234567';
    const message = `مرحباً، أريد طلب المنتج التالي:
        
اسم المنتج: ${productName}
السعر: ${productPrice}
الوصف: ${productDescription}

هل يمكنني الحصول على مزيد من المعلومات؟`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    closeModalFunc();
}

// View details functionality
function viewDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Show product details
        const detailsBtn = document.querySelector('.buy-btn');
        const originalText = detailsBtn.textContent;
        detailsBtn.textContent = 'تم العرض!';
        detailsBtn.style.background = '#2ecc71';
        
        setTimeout(() => {
            detailsBtn.textContent = originalText;
            detailsBtn.style.background = '';
        }, 2000);
        
        closeModalFunc();
    }
}

// Intersection Observer for animations
function createIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ====== Bubbles Background Animation ======
function createBubbles() {
    const bubblesContainer = document.querySelector('.background-bubbles');
    if (!bubblesContainer) return;
    const colors = [
        'linear-gradient(135deg, #2ecc71 60%, #27ae60 100%)',
        'linear-gradient(135deg, #f1c40f 60%, #27ae60 100%)',
        'linear-gradient(135deg, #27ae60 60%, #16a085 100%)'
    ];
    for (let i = 0; i < 18; i++) {
        const bubble = document.createElement('span');
        const size = Math.random() * 60 + 30; // 30px - 90px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = `-${size + Math.random() * 40}px`;
        bubble.style.animationDelay = `${Math.random() * 12}s`;
        bubble.style.animationDuration = `${12 + Math.random() * 10}s`;
        bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
        bubblesContainer.appendChild(bubble);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load products from JSON file
    loadProductsFromJSON();
    
    // Create intersection observer
    createIntersectionObserver();
    
    // Event listeners
    closeModal.addEventListener('click', closeModalFunc);
    navToggle.addEventListener('click', toggleNav);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Add to cart button
    const buyBtn = document.querySelector('.buy-btn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            const productId = parseInt(modal.dataset.productId);
            addToCart(productId);
        });
    }
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(102, 126, 234, 0.95)';
        } else {
            header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    });
    
    // Product card hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.product-card')) {
            const card = e.target.closest('.product-card');
            card.style.transform = 'translateY(-5px)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.product-card')) {
            const card = e.target.closest('.product-card');
            card.style.transform = 'translateY(0)';
        }
    });

    // Call bubbles creation after DOM loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBubbles);
    } else {
        createBubbles();
    }
});

// نموذج الطلب المخصص عبر واتساب
// (يجب أن يكون بعد DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
  const customOrderForm = document.getElementById('customOrderForm');
  if (customOrderForm) {
    customOrderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const color = customOrderForm.color.value;
      const size = customOrderForm.size.value;
      const notes = customOrderForm.notes.value;
      const phoneNumber = '20101415264'; // رقم الواتساب بدون +
      let message = `مرحباً، أود عمل بوكيه مخصص:\n\n`;
      message += `لون البوكيه: ${color}\n`;
      message += `الحجم: ${size}\n`;
      if (notes.trim()) message += `ملاحظات: ${notes}\n`;
      message += `\nيرجى التواصل معي لتأكيد الطلب.`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add some interactive features
function addInteractiveFeatures() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect when page loads
        setTimeout(typeWriter, 1000);
    }
}

// Call interactive features
addInteractiveFeatures(); 

// (تم حذف كود typewriter/animated-gradient من العنوان)