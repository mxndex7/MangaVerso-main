


const API = {
  


  async searchManga(query, limit = 10) {
    if (!query) return [];
    try {
      const response = await fetch(
        `/api/jikan/manga?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (error) {
      console.error('Erro ao buscar mangás:', error);
      return [];
    }
  },

  


  async searchAnime(query, limit = 10) {
    if (!query) return [];
    try {
      const response = await fetch(
        `/api/jikan/anime?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      return [];
    }
  },

  


  async getTopManga(limit = 16, page = 1) {
    try {
      const response = await fetch(`/api/jikan/manga/top?limit=${limit}&page=${page}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (error) {
      console.error('Erro ao carregar mangás populares:', error);
      return [];
    }
  },

  


  async getFeaturedManga() {
    try {
      const response = await fetch('/api/jikan/manga/featured');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (error) {
      console.error('Erro ao carregar mangás em destaque:', error);
      return [];
    }
  },

  


  async addToCart(nome, preco) {
    try {
      const response = await fetch('/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, preco })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return { status: 'erro', msg: 'Falha ao comunicar com o servidor' };
    }
  },

  


  async lookupCEP(cep) {
    if (!/^[0-9]{8}$/.test(cep)) {
      throw new Error('CEP inválido');
    }
    try {
      const response = await fetch(`/api/cep/${cep}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('CEP não encontrado');
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      throw error;
    }
  },

  


  async submitCheckout(checkoutData) {
    try {
      const response = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });
      const data = await response.json().catch(() => ({
        status: 'erro',
        msg: `HTTP ${response.status}`
      }));
      if (!response.ok) {
        return {
          status: 'erro',
          msg: data.msg || `HTTP ${response.status}`
        };
      }
      return data;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return {
        status: 'erro',
        msg: 'Falha ao comunicar com o servidor'
      };
    }
  }
};

export { API };
