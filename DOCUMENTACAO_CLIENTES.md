# MangaVerso — Documento para Clientes

Este documento apresenta o projeto de forma acessível, explicando a ideia, valor para usuários e como experimentar a solução rapidamente — sem entrar em detalhes técnicos profundos.

**Visão do projeto**

MangaVerso é uma loja online voltada para fãs de mangás que combina uma interface leve e intuitiva com dados em tempo real sobre títulos e sinopses. A ideia é oferecer uma experiência de descoberta e compra simples, com foco em usabilidade: busca rápida, títulos em destaque, carrinho persistente e um checkout direto para demonstrações e provas de conceito.

**Problema que resolvemos**

- Dificuldade de encontrar informações completas sobre mangás em uma única interface.
- Processos de compra confusos em lojas pequenas.
- Falta de uma experiência móvel amigável para descoberta rápida.

**Proposta de valor**

MangaVerso entrega aos usuários:

- Uma busca unificada por mangás e animes com resultados organizados e com imagens.
- Uma experiência de compra simples, com carrinho persistido no navegador.
- Sugestões e títulos em destaque para facilitar a descoberta.
- Validação de dados para evitar erros no checkout e feedback claro ao usuário.

**Público-alvo**

- Consumidores finais (leitores de mangás) que querem uma experiência rápida para descobrir e comprar.
- Pequenas lojas e demonstradores que precisam de um front-end leve para vendas online.
- Times que desejam uma prova de conceito (POC) de integração com APIs de conteúdo (Jikan) e gateways de pagamento.

**Como funciona — visão do usuário**

1. O visitante chega à página inicial e pode buscar por um título ou navegar por itens em destaque.
2. Ao clicar em um mangá, vê detalhes, imagem e sinopse.
3. Adiciona o item ao carrinho (o carrinho é salvo no navegador — `localStorage`).
4. Segue para o checkout, preenche os dados e finaliza a compra (no protótipo, o pedido é simulado).

Essa jornada é rápida e pensada para causar boa primeira impressão ao usuário.

**Principais funcionalidades (resumido)**

- Busca por título (manga/anime).
- Listas de populares e títulos em destaque.
- Carrinho com persistência local.
- Checkout com validação de formulário (nome, endereço, CPF, cartão — para demonstração).
- Consulta de CEP integrada (ViaCEP) para preencher endereço.
- Área de avaliações onde usuários podem postar comentários e notas.

**Cenários de uso (exemplos práticos)**

- Usuário casual quer checar a sinopse de um mangá e adicioná-lo ao carrinho rapidamente.
- Pequena loja usa o protótipo para demonstrar catálogo e fluxo de compra a investidores.
- Time de produto valida integração com API externa (Jikan) e coleta métricas de interesse.

**Benefícios para clientes/negócios**

- Tempo de implantação rápido para demonstrar um MVP.
- Código simples e fácil de adaptar (boa base para personalização).
- Experiência de compra clara que reduz abandono por etapas confusas.

**Como experimentar rapidamente (demo)**

1. Baixe o repositório e execute localmente (instruções básicas no README).
2. Abra a página inicial e faça buscas por títulos conhecidos (ex.: Naruto, Dragon Ball).
3. Adicione itens ao carrinho e tente o checkout com dados de exemplo.

Comandos rápidos:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Abra `http://localhost:5000` no navegador e navegue.

**Validação (o que já foi testado)**

O projeto inclui testes simples que verificam a validação dos formulários de adicionar ao carrinho e de checkout. Esses testes demonstraram que os formulários aceitam dados válidos e rejeitam entradas inválidas, garantindo um fluxo de coleta de dados confiável para a etapa de pagamento (no protótipo, o pagamento é simulado).

**Limitações importantes (transparência)**

- O checkout atual é uma simulação para demonstração. Não recomendamos armazenar dados de cartão em produção.
- O armazenamento de avaliações usa um banco local (SQLite) adequado para POCs, mas não para alto volume em produção.

**Próximos passos sugeridos para adoção**

- Integrar um provedor de pagamentos (sandbox) para testes de compra reais.
- Containerizar a aplicação para facilitar deploy em nuvem.
- Migrar persistência para um banco gerenciado (ex.: Postgres) antes de ir para produção.

**Por que escolher MangaVerso como POC?**

- Foco na descoberta: combina catálogo e sinopses com busca eficiente.
- Agilidade: pode ser rodado localmente ou em um servidor em minutos.
- Base limpa para evoluir: arquitetura simples facilita customizações e integrações.

---

Se quiser, adapto esse documento para um material comercial (brochura curta) ou gerencio a criação de um POC hospedado para apresentação a clientes/investidores.
