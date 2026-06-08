
import { API } from './js/api.js';
import { Cart } from './js/cart.js';
import { Catalog } from './js/catalog.js';
import { Formatters } from './js/formatters.js';
import { UI } from './js/ui.js';
import { Validators } from './js/validators.js';


let cart;
let catalog;
let currentCheckoutStep = 1;
let currentProductModalId = null; 
let appliedCoupon = null;
const SHIPPING_COST = 15.0;
const COUPON_DISCOUNTS = {
  M10_PERCENT: 0.1,
  M30: 30.0
};


document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});


function initializeApp() {
  
  cart = new Cart();
  catalog = new Catalog();

  
  setupCartDisplay();
  setupHeaderActions();
  setupProductModal();
  setupCheckoutForm();
  setupFormatters();
  setupCarousels();
  setupSmoothScroll();

  
  catalog.initialize();
  setupSearch();

  
  updateAuthState();

  
  loadReviews();
}


function setupCartDisplay() {
  updateCartDisplay();

  
  document.addEventListener('click', (e) => {
    
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      e.preventDefault();
      handleAddToCart(addBtn);
      return;
    }

    
    const minusBtn = e.target.closest('.minus-btn');
    if (minusBtn) {
      const id = parseInt(minusBtn.getAttribute('data-id'));
      const item = cart.items.find(item => item.id === id);
      if (item) {
        cart.updateQuantity(id, item.quantity - 1);
        updateCartDisplay();
      }
      return;
    }

    
    const plusBtn = e.target.closest('.plus-btn');
    if (plusBtn) {
      const id = parseInt(plusBtn.getAttribute('data-id'));
      const item = cart.items.find(item => item.id === id);
      if (item) {
        cart.updateQuantity(id, item.quantity + 1);
        updateCartDisplay();
      }
      return;
    }

    
    const removeBtn = e.target.closest('.remove-item');
    if (removeBtn) {
      const id = parseInt(removeBtn.getAttribute('data-id'));
      cart.removeItem(id);
      updateCartDisplay();
      return;
    }

    
    const cardEl = e.target.closest('.manga-card');
    if (cardEl) {
      const id = cardEl.getAttribute('data-id');
      handleCardClick(id);
    }
  });

  
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => UI.toggleCart());
  }

  
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => UI.toggleCart());
  }
}


async function handleAddToCart(button) {
  const id = parseInt(button.getAttribute('data-id'));
  const nome = button.getAttribute('data-nome');
  const preco = parseFloat(button.getAttribute('data-preco'));
  const imagem = button.getAttribute('data-imagem');

  
  if (!id || isNaN(id)) {
    UI.showNotification('Erro: ID do produto inválido.', 'error');
    return;
  }

  if (!nome || nome.trim() === '') {
    UI.showNotification('Erro: Nome do produto não encontrado.', 'error');
    return;
  }

  if (!preco || isNaN(preco) || preco <= 0) {
    UI.showNotification('Erro: Preço do produto inválido.', 'error');
    return;
  }

  if (!imagem || imagem.trim() === '') {
    UI.showNotification('Erro: Imagem do produto não encontrada.', 'error');
    return;
  }

  
  const addedItem = cart.addItem(id, nome, preco, imagem);

  if (!addedItem) {
    UI.showNotification('Erro ao adicionar item. Dados incompletos.', 'error');
    return;
  }

  
  try {
    console.log('Enviando para /adicionar:', { nome, preco }); 
    const response = await API.addToCart(nome, preco);
    console.log('Resposta /adicionar:', response); 
    if (response.status !== 'ok') {
      
      cart.removeItem(id);
      updateCartDisplay();
      UI.showNotification(`Erro ao adicionar: ${response.msg}`, 'error');
      return;
    }
  } catch (error) {
    console.error('Erro ao confirmar no backend:', error);
    UI.showNotification('Erro ao comunicar com servidor.', 'error');
  }

  
  updateCartDisplay();
  UI.showAddToCartAnimation(id);
  UI.showNotification(`${nome} adicionado ao carrinho!`, 'success');
}


function handleCardClick(id) {
  const product = catalog.getItem(id);
  if (product) {
    currentProductModalId = product.mal_id; 
    UI.openProductModal(product);
  }
}


