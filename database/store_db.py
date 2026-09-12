from pymongo import ReturnDocument
from pymongo.errors import PyMongoError
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

class store_database:
    def store_data(self,collection,data):
        try:
            db=client[db_name]
            if(collection in db.list_collection_names()): #checks if name exists in db
                db[collection].drop() #drops it
            if isinstance(data,list):
                if len(data)==1:
                    db[collection].insert_one(data[0])
                elif len(data)>1:
                    db[collection].insert_many(data)
                else:
                    print("No data to insert")
            else:
                db[collection].insert_one(data) #inserts it back
            print(f"Stored {collection} in Db sucessfully")
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(f"Error in storing {collection}:",e)

    def Add_Update_data(self,collection,data=None,query={}):
        try:
            db=client[db_name]
            db[collection].replace_one(query,data,upsert=True) #find and update data if already exists else adds new
            print(f"Stored {collection} in Db sucessfully")
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(f"Error in storing {collection}:",e)

    def gmail_exists(self,gmail):
        try:
            db=client["Auth"]
            user_info=db["user_info"]
            return user_info.find_one({"gmail":gmail}) is not None
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)
            
    def store_user_data(self,collection,data):
        try:
            db=client["Auth"]
            user_info=db["user_info"]
            session_info=db["session_info"]
            if collection=="user_info":
                user_info.insert_one(data)
                print(f"Stored {collection} in Db sucessfully")
            elif collection=="session_info":
                session_info.insert_one(data)
                print(f"Stored {collection} in Db sucessfully")
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)

    def delete(self,collection_name,query):
        try:
            db=client["Auth"]
            return db[collection_name].delete_one(query)
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)

    def white_list(self,data):
        try:
            db=client["Auth"]
            db["white_list_data"].insert_one(data)
            print("whitelisted successfully")
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)

    def update_whitelist(self,collection,query,gmail,role):
        try:
            db=client[db_name]
            curr_gmail=db[collection].find_one(query,{"_id":0,"gmail":1})["gmail"]
            if curr_gmail!=gmail:
                db2=client["Auth"]
                db2["white_list_data"].find_one_and_update({"gmail":curr_gmail,"role":role},{"$set":{"gmail":gmail}})
                print(f"Updated whitelist successfully")
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)


    def generate_unique_id(self,counter_id):
        try:
            db=client[db_name]
            doc=db["Unique_ids"].find_one_and_update(
            {"_id":counter_id},  #gives id as year+role
            {"$inc":{"seq": 1}}, #inc sequence
            upsert=True, #first insert
            return_document=ReturnDocument.AFTER) #returns the document after insert to fetch sequence
            seq=doc["seq"]
            unique_id=f"{seq:05d}"
            return unique_id
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)

    def delete_data(self,collection_name, query):
        try:
            db=client[db_name]
            return db[collection_name].delete_one(query)
        except PyMongoError as e:
        # DB-level issues (connection, write failure, etc.)
            print(f"[DB ERROR] {e}")
        except Exception as e:
            print(e)