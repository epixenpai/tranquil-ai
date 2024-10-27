from flask import Flask, render_template, request, jsonify
import requests
import uuid
import os
from characterai import aiocai
import asyncio
from flask_cors import CORS
import os
app = Flask(__name__)
CORS(app)

# Store your credentials
ID = "slbuS2E6htg2o1v85UGzR5kqxXk2"
AUTH1 = "e99de37bd8414d67a2088eaaf9d674c2"
CHAR_AI_TOKEN = '2aeee7a58ff0d839b0a3c854cb7bf07291357720'
CHAR_ID = 'OUOZqBKj3R_NJtClQ-SYe-Aeblk6cvmav721KA2VFsY'
CHAT_ID = '10af34a0-9501-4a41-8f6f-9eaecd5ea607'

# Initialize CharacterAI client
client = None
chat = None

async def init_client():
    global client
    client = aiocai.Client(CHAR_AI_TOKEN)
    me = await client.get_me()
    return me.id

def generate_audio(text):
    unique_id = str(uuid.uuid4())
    audio_filename = f'static/audio/audio_{unique_id}.mp3'
    
    url = "https://api.play.ht/api/v2/tts/stream"
    headers = {
        "AUTHORIZATION": AUTH1,
        "X-USER-ID": ID,
        "accept": "audio/mpeg",
        "content-type": "application/json"
    }
    
    data = {
        "voice": "s3://voice-cloning-zero-shot/d155add6-84f5-43bd-88cd-27924b304141/original/manifest.json",
        "output_format": "mp3",
        "voice_engine": "PlayHT2.0",
        "text": text
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        os.makedirs('static/audio', exist_ok=True)
        with open(audio_filename, 'wb') as audio_file:
            audio_file.write(response.content)
        return audio_filename
    return None

async def get_ai_response(user_message):
    global client, chat
    if not chat:
        chat = await client.connect()
    
    for _ in range(3):  # Try up to 3 times
        try:
            message = await chat.send_message(CHAR_ID, CHAT_ID, user_message)
            return message.text
        except Exception as e:
            print(f"Error getting AI response: {e}")  # Print the error message
            await asyncio.sleep(1)  # Wait before retrying
            chat = await client.connect()  # Reconnect if necessary
    return None

@app.route('/')
def home():
    return render_template('index.html')  # Landing page

@app.route('/about')
def about():
    return render_template('about.html')  # About Us page

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')  # Privacy Policy page

@app.route('/chat')
def chat():
    return render_template('chat.html')  # Chat interface

@app.route('/send_message', methods=['POST'])
async def send_message():
    data = request.json
    user_message = data.get('message')
    audio_enabled = data.get('audio_enabled', True)  # Get audio toggle status

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    ai_response = await get_ai_response(user_message)
    if ai_response:
        audio_url = None
        # Generate audio only if audio is enabled
        if audio_enabled:
            audio_file = generate_audio(ai_response)
            audio_url = audio_file
        
        return jsonify({
            'response': ai_response,
            'audio_url': audio_url
        })
    return jsonify({'error': 'Failed to get AI response'}), 500

if __name__ == '__main__':
    # Initialize the CharacterAI client
    asyncio.run(init_client())
    if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

