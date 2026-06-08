import requests
from flask import Blueprint, jsonify
from config import get_config
from utils.validators import validate_cep

                     
config = get_config()

cep_bp = Blueprint('cep', __name__, url_prefix='/api')


@cep_bp.route('/cep/<cep>', methods=['GET'])
def api_cep(cep):
                            
    if not validate_cep(cep):
        return jsonify({'error': 'CEP inválido. Use o formato XXXXX-XXX'}), 400

    cep_clean = ''.join(filter(str.isdigit, cep))

    try:
        resp = requests.get(
            f'{config.VIACEP_BASE_URL}/{cep_clean}/json/',
            timeout=config.VIACEP_TIMEOUT
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        return jsonify({'error': 'Falha ao consultar o CEP. Tente novamente.'}), 502

    data = resp.json()
    if data.get('erro'):
        return jsonify({'error': 'CEP não encontrado'}), 404

    return jsonify(data), 200
