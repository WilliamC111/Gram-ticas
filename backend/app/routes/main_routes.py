from flask import Blueprint, render_template, request, jsonify
from app.services.grammar_evaluator import evaluate_grammar, generate_strings

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.json
    if data is None:
        return jsonify({"error": "Invalid input"}), 400
    result = evaluate_grammar(
        data["grammar"], data["start_symbol"], data["input_string"]
    )
    return jsonify(result)


@main_bp.route("/generate_strings", methods=["POST"])
def generate_strings_endpoint():
    data = request.json
    if data is None:
        return jsonify({"error": "Invalid input"}), 400
    max_length = data.get("max_length", None)  # Nuevo parámetro opcional
    result = generate_strings(
        data["grammar"], 
        data["start_symbol"],
        max_strings=20,
        max_length=max_length  # Pasamos el parámetro
    )
    return jsonify(result)