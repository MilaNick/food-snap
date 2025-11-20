import os
from flask import Flask, render_template, request, jsonify
from models import db, FoodAnalysis, analyze_ingredients, generate_social_content
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

os.makedirs('instance', exist_ok=True)

with app.app_context():
    db.drop_all()
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_ingredients_route():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Неверный формат данных'}), 400
            
        ingredients = data.get('ingredients', '').strip()
        
        if not ingredients:
            return jsonify({'error': 'Введите ингредиенты'}), 400
        
        # Убрана проверка на минимальное количество ингредиентов
        recipes_analysis = analyze_ingredients(ingredients)
        social_content = generate_social_content(recipes_analysis)
        
        analysis = FoodAnalysis(
            ingredients=ingredients,
            analysis_result=recipes_analysis,
            social_content=social_content
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'recipes': recipes_analysis,
            'social_content': social_content
        })
        
    except Exception as e:
        return jsonify({'error': f'Внутренняя ошибка сервера: {str(e)}'}), 500

@app.route('/history')
def history():
    try:
        analyses = FoodAnalysis.query.order_by(FoodAnalysis.timestamp.desc()).limit(10).all()
        return jsonify([{
            'id': a.id,
            'ingredients': a.ingredients[:100] + '...' if len(a.ingredients) > 100 else a.ingredients,
            'timestamp': a.timestamp.isoformat(),
            'analysis_preview': a.analysis_result[:100] + '...' if a.analysis_result else ''
        } for a in analyses])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'FoodSnap AI работает'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)