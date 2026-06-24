import pyttsx3
import speech_recognition as sr
import requests
import json
import os

OLLAMA_HOST = os.environ.get('OLLAMA_HOST', '127.0.0.1:11434')
MODEL = 'gemma2:9b'

def init_engine():
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    for voice in voices:
        if 'german' in voice.name.lower() or 'de' in voice.languages:
            engine.setProperty('voice', voice.id)
            break
    engine.setProperty('rate', 170)
    return engine

engine = init_engine()

def speak(text):
    print(f"\n🤖 Voicebox (Gemma2): {text}")
    engine.say(text)
    engine.runAndWait()

def listen():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("\n🎤 Zuhören... (Sprich jetzt)")
        r.adjust_for_ambient_noise(source)
        try:
            audio = r.listen(source, timeout=5, phrase_time_limit=10)
        except sr.WaitTimeoutError:
            return ""
    try:
        text = r.recognize_google(audio, language="de-DE")
        print(f"👤 Du: {text}")
        return text
    except sr.UnknownValueError:
        return ""
    except sr.RequestError as e:
        print(f"❌ Spracherkennungs-Fehler: {e}")
        return ""

def ask_ollama(prompt):
    url = f"http://{OLLAMA_HOST}/api/generate"
    data = {
        "model": MODEL,
        "prompt": "Du bist der DEVKiTZ Voice Assistant. Antworte extrem kurz, präzise und auf Deutsch. Keine Romane. Frage: " + prompt,
        "stream": False
    }
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            return response.json().get('response', '')
        return "Ich konnte das Ollama Backend nicht erreichen."
    except Exception as e:
        return "Ein Fehler ist aufgetreten."

def main():
    print("===========================================")
    print("🎙️ DEVKiTZ Voicebox gestartet")
    print("Modell: " + MODEL)
    print("===========================================")
    speak("Voicebox online. Ich höre zu.")
    
    while True:
        text = listen()
        if text:
            if "beenden" in text.lower() or "tschüss" in text.lower() or "exit" in text.lower():
                speak("Voicebox wird beendet. Bis bald!")
                break
            
            response = ask_ollama(text)
            speak(response)

if __name__ == "__main__":
    main()
