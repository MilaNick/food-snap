import os
import requests
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

YA_API_KEY = os.environ.get('YA_API_KEY')
YA_FOLDER_ID = os.environ.get('YA_FOLDER_ID')

db = SQLAlchemy()

class FoodAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ingredients = db.Column(db.Text, nullable=False)
    analysis_result = db.Column(db.Text, nullable=False)
    social_content = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

class RecipeAIService:
    def __init__(self):
        self.api_key = YA_API_KEY
        self.folder_id = YA_FOLDER_ID
    
    def generate_recipes(self, ingredients):
        try:
            if not self.api_key or not self.folder_id:
                return "Ошибка: не настроены API ключи"
            
            user_message = f"""Ты - опытный шеф-повар. Пользователь предоставил эти ингредиенты:

{ingredients}

СОЗДАЙ 2-3 РАЗНЫХ РЕЦЕПТА:

📋 РЕЦЕПТ 1: [Название]
🍽️ Тип: [завтрак/обед/ужин/десерт]
⏱️ Время: [приготовления]
📖 Ингредиенты:
- [список]
👨‍🍳 Инструкция:
1. [шаг 1]
2. [шаг 2]

📋 РЕЦЕПТ 2: [Название]
🍽️ Тип: [завтрак/обед/ужин/десерт]
⏱️ Время: [приготовления]
📖 Ингредиенты:
- [список]
👨‍🍳 Инструкция:
1. [шаг 1]
2. [шаг 2]

📋 РЕЦЕПТ 3: [Название] (опционально)
🍽️ Тип: [завтрак/обед/ужин/десерт]
⏱️ Время: [приготовления]
📖 Ингредиенты:
- [список]
👨‍🍳 Инструкция:
1. [шаг 1]
2. [шаг 2]

💡 СОВЕТЫ:
- [Общие советы по использованию этих ингредиентов]

Будь креативным! Можно добавлять базовые ингредиенты (соль, перец, масло), но основу составляй из предоставленных."""

            return self._call_yandex_gpt(user_message)
                
        except Exception as e:
            return f"Ошибка генерации рецептов: {str(e)}"
    
    def generate_social_content(self, recipes_analysis):
        try:
            user_message = f"""На основе этих рецептов создай контент для кулинарного блогера:

{recipes_analysis}

СОЗДАЙ КОНТЕНТ ДЛЯ СОЦСЕТЕЙ:

📸 INSTAGRAM ПОСТ:
Заголовок: [Яркий, привлекающий внимание]
Текст: [Краткое описание + призыв к действию]
Хештеги: [5-7 релевантных хештегов]

🎥 REELS/TIKTOK ИДЕЯ:
Тема: [Идея для видео]
Сценарий: [Краткий сценарий на 15-30 секунд]
Тренды: [Какие тренды использовать]

📝 БЛОГ ПОСТ:
Заголовок: [SEO-оптимизированный]
Введение: [Захватывающее введение]
Ключевые моменты: [3-4 ключевых пункта]

🔍 СОВЕТ ДЛЯ АУДИТОРИИ:
[Полезный совет или лайфхак]

Сделай контент привлекательным, полезным и готовым к публикации!"""

            return self._call_yandex_gpt(user_message)
                
        except Exception as e:
            return f"Ошибка генерации контента: {str(e)}"
    
    def _call_yandex_gpt(self, message):
        try:
            url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
            headers = {
                "Authorization": f"Api-Key {self.api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "modelUri": f"gpt://{self.folder_id}/yandexgpt",
                "completionOptions": {
                    "stream": False,
                    "temperature": 0.8,
                    "maxTokens": "2000"
                },
                "messages": [
                    {
                        "role": "user",
                        "text": message
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return result['result']['alternatives'][0]['message']['text']
            else:
                return f"Ошибка API: {response.status_code}"
                
        except Exception as e:
            return f"Ошибка соединения: {str(e)}"

recipe_service = RecipeAIService()

def analyze_ingredients(ingredients_text):
    try:
        return recipe_service.generate_recipes(ingredients_text)
    except Exception as e:
        return f"Ошибка при генерации рецептов: {str(e)}"

def generate_social_content(recipes_analysis):
    try:
        return recipe_service.generate_social_content(recipes_analysis)
    except Exception as e:
        return f"Ошибка при генерации контента: {str(e)}"