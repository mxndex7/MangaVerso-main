import os
from dotenv import load_dotenv

                                                
load_dotenv()


class Config:

           
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    TESTING = os.getenv('TESTING', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', '5000'))
    FLASK_DEBUG = DEBUG

          
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5000').split(',')

                                  
    FEATURED_TITLES = [
        'Dragon Ball', 'Naruto', 'Jujutsu Kaisen'
    ]

                
    VIACEP_BASE_URL = os.getenv('VIACEP_BASE_URL', 'https://viacep.com.br/ws')
    VIACEP_TIMEOUT = int(os.getenv('VIACEP_TIMEOUT', '10'))

                                                     
                                           


def get_config():
    return Config