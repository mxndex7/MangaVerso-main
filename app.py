import os
from flask import Flask, render_template
from flask_cors import CORS

from config import get_config
from routes import register_blueprints


def create_app(config=None):

    app = Flask(
        __name__,
        template_folder='templates',
        static_folder='static'
    )
    
    if config is None:
        config = get_config()
    
    app.config.from_object(config)
    
    allowed_origins = [origin.strip() for origin in config.CORS_ORIGINS]
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type"]
            }
        }
    )
    
    register_blueprints(app)
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Recurso não encontrado'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Erro interno do servidor'}, 500
    
    return app


                              
app = create_app()


if __name__ == '__main__':
    config = get_config()
    app.run(
        host='0.0.0.0',
        port=config.PORT,
        debug=config.FLASK_DEBUG,
    ) 