function updateCartDisplay() {
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const cartCount = document.querySelector('.cart-count');

  if (!itemsEl || !totalEl || !checkoutBtn) return;

  
  if (cartCount) {
    cartCount.textContent = cart.getTotalItems();
  }

  
  totalEl.textContent = Formatters.formatPrice(cart.getSubtotal());

  
  if (cart.isEmpty()) {
    itemsEl.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Seu carrinho está vazio</p>
      </div>
    `;
    checkoutBtn.disabled = true;
  } else {
    itemsEl.innerHTML = cart.items
      .filter(item => item && item.id && item.title) 
      .map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.title}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">R$ ${Formatters.formatPrice(item.price)}</div>
            <div class="cart-item-controls">
              <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
              <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `)
      .join('');
    checkoutBtn.disabled = false;
  }
}


function setupHeaderActions() {
  
  const closeCartBtn = document.querySelector('.close-cart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => UI.toggleCart());
  }

  
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!cart.isEmpty()) {
        openCheckout();
      }
    });
  }
}


function setupProductModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      UI.closeProductModal();
    }
  });

  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      UI.closeProductModal();
    }
  });

  
  const addBtn = document.getElementById('productModalAddToCart');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      
      if (!currentProductModalId) {
        UI.showNotification('Erro ao adicionar item. Tente novamente.', 'error');
        return;
      }

      const product = catalog.getItem(String(currentProductModalId));
      if (product) {
        const price = Formatters.makePriceFromScore(product.score);
        const addedItem = cart.addItem(currentProductModalId, product.title, price, product.image_url);
        
        if (addedItem) {
          updateCartDisplay();
          UI.closeProductModal();
          UI.showNotification(`${product.title} adicionado ao carrinho!`, 'success');
        } else {
          UI.showNotification('Erro ao adicionar item. Dados inválidos.', 'error');
        }
      } else {
        UI.showNotification('Erro ao adicionar item. Produto não encontrado.', 'error');
      }
    });
  }
}


function setupCheckoutForm() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;

  const closeBtn = document.querySelector('.close-checkout');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCheckout);
  }

  
  const nextBtn = document.getElementById('nextStepBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextStep);
  }
  
  const nextBtn2 = document.getElementById('nextStepBtn2');
  if (nextBtn2) {
    nextBtn2.addEventListener('click', nextStep);
  }
  
  const prevBtn = document.getElementById('prevStepBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', prevStep);
  }
  
  const prevBtn2 = document.getElementById('prevStepBtn2');
  if (prevBtn2) {
    prevBtn2.addEventListener('click', prevStep);
  }
  
  const completeBtn = document.getElementById('completeOrderBtn');
  if (completeBtn) {
    completeBtn.addEventListener('click', completeOrder);
  }

  const paymentInputs = document.querySelectorAll('input[name="payment"]');
  paymentInputs.forEach(input => {
    input.addEventListener('change', updatePaymentMethodDisplay);
  });
  updatePaymentMethodDisplay();

  const couponInput = document.getElementById('couponCode');
  const couponBtn = document.getElementById('applyCouponBtn');
  if (couponInput) {
    couponInput.addEventListener('input', () => {
      couponInput.value = couponInput.value.toUpperCase();
    });
    couponInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyCoupon();
      }
    });
  }
  if (couponBtn) {
    couponBtn.addEventListener('click', applyCoupon);
  }

  
  const cepBtn = document.getElementById('cepLookupBtn');
  if (cepBtn) {
    cepBtn.addEventListener('click', handleCEPLookup);
  }
}


function openCheckout() {
  if (cart.isEmpty()) return;
  currentCheckoutStep = 1;
  appliedCoupon = null;
  const couponInput = document.getElementById('couponCode');
  if (couponInput) couponInput.value = '';
  setCouponMessage('');
  updateCheckoutStepDisplay();
  updatePaymentMethodDisplay();
  updateOrderSummary();
  UI.openCheckout();
}


function closeCheckout() {
  UI.closeCheckout();
  currentCheckoutStep = 1;
  updateCheckoutStepDisplay();
}


function updateCheckoutStepDisplay() {
  document.querySelectorAll('.step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 <= currentCheckoutStep);
  });

  document.querySelectorAll('.form-step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentCheckoutStep);
  });
}


