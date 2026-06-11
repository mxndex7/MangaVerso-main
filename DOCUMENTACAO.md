# MangaVerso — Documentação de Uso e Técnica

Este documento destina-se a potenciais clientes e à equipe técnica. Contém instruções de uso, visão da arquitetura, medidas de segurança, tecnologias utilizadas, resultados de validação (testes) e um Plano de Continuidade com próximos passos para melhorias, escalabilidade e manutenção.

## Público-alvo

- Clientes potenciais que desejam avaliar a solução.
- Equipe técnica responsável pela manutenção e operação.

## Uso Rápido

Pré-requisitos:
- Python 3.8+
- pip

Instalação e execução local (Windows):

```powershell
git clone <url-do-repositorio>
cd MangaVerso
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Abra `http://localhost:5000` no navegador.

## Guia para Clientes (funcionalidades destacadas)

- Busca de mangás/animes (`/api/jikan/manga`, `/api/jikan/anime`)
- Top e Featured (`/api/jikan/manga/top`, `/api/jikan/manga/featured`)
- Consulta de CEP (`/api/cep/<cep>`) via ViaCEP
- Carrinho & Checkout (`POST /adicionar`, `POST /checkout`)
- Avaliações (`GET/POST /api/reviews`)

Exemplo: `GET /api/jikan/manga?q=Naruto&limit=5`

## Arquitetura

- `app.py`: criação da app Flask e registro de blueprints.
- `routes/`: blueprints:
  - `jikan_bp.py`: integra Jikan API (busca, top, featured).
  - `cart_bp.py`: adicionar ao carrinho e checkout (validação com Marshmallow).
  - `cep_bp.py`: proxy para ViaCEP com validação de CEP.
  - `reviews_bp.py`: API de avaliações usando SQLite.
- `jikan_client.py`: cliente HTTP para Jikan com normalização dos dados.
- `utils/jikan_improved.py`: cache em memória via `lru_cache` com invalidação periódica (~5 min).
- `schemas/`: definições de `marshmallow` para validação (`checkout_schema`, `add_to_cart_schema`).

Fluxo resumido:

1. Frontend chama endpoints da API.
2. Backend valida e sanitiza entradas (Marshmallow + Bleach).
3. Requisições para Jikan usam `jikan_client.py` e são cacheadas em memória.
4. Reviews são persistidas em `mangaverso.db` (SQLite).

## Segurança

Medidas implementadas:

- Validação de entrada com `marshmallow`.
- Sanitização de strings com `bleach`.
- CORS restrito via `CORS_ORIGINS` configurável.
- Timeouts em requisições externas (`requests`).
- Tratamento de erros com retornos JSON e códigos HTTP apropriados.

Recomendações para produção:

- Usar HTTPS obrigatório (TLS), servidor WSGI (Gunicorn) e proxy reverso (Nginx).
- Não armazenar dados de cartão localmente; usar gateway de pagamento.
- Rate limiting e monitoramento de abuso.

## Tecnologias

- Backend: Python 3.8+, Flask, Flask-CORS
- Validação: Marshmallow
- Sanitização: Bleach
- HTTP client: requests
- DB local: SQLite
- Frontend: HTML/CSS/Vanilla JS, Font Awesome
- APIs externas: Jikan API, ViaCEP

Dependências: ver `requirements.txt`.

## Validação e Testes

O repositório inclui `test_schemas.py`, que valida os schemas de `add_to_cart` e `checkout`.

Exemplo de execução e saída (local):

```
============================================================
TESTE 1: Validação de /adicionar
============================================================
✓ Dados válidos para /adicionar:
  - Nome: Naruto Vol 1
  - Preço: 29.9

============================================================
TESTE 2: Validação de /checkout
============================================================
✓ Dados válidos para /checkout:
  - fullName: João Silva Santos
  - email: joao@example.com
  - cpf: 123.456.789-00
  - city: Recife
  - cardNumber: 4532 1234 5678 9010
  ... (e mais 14 campos)

============================================================
Testes concluídos!
============================================================
```

Esses testes demonstram que os schemas aceitam e validam um conjunto representativo de entradas.

## Plano de Continuidade

Prioridades (curto prazo):

- Integrar gateway de pagamento (sandbox) para checkout real.
- Adicionar suíte de testes (`pytest`) e configurar CI (GitHub Actions).
- Criar documentação de API (OpenAPI/Swagger).

Escalabilidade (médio prazo):

- Containerizar (Docker) e orquestrar com `docker-compose` / Kubernetes.
- Mover cache para Redis e persistência para Postgres.

Operação e manutenção (longo prazo):

- Monitoramento (logs, métricas), backups, e política de atualização.
- Rotina de segurança: varredura de dependências e rotação de segredos.

## Próximos passos que posso ajudar a executar

- Criar `Dockerfile` / `docker-compose.yml`.
- Configurar CI com testes automáticos.
- Implementar Redis + migração do DB para Postgres (scripts e configuração).

---

Arquivo criado automaticamente. Peça ajustes ou uma versão direcionada a clientes.
