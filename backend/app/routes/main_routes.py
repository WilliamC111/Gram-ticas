from flask import Blueprint, render_template, request, jsonify
from app.services.grammar_evaluator import evaluate_grammar

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