function validateCheckoutStep(step) {
  const currentForm = document.getElementById(`step${step}`);
  if (!currentForm) return false;

  const requiredInputs = currentForm.querySelectorAll('[required]');
  for (let input of requiredInputs) {
    if (!input.value.trim()) {
      UI.showNotification('Preencha todos os campos obrigatórios.', 'error');
      input.focus();
      return false;
    }
  }

  
  if (step === 1) {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const cpf = document.getElementById('cpf').value;

    console.log('Validating step 1:', { fullName, email, phone, cpf });

    if (!fullName.trim()) {
      UI.showNotification('Nome é obrigatório.', 'error');
      return false;
    }
    if (!Validators.isValidName(fullName)) {
      UI.showNotification('Nome inválido. Use apenas letras.', 'error');
      return false;
    }
    if (!email.trim()) {
      UI.showNotification('E-mail é obrigatório.', 'error');
      return false;
    }
    if (!Validators.isValidEmail(email)) {
      UI.showNotification('E-mail inválido.', 'error');
      return false;
    }
    if (!phone.trim()) {
      UI.showNotification('Telefone é obrigatório.', 'error');
      return false;
    }
    if (!Validators.isValidPhone(phone)) {
      UI.showNotification('Telefone inválido. Deve ter 10 ou 11 dígitos.', 'error');
      return false;
    }
    if (!cpf.trim()) {
      UI.showNotification('CPF é obrigatório.', 'error');
      return false;
    }
    if (!Validators.isValidCPF(cpf)) {
      UI.showNotification('CPF inválido.', 'error');
      return false;
    }

    console.log('Step 1 validation passed');
    return true;
  }

  if (step === 2) {
    const cep = document.getElementById('cep').value;
    if (!Validators.isValidCEP(cep)) {
      UI.showNotification('CEP inválido.', 'error');
      return false;
    }
  }

  if (step === 3) {
    return validatePaymentStep();
  }

  return true;
}


function validatePaymentStep() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

  if (paymentMethod === 'creditCard' || paymentMethod === 'debitCard') {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!Validators.isValidCardNumber(cardNumber)) {
      UI.showNotification('Número de cartão inválido.', 'error');
      return false;
    }
    if (!cardName.trim()) {
      UI.showNotification('Nome no cartão obrigatório.', 'error');
      return false;
    }
    if (!Validators.isValidExpiryDate(expiryDate)) {
      UI.showNotification('Data de validade inválida.', 'error');
      return false;
    }
    if (!Validators.isValidCVV(cvv)) {
      UI.showNotification('CVV inválido.', 'error');
      return false;
    }
  }

  return true;
}

function updatePaymentMethodDisplay() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
  const cardDetails = document.getElementById('cardDetails');
  const pixDetails = document.getElementById('pixDetails');
  const installmentsRow = document.getElementById('installmentsRow');

  if (cardDetails) {
    cardDetails.hidden = paymentMethod === 'pix';
  }
  if (pixDetails) {
    pixDetails.hidden = paymentMethod !== 'pix';
  }
  if (installmentsRow) {
    installmentsRow.hidden = paymentMethod !== 'creditCard';
  }
}

function hasPreviousOrder() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.username === 'mendes') {
    const orders = JSON.parse(localStorage.getItem('orders_mendes') || '[]');
    return orders.length > 0;
  }

  return localStorage.getItem('mangaverso_has_order') === 'true';
}

function getCouponValidation(code, subtotal) {
  if (!code) {
    return { valid: false, message: 'Digite um cupom para aplicar.' };
  }

  if (code === 'M10') {
    if (hasPreviousOrder()) {
      return { valid: false, message: 'O cupom M10 é válido somente para a primeira compra.' };
    }
    return {
      valid: true,
      code,
      discount: subtotal * COUPON_DISCOUNTS.M10_PERCENT,
      message: 'Cupom M10 aplicado: 10% de desconto.'
    };
  }

  if (code === 'M30') {
    if (subtotal <= 149.99) {
      return { valid: false, message: 'O cupom M30 vale para compras acima de R$ 149,99.' };
    }
    return { valid: true, code, discount: COUPON_DISCOUNTS.M30, message: 'Cupom M30 aplicado: R$ 30,00 de desconto.' };
  }

  return { valid: false, message: 'Cupom inválido. Use M10 ou M30.' };
}

function setCouponMessage(message, type = '') {
  const messageEl = document.getElementById('couponMessage');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.classList.remove('success', 'error');
  if (type) messageEl.classList.add(type);
}

function applyCoupon() {
  const couponInput = document.getElementById('couponCode');
  const code = couponInput?.value.trim().toUpperCase() || '';
  const subtotal = cart.getSubtotal();
  const result = getCouponValidation(code, subtotal);

  if (!result.valid) {
    appliedCoupon = null;
    setCouponMessage(result.message, 'error');
    updateOrderSummary();
    return;
  }

  appliedCoupon = {
    code: result.code,
    discount: result.discount
  };
  if (couponInput) couponInput.value = result.code;
  setCouponMessage(result.message, 'success');
  updateOrderSummary();
}

