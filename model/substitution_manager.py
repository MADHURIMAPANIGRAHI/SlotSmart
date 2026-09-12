import uuid
import numpy as np
from .get_upcoming_slot import Find_next_class
from .get_my_subject import MySubjects
from database import databaseManager

db=databaseManager()
fnc=Find_next_class()
subjects=MySubjects()

class SubstituionManager:
    
    def get_class(self):
        pass

    def manage_sub(self,username,user_id,role,teacher_timetable):
        print(username)
        print(user_id)
        print(role)
        print(teacher_timetable)

class SwapManager:
    def resolve_class(self,current_Class):
        class_data_list=current_Class.split("-")
        year=class_data_list[0]
        branch=class_data_list[1]
        section=class_data_list[2]
        class_name_query="timetable."+year+"-"+branch+"-"+section
        section_tt=db.fetch_section_tt(year,class_name_query)
        return {"Timetable":section_tt}

    def swapper(self,username,user_id,role,teacher_timetable):
        pass

    def request_swap(self,username,user_id,current_Slot,new_Slot,reason,msg):
        curr_Day=current_Slot['day']
        curr_Time=current_Slot['time']
        new_Day=new_Slot['day']
        new_Time=new_Slot['time']
        data={
            "request_Id":uuid.uuid4().hex,
            "username":username,
            "user_id":user_id,
            "curr_Day":curr_Day,
            "curr_Time":curr_Time,
            "new_Day":new_Day,
            "new_Time":new_Time,
            "reason":reason,
            "msg":msg,
            "status":"PENDING"
        }
        db.store_data("substitution_requests",data)
        return {"message":"Raised substituion request successfully"}

    def get_swap_request(self):
        active_Request=db.get_all("substitution_requests")
        return active_Request
    
    def load_swap_dashboard(self,teacher_timetable):
        # subject_Data=subjects.get_subject(teacher_timetable)
        active_Slot=[]
        for r in range(1,teacher_timetable.shape[0]):       # skip header row
            for c in range(1,teacher_timetable.shape[1]):   # skip header column
                if teacher_timetable[r, c] is not None:
                    day=teacher_timetable[r, 0]      # col0 → day name
                    time=teacher_timetable[0, c]     # row0 → time slot
                    time_Slot={
                        "day":day,
                        "time":time
                    }
                    active_Slot.append(time_Slot)
        return active_Slot
        #return {"subject_Data":subject_Data,"empty_Slot":empty_Slot}