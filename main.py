from atproto import Client
import requests
import dotenv
import os

dotenv.load_dotenv()

email = os.getenv("BLUESKY_EMAIL")
password = os.getenv("BLUESKY_PASSWORD")

client = Client()
client.login(email, password)