function calculateOrderTotals() {
  const subtotal = cart.getSubtotal();
  let discount = 0;

  if (appliedCoupon) {
    const result = getCouponValidation(appliedCoupon.code, subtotal);
    if (result.valid) {
      discount = Math.min(result.discount, subtotal + SHIPPING_COST);
    } else {
      appliedCoupon = null;
      setCouponMessage(result.message, 'error');
    }
  }

  return {
    subtotal,
    shipping: SHIPPING_COST,
    discount,
    total: Math.max(subtotal + SHIPPING_COST - discount, 0)
  };
}


async function handleCEPLookup() {
  const cepInput = document.getElementById('cep');
  const cep = cepInput.value.replace(/\D/g, '');

  if (!Validators.isValidCEP(cepInput.value)) {
    UI.showNotification('CEP inválido.', 'error');
    return;
  }

  try {
    const data = await API.lookupCEP(cep);
    document.getElementById('street').value = data.logradouro || '';
    document.getElementById('neighborhood').value = data.bairro || '';
    document.getElementById('city').value = data.localidade || '';
    document.getElementById('state').value = (data.uf || '').toUpperCase();
    UI.showNotification('Endereço carregado com sucesso!', 'success');
  } catch (error) {
    UI.showNotification('CEP não encontrado.', 'error');
  }
}


function updateOrderSummary() {
  const itemsEl = document.getElementById('summaryItems');
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const discountEl = document.getElementById('summaryDiscount');
  const discountLine = document.getElementById('discountLine');
  const totalEl = document.getElementById('summaryTotal');

  if (!itemsEl) return;

  const totals = calculateOrderTotals();

  itemsEl.innerHTML = cart.items
    .map(item => {
      const itemTotal = item.price * item.quantity;
      return `
        <div class="summary-item">
          <span>${item.title} (x${item.quantity})</span>
          <span>R$ ${Formatters.formatPrice(itemTotal)}</span>
        </div>
      `;
    })
    .join('');

  if (subtotalEl) subtotalEl.textContent = Formatters.formatPrice(totals.subtotal);
  if (shippingEl) shippingEl.textContent = Formatters.formatPrice(totals.shipping);
  if (discountEl) discountEl.textContent = Formatters.formatPrice(totals.discount);
  if (discountLine) discountLine.hidden = totals.discount <= 0;
  if (totalEl) totalEl.textContent = Formatters.formatPrice(totals.total);
}


function setupFormatters() {
  const inputFormatters = [
    { selector: '#cpf', formatter: (el) => Formatters.formatCPF(el) },
    { selector: '#cep', formatter: (el) => Formatters.formatCEP(el) },
    { selector: '#phone', formatter: (el) => Formatters.formatPhone(el) },
    { selector: '#cardNumber', formatter: (el) => Formatters.formatCardNumber(el) },
    { selector: '#expiryDate', formatter: (el) => Formatters.formatExpiryDate(el) }
  ];

  inputFormatters.forEach(({ selector, formatter }) => {
    const input = document.querySelector(selector);
    if (input) {
      input.addEventListener('input', () => formatter(input));
    }
  });

}


function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');

  if (!searchInput) return;

  
  let clearTimer = null;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    
    if (query === '') {
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(async () => {
        const titleEl = document.querySelector('#catalog .section-title');
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (titleEl) titleEl.textContent = 'Catálogo de Mangás';
        if (loadMoreBtn) loadMoreBtn.style.display = 'block';
        await catalog.loadPage(1);
      }, 300);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const cards = document.querySelectorAll('.manga-card');

    cards.forEach(card => {
      const title = card.querySelector('.manga-title')?.textContent.toLowerCase() || '';
      const genres = card.getAttribute('data-genre')?.toLowerCase() || '';

      card.style.display = title.includes(lowerQuery) || genres.includes(lowerQuery) ? 'block' : 'none';
    });
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', () => handleRemoteSearch());
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRemoteSearch();
    }
  });
}


async function handleRemoteSearch() {
  const searchInput = document.querySelector('.search-input');
  const query = searchInput ? searchInput.value.trim() : '';
  const grid = document.getElementById('catalogGrid');
  const titleEl = document.querySelector('#catalog .section-title');
  const loadMoreBtn = document.querySelector('.load-more-btn');

  if (!grid) return;

  if (!query) {
    if (titleEl) titleEl.textContent = 'Catálogo de Mangás';
    if (loadMoreBtn) loadMoreBtn.style.display = 'block';
    await catalog.loadPage(1);
    return;
  }

  if (titleEl) titleEl.textContent = `Resultados da Busca: "${query}"`;
  if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><div class="spinner"></div><p>Buscando mangás...</p></div>';

  try {
    const results = await API.searchManga(query, 12);

    if (results.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);"><i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>Nenhum mangá encontrado para "${query}".</p></div>`;
      return;
    }

    grid.innerHTML = results
      .map(item => {
        const id = item.mal_id || 0;
        catalog.cache.set(String(id), item);
        return catalog._generateCardHTML(item, id);
      })
      .join('');
  } catch (error) {
    console.error('Erro na busca remota:', error);
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--error-color);"><p>Erro ao carregar resultados da busca.</p></div>';
  }
}


