# config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'instance', 'foodsnap.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    YA_API_KEY = os.environ.get('YA_API_KEY')
    YA_FOLDER_ID = os.environ.get('YA_FOLDER_ID')