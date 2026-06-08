                      

import sys
sys.path.insert(0, '.')

from schemas import add_to_cart_schema, checkout_schema

                                
print("=" * 60)
print("TESTE 1: Validação de /adicionar")
print("=" * 60)

test_add_to_cart = {
    'nome': 'Naruto Vol 1',
    'preco': 29.90
}

try:
    result = add_to_cart_schema.load(test_add_to_cart)
    print("✓ Dados válidos para /adicionar:")
    print(f"  - Nome: {result['nome']}")
    print(f"  - Preço: {result['preco']}")
except Exception as e:
    print(f"✗ Erro ao validar /adicionar: {e}")

                   
print("\n" + "=" * 60)
print("TESTE 2: Validação de /checkout")
print("=" * 60)

test_checkout = {
    'fullName': 'João Silva Santos',
    'email': 'joao@example.com',
    'phone': '(81) 99999-9999',
    'cpf': '123.456.789-00',
    'birthDate': '1990-01-15',
    'cep': '50010-020',
    'street': 'Rua das Flores',
    'number': '123',
    'neighborhood': 'Centro',
    'city': 'Recife',
    'state': 'PE',
    'complement': 'Apto 101',
    'cardNumber': '4532 1234 5678 9010',
    'cardName': 'JOAO S SANTOS',
    'expiryDate': '12/25',
    'cvv': '123',
    'installments': 3,
    'total': 100.50
}

try:
    result = checkout_schema.load(test_checkout)
    print("✓ Dados válidos para /checkout:")
    for key in ['fullName', 'email', 'cpf', 'city', 'cardNumber']:
        print(f"  - {key}: {result.get(key, 'N/A')}")
    print(f"  ... (e mais {len(result) - 5} campos)")
except Exception as e:
    print(f"✗ Erro ao validar /checkout: {e}")

print("\n" + "=" * 60)
print("Testes concluídos!")
print("=" * 60)