function setupCarousels() {
  
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroIndicators = document.querySelectorAll('.hero-indicator');
  let currentHeroSlide = 0;

  if (heroSlides.length > 0) {
    const showHeroSlide = (index) => {
      heroSlides.forEach(s => s.classList.remove('active'));
      heroIndicators.forEach(i => i.classList.remove('active'));
      if (heroSlides[index]) {
        heroSlides[index].classList.add('active');
        heroIndicators[index].classList.add('active');
        currentHeroSlide = index;
      }
    };

    heroIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => showHeroSlide(index));
    });

    setInterval(
      () => {
        currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
        showHeroSlide(currentHeroSlide);
      },
      10000
    );
  }

  
  const storeSlides = document.querySelectorAll('.carousel-slide');
  const storeIndicators = document.querySelectorAll('.indicator');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentStoreSlide = 0;

  if (storeSlides.length > 0) {
    const showSlide = (index) => {
      storeSlides.forEach(s => s.classList.remove('active'));
      storeIndicators.forEach(i => i.classList.remove('active'));
      if (storeSlides[index]) {
        storeSlides[index].classList.add('active');
        storeIndicators[index].classList.add('active');
        currentStoreSlide = index;
      }
    };

    const nextSlide = () => {
      currentStoreSlide = (currentStoreSlide + 1) % storeSlides.length;
      showSlide(currentStoreSlide);
    };

    const prevSlide = () => {
      currentStoreSlide = (currentStoreSlide - 1 + storeSlides.length) % storeSlides.length;
      showSlide(currentStoreSlide);
    };

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    storeIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => showSlide(index));
    });

    setInterval(nextSlide, 10000);
  }
}


function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}


window.cart = cart;
window.updateCartDisplay = updateCartDisplay;


function getCheckoutData() {
  const totals = calculateOrderTotals();
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'creditCard';

  return {
    
    fullName: document.getElementById('fullName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    cpf: document.getElementById('cpf')?.value || '',
    birthDate: document.getElementById('birthDate')?.value || null,

    
    cep: document.getElementById('cep')?.value || '',
    street: document.getElementById('street')?.value || '',
    number: document.getElementById('number')?.value || '',
    neighborhood: document.getElementById('neighborhood')?.value || '',
    city: document.getElementById('city')?.value || '',
    state: document.getElementById('state')?.value || '',
    complement: document.getElementById('complement')?.value || '',

    
    paymentMethod,
    cardNumber: document.getElementById('cardNumber')?.value || '',
    cardName: document.getElementById('cardName')?.value || '',
    expiryDate: document.getElementById('expiryDate')?.value || '',
    cvv: document.getElementById('cvv')?.value || '',
    installments: paymentMethod === 'creditCard' ? parseInt(document.getElementById('installments')?.value) || 1 : 1,
    couponCode: appliedCoupon?.code || '',
    discount: totals.discount,
    subtotal: totals.subtotal,
    shipping: totals.shipping,

    
    total: totals.total
  };
}

function completeOrder() {
  if (!validateCheckoutStep(currentCheckoutStep)) {
    return;
  }

  
  const checkoutData = getCheckoutData();
  console.log('Enviando para /checkout:', checkoutData); 

  
  UI.showNotification('Processando pedido...', 'info');

  
  API.submitCheckout(checkoutData)
    .then(response => {
      console.log('Resposta /checkout:', response); 
      if (response.status === 'ok') {
        localStorage.setItem('mangaverso_has_order', 'true');

        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.username === 'mendes') {
          const orders = JSON.parse(localStorage.getItem('orders_mendes') || '[]');
          const newOrder = {
            orderId: response.order_id,
            date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            items: cart.items.map(item => ({ title: item.title, quantity: item.quantity, price: item.price })),
            total: parseFloat(response.total || checkoutData.total || 0),
            paymentMethod: checkoutData.paymentMethod,
            couponCode: checkoutData.couponCode,
            discount: checkoutData.discount,
            status: 'Em preparação'
          };
          orders.unshift(newOrder);
          localStorage.setItem('orders_mendes', JSON.stringify(orders));
        }

        
        cart.clear();
        updateCartDisplay();

        
        closeCheckout();

        
        UI.showSuccess(response.order_id);
      } else {
        UI.showNotification('Erro ao processar pedido: ' + response.msg, 'error');
      }
    })
    .catch(error => {
      console.error('Erro no checkout:', error);
      UI.showNotification('Erro ao processar pedido. Tente novamente.', 'error');
    });
}


