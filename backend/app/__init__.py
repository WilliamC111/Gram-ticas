import os
from flask import Flask


def create_app():
    # Configurar paths absolutos
    base_dir = os.path.abspath(os.path.dirname(__file__))
    template_dir = os.path.join(base_dir, "../../frontend/templates")
    static_dir = os.path.join(base_dir, "../../frontend/static")

    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

    # Registrar blueprints
    from app.routes.main_routes import main_bp

    app.register_blueprint(main_bp)

    return app
