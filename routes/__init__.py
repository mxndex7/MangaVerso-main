from routes.jikan_bp import jikan_bp
from routes.cart_bp import cart_bp
from routes.cep_bp import cep_bp
from routes.reviews_bp import reviews_bp


def register_blueprints(app):
    app.register_blueprint(jikan_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(cep_bp)
    app.register_blueprint(reviews_bp)