function nextStep() {
  console.log('nextStep called, currentCheckoutStep:', currentCheckoutStep);
  const isValid = validateCheckoutStep(currentCheckoutStep);
  console.log('Validation result:', isValid);
  if (isValid) {
    currentCheckoutStep++;
    console.log('Advancing to step:', currentCheckoutStep);
    updateCheckoutStepDisplay();
    if (currentCheckoutStep === 3) {
      updateOrderSummary();
    }
  } else {
    console.log('Validation failed, staying on step:', currentCheckoutStep);
  }
}


function prevStep() {
  currentCheckoutStep--;
  updateCheckoutStepDisplay();
}


window.nextStep = nextStep;
window.prevStep = prevStep;
window.completeOrder = completeOrder;
window.closeSuccess = () => UI.closeSuccessModal();
window.closeCheckout = closeCheckout;
window.closeProductModal = () => UI.closeProductModal();
window.toggleCart = () => UI.toggleCart();
window.openCheckout = openCheckout;


let currentAboutSlide = 0;
const aboutSlides = document.querySelectorAll('.carousel-item');
const aboutDots = document.querySelectorAll('.carousel-dot');

function showAboutSlide(index) {
  aboutSlides.forEach(slide => slide.classList.remove('active'));
  aboutDots.forEach(dot => dot.classList.remove('active'));
  
  if (aboutSlides[index]) {
    aboutSlides[index].classList.add('active');
    if (aboutDots[index]) {
      aboutDots[index].classList.add('active');
    }
    currentAboutSlide = index;
  }
}

function nextAboutSlide() {
  const nextIndex = (currentAboutSlide + 1) % aboutSlides.length;
  showAboutSlide(nextIndex);
}

function prevAboutSlide() {
  const prevIndex = (currentAboutSlide - 1 + aboutSlides.length) % aboutSlides.length;
  showAboutSlide(prevIndex);
}

function goToAboutSlide(index) {
  showAboutSlide(index);
}


setInterval(() => {
  if (aboutSlides.length > 0) {
    nextAboutSlide();
  }
}, 5000);


function updateAuthState() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  const loggedUserProfile = document.getElementById('loggedUserProfile');
  const headerAvatar = document.getElementById('headerAvatar');
  const headerUsername = document.getElementById('headerUsername');
  
  if (currentUser) {
    if (headerLoginBtn) headerLoginBtn.style.display = 'none';
    if (loggedUserProfile) {
      loggedUserProfile.style.display = 'flex';
      if (headerAvatar) headerAvatar.src = currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy';
      if (headerUsername) headerUsername.textContent = currentUser.username;
    }
  } else {
    if (headerLoginBtn) headerLoginBtn.style.display = 'block';
    if (loggedUserProfile) loggedUserProfile.style.display = 'none';
  }

  
  renderReviewForm();
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  const overlay = document.getElementById('loginOverlay');
  if (modal && overlay) {
    modal.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  const overlay = document.getElementById('loginOverlay');
  if (modal && overlay) {
    modal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function openRegisterModal(e) {
  if (e) e.preventDefault();
  closeLoginModal();
  UI.showNotification('Funcionalidade de cadastro em desenvolvimento', 'info');
}


function openProfileModal() {
  const modal = document.getElementById('profileModal');
  const overlay = document.getElementById('profileOverlay');
  if (modal && overlay) {
    modal.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      const avatarBig = document.getElementById('profileAvatarBig');
      if (avatarBig) avatarBig.src = currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy';
      
      const usernameField = document.getElementById('profileUsernameField');
      if (usernameField) usernameField.value = currentUser.username;
      
      const emailField = document.getElementById('profileEmailField');
      if (emailField) emailField.value = currentUser.email;
    }
    
    
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    if (tabBtns.length > 0) {
      tabBtns[0].click();
    }
    
    
    renderProfileOrders();
  }
}


function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  const overlay = document.getElementById('profileOverlay');
  if (modal && overlay) {
    modal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function setPresetAvatar(url) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    currentUser.avatarUrl = url;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('mendes_avatar', url);
    
    const headerAvatar = document.getElementById('headerAvatar');
    const avatarBig = document.getElementById('profileAvatarBig');
    
    if (headerAvatar) headerAvatar.src = url;
    if (avatarBig) avatarBig.src = url;
  }
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  updateAuthState();
  closeProfileModal();
  UI.showNotification('Sessão encerrada com sucesso.', 'info');
}


