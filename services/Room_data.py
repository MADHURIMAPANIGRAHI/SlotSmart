from database import store_database,get_database

db=store_database()
db2=get_database()

class RoomManager:
    def AddRoom(self,Building,Floor,Room,Type,Capacity,Lab_type,Workload):
        data={
            "Building":Building,
            "Floor":Floor,
            "Room":Room,
            "Type":Type,
            "Capacity":Capacity,
            "Lab Type":Lab_type,
            "Workload":Workload
        }
        db.Add_Update_data("rooms_dataset",data,{"Building":data["Building"],"Room":data["Room"]})
    def UpdateRoom(self,Building,Floor,Room,Type,Capacity,Lab_type,Workload):
        data={
            "Building":Building,
            "Floor":Floor,
            "Room":Room,
            "Type":Type,
            "Capacity":Capacity,
            "Lab Type":Lab_type,
            "Workload":Workload
        }
        db.Add_Update_data("rooms_dataset",data,{"Building":data["Building"],"Room":data["Room"]})

    def DeleteRoom(self,Building,Room):
        query={"Building":Building,"Room":Room}
        db.delete_data("rooms_dataset",query)