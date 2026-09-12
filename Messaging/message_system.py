import requests
from dotenv import load_dotenv
import os
from database import databaseManager
load_dotenv()

api_Key=os.getenv("MSGLET_API")
api_Gmail=os.getenv("API_GMAIL")
Url=os.getenv("URL")
headers={"x-api-key": api_Key,"x-user-mail": api_Gmail}
db=databaseManager()

class Message:
    def generate_dashboard(self):
        student=db.get_unique("student_dataset","Department")
        years=db.get_unique("student_dataset","Year")
        teacher=db.get_unique("teacher_dataset","Department")
        return {"groups": {"student":{"department":student,"years":years},
                           "teacher":teacher}}

    def sender(self,username,sender_Gmail,receiver_Gmail,can_Reply,group,message,subject):
        group_gmails=set()
        for role, value in (group or {}).items():
            if not value:
                gmails=db.get_all(f"{role}_dataset", {}, {"_id": 0, "gmail": 1})
                group_gmails.update([g["gmail"] for g in gmails])
            elif isinstance(value,list):
                gmails=db.get_all(f"{role}_dataset", {"department": {"$in": value}}, {"_id": 0, "gmail": 1})
                group_gmails.update([g["gmail"] for g in gmails])
            elif isinstance(value, dict):
                combined_query={}
                for key, arr in value.items():
                    key=key.capitalize()
                    if not arr:
                        continue
                    combined_query[key]={"$in": arr} if len(arr) > 1 else arr[0]
                gmails=db.get_all(f"{role}_dataset", combined_query, {"_id": 0, "gmail": 1})
                group_gmails.update([g["gmail"] for g in gmails])

        individual_gmails=set(receiver_Gmail or [])
        final_gmails=list(group_gmails | individual_gmails)

        data={
            "username": username,
            "sender_Gmail": sender_Gmail,
            "receiver_Gmail": final_gmails,
            "can_Reply": can_Reply,
            "message": message,
            "subject": subject
        }
        response=requests.post(f"{Url}/send_message", headers=headers, json={"message_Data": data})
        return response.json()
    
    def get_user_messages(self,gmail):
        response=requests.post(f"{Url}/get_messages",headers=headers,json={"gmail":gmail})
        return response.json()

    def reply_msg(self,parent_Msg_Id,username,sender_Gmail,receiver_Gmail,message):
        data={
            "parent_Msg_Id":parent_Msg_Id,
            "username":username,
            "sender_Gmail":sender_Gmail,
            "message":message
        }
        response=requests.post(f"{Url}/reply_message",headers=headers,json={"message_Data":data})
        return response.json()

    def read_msg(self,msg_Id,receiver_Gmail):
        data={
            "msg_Id":msg_Id,
            "receiver_Gmail":receiver_Gmail
        }
        response=requests.post(f"{Url}/read_message",headers=headers,json={"read_Data":data})
        return response.json()

    def soft_delete_msg(self,msg_Id,gmail):
        data={
            "msg_Id":msg_Id,
            "gmail":gmail
        }
        response=requests.post(f"{Url}/soft_delete_message",headers=headers,json={"delete_Data":data})
        return response.json()

    def delete_msg(self,role,msg_Id):
        data={
            "msg_Id":msg_Id,
            "role":role
        }
        response=requests.post(f"{Url}/delete",headers=headers,json={"delete_Data":data})
        return response.json()