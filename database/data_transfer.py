import pandas as pd
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os

load_dotenv()
username=os.getenv("MONGODB_USER")
password=os.getenv("MONGODB_PASS")
cluster=os.getenv("MONGODB_CLUSTER")
db_name=os.getenv("MONGODB_DB")
app_name=os.getenv("APP_NAME")

username = quote_plus(username)
password = quote_plus(password)

uri=f"mongodb+srv://{username}:{password}@{cluster}.nlnjtju.mongodb.net/?retryWrites=true&w=majority&appName={app_name}"

student_df=pd.read_csv("model/dataset/students_dataset.csv")
teacher_df=pd.read_csv("model/dataset/teachers_dataset.csv")
room_df=pd.read_csv("model/dataset/buildings_rooms_dataset.csv")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    db=client[db_name]

    students_db=db['students_dataset']
    student_dict=student_df.to_dict(orient='records')
    students_db.insert_many(student_dict)

    teachers_db=db['teachers_dataset']
    teacher_dict=teacher_df.to_dict(orient='records')
    teachers_db.insert_many(teacher_dict)

    rooms_db=db['rooms_dataset']
    room_dict=room_df.to_dict(orient='records')
    rooms_db.insert_many(room_dict)

    print("Data transfer completed sucessfully")
except Exception as e:
    print(e)