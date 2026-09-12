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

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

class get_database:
    def fetch_data(self,dataset):
        try:
            db=client[db_name] #accesses the db
            data_db=db[dataset] #accesses the particular collection
            data=list(data_db.find({},{"_id":0})) #fetches everything
            data_df=pd.DataFrame(data)
            return data_df
        except Exception as e:
            print(e)

    def fetch_classes(self,dataset,year):
        try:
            db=client[db_name]
            data_db=db[dataset]
            data=list(data_db.find({"Year":year},{"_id":0}))  #filter and fetches only particular year
            data_df=pd.DataFrame(data)
            return data_df
        except Exception as e:
            print(e)

    def fetch_map(self,dataset):
        try:
            db=client[db_name]
            data_db=db[dataset]
            data=list(data_db.find({},{"_id":0}))
            return data[0]
        except Exception as e:
            print(e)
        
    def if_exists(self,collection):
        try:
            db=client[db_name]
            if collection in db.list_collection_names():
                return True
            else:
                return False
        except Exception as e:
            print(e)

    def fetch_generate_data(self,collection,query=None,projection={"_id":0}):
        try:
            db=client[db_name]
            data_db=db[collection]
            if not query:
                data=list(data_db.find({},projection))
                return data
            else:
                data=data_db.find_one(query,projection)
                return data
        except Exception as e:
            print(e)

    def fetch_user_data(self,collection,query,projection=None):
        try:
            db=client["Auth"]
            user_info=db["user_info"]
            session_info=db["session_info"]
            if collection=="user_info":
                return user_info.find_one(query,projection)
            elif collection=="session_info":
                return session_info.find_one(query)
        except Exception as e:
            print(e)

    def if_exists_cat(self,collection,query):
        try:
            db=client[db_name]
            data=db[collection]
            return data.count_documents(query,limit=1)>0
        except Exception as e:
            print(e)