function renderProfileOrders() {
  const listEl = document.getElementById('profileOrdersList');
  if (!listEl) return;

  const orders = JSON.parse(localStorage.getItem('orders_mendes') || '[]');
  if (orders.length === 0) {
    listEl.innerHTML = `
      <div class="empty-orders">
        <i class="fas fa-box-open"></i>
        <p>Você ainda não realizou nenhum pedido nesta conta.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = orders.map(order => {
    const statuses = ['Recebido', 'Em preparação', 'Em trânsito', 'Entregue'];
    const currentIndex = statuses.indexOf(order.status || 'Em preparação');
    
    const stepsHTML = statuses.map((status, index) => {
      let className = '';
      if (index < currentIndex) className = 'completed';
      else if (index === currentIndex) className = 'active';
      return `
        <div class="status-step ${className}">
          <div class="status-dot"></div>
          <span>${status}</span>
        </div>
      `;
    }).join('');

    const itemsHTML = order.items.map(item => `
      <div class="order-item-row">
        <span>${item.title} (x${item.quantity})</span>
        <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
      </div>
    `).join('');

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-id">Pedido #${order.orderId}</span>
            <span class="order-date">${order.date}</span>
          </div>
          <span class="order-status-badge">${order.status || 'Em preparação'}</span>
        </div>
        <div class="order-card-items">
          ${itemsHTML}
        </div>
        <div class="order-card-total">
          <span>Total com frete</span>
          <strong>R$ ${(order.total).toFixed(2).replace('.', ',')}</strong>
        </div>
        <div class="order-timeline">
          ${stepsHTML}
        </div>
        <div class="order-actions-row">
          <button class="simulate-status-btn" onclick="simulateNextStatus('${order.orderId}')">
            <i class="fas fa-shipping-fast"></i> Atualizar Status (Simular)
          </button>
        </div>
      </div>
    `;
  }).join('');
}


function simulateNextStatus(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders_mendes') || '[]');
  const orderIndex = orders.findIndex(o => o.orderId === orderId);
  if (orderIndex === -1) return;

  const currentStatus = orders[orderIndex].status || 'Em preparação';
  const statuses = ['Recebido', 'Em preparação', 'Em trânsito', 'Entregue'];
  const currentIndex = statuses.indexOf(currentStatus);

  if (currentIndex < statuses.length - 1) {
    const nextStatus = statuses[currentIndex + 1];
    orders[orderIndex].status = nextStatus;
    localStorage.setItem('orders_mendes', JSON.stringify(orders));
    renderProfileOrders();
    UI.showNotification(`Pedido ${orderId} atualizado para: ${nextStatus}!`, 'info');
  } else {
    UI.showNotification(`Pedido ${orderId} já foi entregue!`, 'success');
  }
}


async function loadReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  try {
    const response = await fetch('/api/reviews');
    if (!response.ok) throw new Error('Falha HTTP');
    const reviews = await response.json();

    if (reviews.length === 0) {
      grid.innerHTML = `
        <div class="empty-reviews" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <i class="far fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; display: block;"></i>
          <p>Nenhuma avaliação postada ainda. Seja o primeiro!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = reviews.map(r => {
      
      const avatarSrc = r.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy';
      let formattedDate = r.date;
      if (r.date && r.date.includes('-')) {
        const parts = r.date.split('-');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      return `
        <div class="review-card">
          <div class="review-header">
            <div class="review-author">
              <img src="${avatarSrc}" alt="${r.username}" class="review-avatar-img">
              <div class="review-author-info">
                <p class="review-name">${r.username}</p>
                <div class="review-stars">
                  ${getStarsHTML(r.rating)}
                </div>
              </div>
            </div>
            <span class="review-date">${formattedDate}</span>
          </div>
          <p class="review-text">${r.comment}</p>
          <p class="review-meta"><i class="fas fa-check-circle"></i> Compra verificada</p>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    grid.innerHTML = '<p class="empty-message" style="grid-column: 1/-1; text-align: center; color: var(--error-color);">Erro ao carregar avaliações.</p>';
  }
}

function getStarsHTML(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (hasHalf) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  return html;
}


