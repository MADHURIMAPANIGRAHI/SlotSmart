import pickle
import numpy as np
from database import store_database,get_database
from .Data_Storage import Data_subjects

class Create_json:
    def make_json_class(self,collection_name,y_s_b):
        db=store_database()
        json_ready={}
        for year,branches in y_s_b.items(): #makes json to store similar to teacher json
            for branch,sections in branches.items():
                for section, time_table in sections.items():
                    json_ready[f"{year}-{branch}-{section}"]=(time_table.tolist() if isinstance(time_table, np.ndarray) else time_table)
        db.store_data(collection_name,json_ready)   

    def make_json(self,collection_name,data):
        db=store_database()
        json_ready = {name: time_table.tolist() if isinstance(time_table, np.ndarray) 
                        else time_table for name,time_table in data.items()}
        db.store_data(collection_name,json_ready)

    def revert_json(self,collection_name):
        db=get_database()
        json_ready=db.fetch_map(collection_name)
        timetable_numpy = {name: np.array(time_table) for name, time_table in json_ready.items()}
        return timetable_numpy

    def generate_json(self):
        db=store_database()
        db2=get_database()
        d=Data_subjects()
        cursor=db2.fetch_generate_data("teacher_dataset",None,{"_id": 0,"Name": 1,"Designation":1,"TeacherID":1})
        id_username_map={doc["TeacherID"]: f"{doc["Designation"]} {doc["Name"]}" for doc in cursor } #maps all Id to their corresponding names
        all_subject_data=d.subject_data()
        with open("y_b_s.pkl","rb") as f, open("teacher_map.pkl","rb") as f1, open("room_map.pkl","rb") as f2, open("teacher_t.pkl","rb") as f3, open("room_t.pkl","rb") as f4:  #loads all the pickle files
                y_b_s=pickle.load(f)
                teacher_map=pickle.load(f1)
                room_map=pickle.load(f2)
                teacher_t=pickle.load(f3)
                room_t=pickle.load(f4)
                json_timetable={"timetable":{}}
                for year,branches in y_b_s.items():
                        json_timetable={"timetable":{}}  #create parent dict for each year
                        for branch,sections in branches.items():
                                for section,timetable in sections.items():
                                        timeslots=timetable[0,1:]  #gets all timeslots from row 0
                                        class_name=year+"-"+branch+"-"+section
                                        json_timetable["timetable"][class_name]=[] #makes a list to store day and year
                                        for row in timetable[1:]: #starts iteration one row at a time from row2
                                                day=row[0]          #takes 0th index row day
                                                schedule={} #makes empty schedule dict
                                                for col_idx, slot in enumerate(timeslots):  #Loops over all slots
                                                    subject = row[col_idx + 1] #+1 to start from 2nd col(1st col is days)
                                                    if subject is not None:  #checks if subject is present at that slot
                                                        if d.check_subject(year,branch,subject,all_subject_data): #checks if subject is actual subject
                                                            if("Lab" in subject):
                                                                Type="Lab"
                                                            else:
                                                                Type="Theory"
                                                            #finds teacher and room_no for that particular class and subject
                                                            room_no=room_map[year][branch][Type][section]  
                                                            teacher=teacher_map[year][branch][section][subject]
                                                        else:
                                                            #if not a subject, just assign slot and not room no
                                                            teacher=None
                                                            room_no=None
                                                        if(teacher):
                                                            teacher_id_val = teacher 
                                                            teacher=id_username_map[teacher]
                                                        schedule[slot]={"subject":subject,"teacher":teacher,"teacher_id":teacher_id_val,"room":room_no}
                                                    else:
                                                        #set empty for None locations
                                                        schedule[slot]={"subject":None,"teacher":None,"room":None}
                                                #append both day and schedule to particular class
                                                json_timetable['timetable'][class_name].append({"day":day,"schedule":schedule}) 
                        #store in db 
                        db.store_data(f"Timetable_{year}",json_timetable) 
                        year=next(iter(room_map))
                        room_map_db=room_map[year]
                        teacher_map_db=teacher_map[year]
                        db.Add_Update_data("Room_Map",{"year":year,"data":room_map_db},{"year":year})
                        db.Add_Update_data("Teacher_Map",{"year":year,"data":teacher_map_db},{"year":year})
                        self.make_json(f'teacher_t',teacher_t)
                        self.make_json(f'room_t',room_t)
                        self.make_json_class(f"Timetable_raw_{year}",y_b_s)

    def teacher_json(self,teacher_id,collection):
        data=self.revert_json(collection)
        teacher_t=data[teacher_id]
        db=get_database()
        teacher_name=db.fetch_generate_data("teacher_dataset",{"TeacherID":teacher_id},{"_id":0,"Name":1,"Designation":1})
        teacher_name=f"{teacher_name["Designation"]} {teacher_name["Name"]}"
        json_timetable={"timetable":{}} #create parent dict
        timeslots=teacher_t[0,1:]  #gets all timeslots from row 0
        json_timetable["timetable"][teacher_name]=[] #makes a list to store day and year
        for row in teacher_t[1:]: #starts iteration one row at a time from row2
                day=row[0]          #takes 0th index row day
                schedule={} #makes empty schedule dict
                for col_idx, slot in enumerate(timeslots):  #Loops over all slots
                    subject = row[col_idx + 1] #+1 to start from 2nd col(1st col is days)
                    if subject is not None:  #checks if subject is present at that slot
                        subject_list=subject.split("-") #splits the year-branch-section-subject into list
                        Year=subject_list[0]
                        Branch=subject_list[1]
                        Section=subject_list[2]
                        subject=subject_list[3]
                        room_map=db.fetch_generate_data("Room_Map",{"year":Year},{"_id":0,"data":1})
                        if("Lab" in subject):
                            Type="Lab"
                        else:
                            Type="Theory"
                        class_info=f"{Year}-{Branch}-{Section}"
                        #finds teacher and room_no for that particular class and subject
                        room_no=room_map["data"][Branch][Type][Section]  
                        #TODO Update for common subject
                        schedule[slot]={"subject":subject,"Sec":class_info,"room":room_no}  #TODO Room No
                    else:
                        #set empty for None locations
                        schedule[slot]={"subject":None,"Sec":None,"room":None}
                #append both day and schedule to particular class
                json_timetable['timetable'][teacher_name].append({"day":day,"schedule":schedule}) 
        return json_timetable,teacher_t