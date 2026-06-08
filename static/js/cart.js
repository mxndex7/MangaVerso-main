


import { Formatters } from './formatters.js';
import { UI } from './ui.js';

class Cart {
  constructor() {
    this.items = this.loadFromStorage();
    this.cleanInvalidItems(); 
  }

  


  loadFromStorage() {
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      
      return items.filter(item => 
        item && 
        typeof item.id === 'number' && 
        item.title && 
        typeof item.price === 'number' && 
        item.price > 0 &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    } catch {
      return [];
    }
  }

  


  saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  


  addItem(id, title, price, image) {
    
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      console.error('ID inválido:', id);
      return null;
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      console.error('Título inválido:', title);
      return null;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      console.error('Preço inválido:', price);
      return null;
    }

    if (!image || typeof image !== 'string' || image.trim() === '') {
      console.error('Imagem inválida:', image);
      return null;
    }

    const existingItem = this.items.find(item => item.id === numericId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: numericId,
        title: title.trim(),
        price: numericPrice,
        image: image.trim(),
        quantity: 1
      });
    }

    this.saveToStorage();
    return existingItem || this.items[this.items.length - 1];
  }

  


  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveToStorage();
  }

  


  updateQuantity(id, quantity) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
      this.saveToStorage();
    }
  }

  


  clear() {
    this.items = [];
    localStorage.removeItem('cart');
  }

  


  cleanInvalidItems() {
    this.items = this.items.filter(item => 
      item && 
      typeof item.id === 'number' && 
      item.title && 
      typeof item.price === 'number' && 
      item.price > 0 &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
    this.saveToStorage();
  }

  


  getTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  


  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  


  getTotal(shippingCost = 15.0) {
    return this.getSubtotal() + shippingCost;
  }

  


  isEmpty() {
    return this.items.length === 0;
  }
}

export { Cart };