function renderReviewForm() {
  const container = document.getElementById('reviewFormContainer');
  if (!container) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    container.innerHTML = `
      <form class="review-form" id="reviewForm">
        <h3>Deixe sua avaliação</h3>
        <div class="rating-input">
          <span>Sua nota:</span>
          <div class="stars-input" id="starsInput">
            <i class="far fa-star" data-rating="1"></i>
            <i class="far fa-star" data-rating="2"></i>
            <i class="far fa-star" data-rating="3"></i>
            <i class="far fa-star" data-rating="4"></i>
            <i class="far fa-star" data-rating="5"></i>
          </div>
          <input type="hidden" id="ratingValue" value="0">
        </div>
        <div class="form-group">
          <label for="reviewComment">Comentário</label>
          <textarea id="reviewComment" rows="3" placeholder="Escreva o que você achou da MangaVerso..." required></textarea>
        </div>
        <button type="submit" class="submit-review-btn">Publicar Avaliação</button>
      </form>
    `;

    
    const stars = container.querySelectorAll('.stars-input i');
    const ratingValue = container.querySelector('#ratingValue');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        ratingValue.value = rating;
        
        stars.forEach((s, idx) => {
          if (idx < rating) {
            s.className = 'fas fa-star';
          } else {
            s.className = 'far fa-star';
          }
        });
      });
      
      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        stars.forEach((s, idx) => {
          if (idx < rating) {
            s.className = 'fas fa-star';
          } else {
            s.className = 'far fa-star';
          }
        });
      });
    });

    const starsInputContainer = container.querySelector('#starsInput');
    if (starsInputContainer) {
      starsInputContainer.addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingValue.value);
        stars.forEach((s, idx) => {
          if (idx < currentRating) {
            s.className = 'fas fa-star';
          } else {
            s.className = 'far fa-star';
          }
        });
      });
    }

    
    const form = container.querySelector('#reviewForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = parseFloat(ratingValue.value);
      const comment = container.querySelector('#reviewComment').value.trim();

      if (rating === 0) {
        UI.showNotification('Por favor, selecione uma nota de 1 a 5 estrelas.', 'warning');
        return;
      }

      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser.username,
            rating: rating,
            comment: comment,
            avatarUrl: currentUser.avatarUrl
          })
        });

        const result = await response.json();
        if (response.ok && result.status === 'ok') {
          UI.showNotification('Avaliação publicada!', 'success');
          loadReviews(); 
          
          
          ratingValue.value = '0';
          stars.forEach(s => s.className = 'far fa-star');
          container.querySelector('#reviewComment').value = '';
        } else {
          UI.showNotification(result.msg || 'Erro ao publicar avaliação.', 'error');
        }
      } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        UI.showNotification('Erro de comunicação com o servidor.', 'error');
      }
    });

  } else {
    container.innerHTML = `
      <div class="login-prompt-card">
        <i class="fas fa-lock"></i>
        <p>Você precisa estar logado para deixar uma avaliação.</p>
        <button class="login-prompt-btn" onclick="openLoginModal()">Fazer Login</button>
      </div>
    `;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginVal = document.getElementById('loginEmail').value.trim();
      const passwordVal = document.getElementById('loginPassword').value;
      
      if (loginVal.toLowerCase() === 'mendes' && passwordVal === 'mendes10') {
        const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy';
        const userObj = {
          username: 'mendes',
          email: 'mendes@mangaverso.com',
          avatarUrl: localStorage.getItem('mendes_avatar') || defaultAvatar
        };
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        updateAuthState();
        
        UI.showNotification('Login realizado com sucesso! Bem-vindo, mendes.', 'success');
        closeLoginModal();
        
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
      } else {
        UI.showNotification('Usuário ou senha incorretos.', 'error');
      }
    });
  }

  
  const tabBtns = document.querySelectorAll('.profile-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const contentEl = document.getElementById(`profileTab-${tabId}`);
      if (contentEl) contentEl.classList.add('active');
    });
  });

  
  const avatarInput = document.getElementById('avatarUploadInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
          UI.showNotification('Imagem muito grande. Escolha uma imagem menor que 1.5MB.', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          setPresetAvatar(base64Url);
          UI.showNotification('Foto de perfil atualizada!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
});


window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.setPresetAvatar = setPresetAvatar;
window.handleLogout = handleLogout;
window.simulateNextStatus = simulateNextStatus;
window.nextAboutSlide = nextAboutSlide;
window.prevAboutSlide = prevAboutSlide;
window.goToAboutSlide = goToAboutSlide;
window.loadReviews = loadReviews;
window.renderReviewForm = renderReviewForm;
