import requests
from dotenv import load_dotenv
import os
load_dotenv()

Url=os.getenv("URL")
api_Key=os.getenv("MSGLET_API")
api_Gmail=os.getenv("API_GMAIL")
headers={"x-api-key": api_Key,"x-user-mail": api_Gmail}

class Notification:
    def get_notification(self,gmail):
        response=requests.post(f"{Url}/get_notification",headers=headers,json={"gmail":gmail})
        return response.json()