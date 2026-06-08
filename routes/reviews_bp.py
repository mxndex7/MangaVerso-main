from flask import Blueprint, request, jsonify
import sqlite3
import os
from datetime import datetime

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')
DB_PATH = 'mangaverso.db'


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            rating REAL NOT NULL,
            comment TEXT NOT NULL,
            date TEXT NOT NULL,
            avatar_url TEXT
        )
    ''')
    conn.commit()
    conn.close()


                                                      
init_db()


@reviews_bp.route('', methods=['GET'])
def get_reviews():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT username, rating, comment, date, avatar_url FROM reviews ORDER BY id DESC')
        rows = cursor.fetchall()
        
        reviews = []
        for r in rows:
            reviews.append({
                'username': r['username'],
                'rating': r['rating'],
                'comment': r['comment'],
                'date': r['date'],
                'avatar_url': r['avatar_url']
            })
        conn.close()
        return jsonify(reviews), 200
    except Exception as e:
        print(f"[ERRO GET /api/reviews] {e}")
        return jsonify({'status': 'erro', 'msg': 'Erro ao buscar avaliações'}), 500


@reviews_bp.route('', methods=['POST'])
def add_review():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'erro', 'msg': 'Dados ausentes ou inválidos'}), 400
        
    username = data.get('username', '').strip()
    rating = data.get('rating')
    comment = data.get('comment', '').strip()
    avatar_url = data.get('avatarUrl', '').strip()                                        
    
    if not username:
        return jsonify({'status': 'erro', 'msg': 'Nome de usuário é obrigatório'}), 400
        
    try:
        rating_float = float(rating)
        if not (1 <= rating_float <= 5):
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({'status': 'erro', 'msg': 'Avaliação inválida (deve ser um número entre 1 e 5)'}), 400
        
    if not comment:
        return jsonify({'status': 'erro', 'msg': 'Comentário da avaliação é obrigatório'}), 400
        
    try:
        conn = get_db_connection()
        date_str = datetime.now().strftime('%Y-%m-%d')
        conn.execute(
            'INSERT INTO reviews (username, rating, comment, date, avatar_url) VALUES (?, ?, ?, ?, ?)',
            (username, rating_float, comment, date_str, avatar_url)
        )
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok', 'msg': 'Avaliação adicionada com sucesso!'}), 201
    except Exception as e:
        print(f"[ERRO POST /api/reviews] {e}")
        return jsonify({'status': 'erro', 'msg': 'Erro interno ao salvar avaliação'}), 500
