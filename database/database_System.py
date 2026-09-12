from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os
from datetime import datetime, timezone
from bson import ObjectId
load_dotenv()

username=os.getenv("MONGODB_USER")
password=os.getenv("MONGODB_PASS")
cluster=os.getenv("MONGODB_CLUSTER")
db_name=os.getenv("MONGODB_DB")
app_name=os.getenv("APP_NAME")

username=quote_plus(username)
password=quote_plus(password)

uri=f"mongodb+srv://{username}:{password}@{cluster}.nlnjtju.mongodb.net/?retryWrites=true&w=majority&appName={app_name}"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

class databaseManager:
    def get_data_one(self,collection,query={},projection={"_id":0}):
        try:
            db=client[db_name] #accesses the db
            collection_data=db[collection] #accesses the particular collection
            data=collection_data.find_one(query,projection)
            return data
        except Exception as e:
            print(e)
        
    def get_all(self,collection,query={},projection={"_id":0}):
        try:
            db=client[db_name]
            collection_data=db[collection]
            data=collection_data.find(query,projection)
            return list(data)
        except Exception as e:
            print(e)

    def fetch_section_tt(self,year,class_name="timetable"):
        try:
            db=client[db_name]
            filter_data={f"{class_name}": 1, "_id": 0}  #returns default entire timetable, or particular(timetable.val) values if passed
            collection_data=db[f'Timetable_{year}']
            result = list(collection_data.find({},filter_data))
            timetable=result[0]
            return timetable  
        except Exception as e:
            print(e)

    def get_unique(self,collection_name,field):
        db=client[db_name]
        return db[collection_name].distinct(field)

    def store_data(self,collection,data):
        try:
            db=client[db_name]
            collection_name=db[collection]
            if isinstance(data,dict):
                collection_name.insert_one(data)
            elif isinstance(data,list):
                collection_name.insert_many(data)
            else:
                raise TypeError("Data must be dict or list")
        except Exception as e:
            return e

    def get_teacher_timetable(self, teacher_id: str):
        """Return the 2D grid array for one teacher from the single teacher_t document."""
        db = client[db_name]
        doc = db["teacher_t"].find_one({}, {teacher_id: 1, "_id": 1})
        if not doc:
            return None
        return doc.get(teacher_id)

    def update_teacher_slot(self, teacher_id: str, day: str, slot_index: int, value):
        """Update a single cell in a teacher's grid inside teacher_t."""
        db = client[db_name]
        doc = db["teacher_t"].find_one({}, {"_id": 1, teacher_id: 1})
        if not doc:
            return
        grid = doc.get(teacher_id)
        if not grid:
            return
        for row in grid:
            if row[0] == day:
                row[slot_index] = value
                break
        db["teacher_t"].update_one(
            {"_id": doc["_id"]},
            {"$set": {teacher_id: grid}}
        )

    # ── Class timetable ──

    def get_class_timetable(self, year: int):
        """Return the full Timetable_{year} document."""
        db = client[db_name]
        return db[f"Timetable_Year {year}"].find_one({}, {"_id": 0})

    def update_class_slot(self, year: int, class_key: str, day: str,
                           time_slot: str, subject, teacher, teacher_id, room):
        """Update a single slot in Timetable_{year} for a given class, day, and time."""
        db = client[db_name]
        col = db[f"Timetable_Year {year}"]
        doc = col.find_one({})
        if not doc:
            return
        class_days = doc.get("timetable", {}).get(class_key, [])
        for day_entry in class_days:
            if day_entry.get("day") == day:
                day_entry["schedule"][time_slot] = {
                "subject": subject,
                "teacher": teacher,
                "teacher_id": teacher_id,
                "room": room
            }
                break
        col.update_one(
            {"_id": doc["_id"]},
            {"$set": {f"timetable.{class_key}": class_days}}
        )

    # ── Teacher dataset ──

    def get_teacher_by_id(self, teacher_id: str):
        """Fetch a teacher document by TeacherID."""
        db = client[db_name]
        return db["teacher_dataset"].find_one(
            {"TeacherID": teacher_id},
            {"_id": 0}
        )

    # ── Students ──

    def get_students_of_class(self, year: int, dept: str, section: str):
        """Fetch all students in a class for notification purposes."""
        db = client[db_name]
        return list(db["student_dataset"].find(
            {"Year": year, "Department": dept, "Section": section},
            {"_id": 0, "gmail": 1, "Name": 1, "RollNo": 1}
        ))

    # ── Replacement requests ──

    def create_replacement_request(self, doc: dict) -> str:
        """Insert a replacement request document. Returns the _id as string."""
        db = client[db_name]
        result = db["replacement_requests"].insert_one(doc)
        return str(result.inserted_id)

    def get_replacement_request(self, request_id: str) -> dict:
        """Fetch a replacement request by ObjectId string."""
        db = client[db_name]
        doc = db["replacement_requests"].find_one({"_id": ObjectId(request_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    def update_replacement_request(self, request_id: str, fields: dict):
        """Partial update on a replacement request."""
        db = client[db_name]
        fields["updated_at"] = datetime.now(timezone.utc)
        db["replacement_requests"].update_one(
            {"_id": ObjectId(request_id)},
            {"$set": fields}
        )

    def has_active_request(self, teacher_id: str) -> bool:
        """True if teacher has a draft/pending/awaiting request."""
        db = client[db_name]
        return db["replacement_requests"].find_one({
            "requester.teacher_id": teacher_id,
            "status": {"$in": ["draft", "pending_teacher", "awaiting_admin"]}
        }) is not None

    def get_requests_dashboard(self, teacher_id: str = None) -> list:
        """
        All active requests. If fewer than 5, pad with most recent closed ones.
        Scoped to teacher if teacher_id provided, else all (admin view).
        """
        db = client[db_name]
        col = db["replacement_requests"]

        def serialize(docs):
            for d in docs:
                d["_id"] = str(d["_id"])
            return docs

        base = {}
        if teacher_id:
            base["$or"] = [
                {"requester.teacher_id": teacher_id},
                {"involved_teacher.teacher_id": teacher_id}
            ]

        active = serialize(list(col.find(
            {**base, "status": {"$in": ["draft", "pending_teacher", "awaiting_admin"]}},
        ).sort("created_at", -1)))

        if len(active) < 5:
            closed = serialize(list(col.find(
                {**base, "status": {"$in": ["approved", "rejected"]}}
            ).sort("updated_at", -1).limit(5 - len(active))))
            active = active + closed

        return active

    def get_room_timetable(self, room_id: str):
        db = client[db_name]
        doc = db["room_t"].find_one({}, {room_id: 1, "_id": 1})
        if not doc:
            return None
        return doc.get(room_id)

    def update_room_slot(self, room_id: str, day: str, slot_index: int, value):
        db = client[db_name]
        doc = db["room_t"].find_one({}, {"_id": 1, room_id: 1})
        if not doc:
            return
        grid = doc.get(room_id)
        if not grid:
            return
        for row in grid:
            if row[0] == day:
                row[slot_index] = value
                break
        db["room_t"].update_one(
            {"_id": doc["_id"]},
            {"$set": {room_id: grid}}
        )

    def get_slots_for_class(self, shift_key: str):
        db = client[db_name]
        doc = db["Slots"].find_one({}, {"_id": 0})
        if not doc:
            return None
        return doc["Slots"].get(shift_key, {}).get("Slots")
    
    def update_raw_timetable_slot(self, year: int, class_key: str, day: str, 
                               slot_index: int, value):
        db = client[db_name]
        col = db[f"Timetable_raw_Year {year}"]
        doc = col.find_one({}, {"_id": 1, class_key: 1})
        if not doc:
            return
        grid = doc.get(class_key)
        if not grid:
            return
        for row in grid:
            if row[0] == day:
                row[slot_index] = value
                break
        col.update_one(
            {"_id": doc["_id"]},
            {"$set": {class_key: grid}}
        )
    
    # ── Leave requests ──

    def create_leave_request(self, doc: dict) -> str:
        """Insert a leave request document. Returns the _id as string."""
        db = client[db_name]
        result = db["leave_requests"].insert_one(doc)
        return str(result.inserted_id)

    def get_leave_request(self, request_id: str) -> dict:
        """Fetch a leave request by ObjectId string."""
        db = client[db_name]
        doc = db["leave_requests"].find_one({"_id": ObjectId(request_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    def update_leave_request(self, request_id: str, fields: dict):
        """Partial update on a leave request."""
        db = client[db_name]
        db["leave_requests"].update_one(
            {"_id": ObjectId(request_id)},
            {"$set": fields}
        )

    def get_leave_requests_by_query(self, query: dict) -> list:
        """Fetch leave requests matching a query. Returns list with _id as string."""
        db = client[db_name]
        docs = list(db["leave_requests"].find(query))
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs

    # ── Leave sub slots ──

    def create_sub_slot(self, doc: dict) -> str:
        """Insert a leave sub slot document. Returns the _id as string."""
        db = client[db_name]
        result = db["leave_sub_slots"].insert_one(doc)
        return str(result.inserted_id)

    def get_sub_slot(self, sub_slot_id: str) -> dict:
        """Fetch a sub slot by ObjectId string."""
        db = client[db_name]
        doc = db["leave_sub_slots"].find_one({"_id": ObjectId(sub_slot_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    def update_sub_slot(self, sub_slot_id: str, fields: dict):
        """Partial update on a single sub slot."""
        db = client[db_name]
        db["leave_sub_slots"].update_one(
            {"_id": ObjectId(sub_slot_id)},
            {"$set": fields}
        )

    def cancel_all_sub_slots_for_leave(self, leave_request_id: str):
        """Bulk cancel all sub slots belonging to a leave request."""
        db = client[db_name]
        db["leave_sub_slots"].update_many(
            {"leave_request_id": leave_request_id},
            {"$set": {"status": "cancelled"}}
        )

    def get_sub_slots_by_query(self, query: dict) -> list:
        """Fetch sub slots matching a query. Returns list with _id as string."""
        db = client[db_name]
        docs = list(db["leave_sub_slots"].find(query))
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs

    # ── Subject data ──

    def get_subject_data(self) -> dict:
        """Fetch the full Subject_data document."""
        db = client[db_name]
        doc = db["Subject_data"].find_one({}, {"_id": 0})
        return doc.get("Subject_data", {}) if doc else {}

    # ── Slots (raw, for leave time matching) ──

    def get_all_slot_keys(self) -> list:
        """
        Returns sorted list of all unique individual slot strings across all shifts.
        e.g. ["07:30AM-08:30AM", "08:40AM-09:40AM", ...]
        """
        db = client[db_name]
        doc = db["Slots"].find_one({}, {"_id": 0})
        if not doc:
            return []
        seen = set()
        slots = []
        for shift_data in doc.get("Slots", {}).values():
            for slot in shift_data.get("Slots", []):
                if slot not in seen:
                    seen.add(slot)
                    slots.append(slot)
        def slot_start(s): 
            return datetime.strptime(s.split("-")[0], "%I:%M%p")
        return sorted(slots, key=slot_start)