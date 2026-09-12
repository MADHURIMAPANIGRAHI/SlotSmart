from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os
load_dotenv()

class section_tt:
    def fetch_data(self,year,class_name="timetable"):
        username=os.getenv("MONGODB_USER")
        password=os.getenv("MONGODB_PASS")
        cluster=os.getenv("MONGODB_CLUSTER")
        db_name=os.getenv("MONGODB_DB")
        app_name=os.getenv("APP_NAME")

        username = quote_plus(username)
        password = quote_plus(password)

        uri=f"mongodb+srv://{username}:{password}@{cluster}.nlnjtju.mongodb.net/?retryWrites=true&w=majority&appName={app_name}"

        # Create a new client and connect to the server
        client = MongoClient(uri, server_api=ServerApi('1'))
        try:
            db = client[db_name]
            filter_data = {f"{class_name}": 1, "_id": 0}
            result = list(db[f'Timetable_{year}'].find({}, filter_data))
            timetable = result[0]

            # Strip teacher_id from every slot before returning
            for class_days in timetable.get("timetable", {}).values():
                for day_entry in class_days:
                    for slot in day_entry["schedule"].values():
                        slot.pop("teacher_id", None)
            return timetable
        except Exception as e:
            print("Section_tt",e)