from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from schemas import add_to_cart_schema
from utils.validators import sanitize_string

cart_bp = Blueprint('cart', __name__, url_prefix='')


@cart_bp.route('/adicionar', methods=['POST'])
def add_to_cart():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            'status': 'erro', 
            'msg': 'Dados inválidos. JSON ausente ou mal formatado.'
        }), 400

    try:
                                  
        validated_data = add_to_cart_schema.load(data)
    except ValidationError as err:
                                                 
        error_messages = []
        if isinstance(err.messages, dict):
            for field, messages in err.messages.items():
                if isinstance(messages, list):
                    error_messages.append(f"{field}: {', '.join(str(m) for m in messages)}")
                else:
                    error_messages.append(f"{field}: {messages}")
        else:
            error_messages = [str(err.messages)]
        
        error_msg = ' | '.join(error_messages) if error_messages else 'Dados inválidos'
        print(f'[ERRO VALIDAÇÃO /adicionar] {error_msg}')                  
        return jsonify({
            'status': 'erro', 
            'msg': error_msg
        }), 400

                             
    nome = validated_data.get('nome', '').strip()
    preco = validated_data.get('preco', 0)

                       
    if not nome or preco <= 0:
        return jsonify({
            'status': 'erro', 
            'msg': 'Nome ou preço inválidos.'
        }), 400

                    
    nome_sanitizado = sanitize_string(nome)

    return jsonify({
        'status': 'ok',
        'msg': f"{nome_sanitizado} adicionado ao carrinho com sucesso!"
    }), 200


@cart_bp.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            'status': 'erro', 
            'msg': 'Dados inválidos. JSON ausente ou mal formatado.'
        }), 400

    try:
                                     
        from schemas import checkout_schema
        
                                  
        validated_data = checkout_schema.load(data)
    except ValidationError as err:
                                                 
        error_messages = []
        if isinstance(err.messages, dict):
            for field, messages in err.messages.items():
                if isinstance(messages, list):
                    error_messages.append(f"{field}: {', '.join(str(m) for m in messages)}")
                else:
                    error_messages.append(f"{field}: {messages}")
        else:
            error_messages = [str(err.messages)]
        
        error_msg = ' | '.join(error_messages) if error_messages else 'Dados inválidos'
        print(f'[ERRO VALIDAÇÃO /checkout] {error_msg}')                  
        return jsonify({
            'status': 'erro', 
            'msg': error_msg
        }), 400
    except Exception as e:
        print(f'[ERRO /checkout] {str(e)}')                  
        return jsonify({
            'status': 'erro', 
            'msg': f'Erro ao processar checkout: {str(e)}'
        }), 400

                                                                 
                                                 
                                                             

                                             
    cpf = validated_data.get('cpf', '').replace('.', '').replace('-', '')
    order_id = f"ORDER_{cpf}_{hash(str(validated_data)) % 10000}"

    return jsonify({
        'status': 'ok',
        'msg': 'Pedido processado com sucesso!',
        'order_id': order_id,
        'total': data.get('total', 0)                                
    }), 200
