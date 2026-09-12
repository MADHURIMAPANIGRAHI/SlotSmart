from datetime import datetime,time
import numpy as np
from database import get_database
from model import Data_subjects

db=get_database()
d=Data_subjects()

class Find_next_class:
    def parse_slot(self,slot):
        start,end =slot.split("-") #split start and end time
        start=datetime.strptime(start,"%I:%M%p").time()  #gets start time
        end=datetime.strptime(end,"%I:%M%p").time() #get end time
        return start,end

    def check_timeslot(self,slots,days_list):
        now=datetime.now().time() #get current time
        day=datetime.now().strftime("%A") #get current day
        days_list_clean=[d.strip().capitalize() for d in days_list] #normalize the days
        if day not in days_list_clean: #checks if current day exists
            return False,None,day
        parsed=[(slot,*self.parse_slot(slot)) for slot in slots] #gets timeslots
        for slot,start,end in parsed:
            if start<=now<=end: #checks if current time
                return True,slot,day
        for slot,start,_ in parsed:
            if start>now:
                return True,slot,day    
        return False,None,day  # no upcoming slot today
    
    def next_class_is(self,teacher_t):
        time_slot=teacher_t[0,1:]
        days_list=teacher_t[1:,0]
        status,curr_timeslot,day=self.check_timeslot(time_slot,days_list) #checks current time exists within slot and return current time and day if exists
        upcoming_class={}
        subject=None
        class_data=None
        room_no=None
        timeslot=None
        if(not status):
            if timeslot==None:
                upcoming_class={
                    "status":"No classes today",
                    "subject":subject,
                    "time_slot":timeslot,
                    "class_data":class_data,
                    "room_no":room_no
                }
        else:
            r1=np.where(teacher_t[1:,0]==day)[0][0]+1  #checks row
            r2=np.where(teacher_t[0,1:]==curr_timeslot)[0][0]+1 #gets col
            flag=True
            for col in range(r2,teacher_t.shape[1]): #iterate over col till any None empty slot is found
                if teacher_t[r1,col]!=None:
                    subject=teacher_t[r1,col]
                    sub_split=subject.split("-") #split
                    l=len(sub_split) 
                    class_data="-".join(sub_split[0:l-1]) #get class info
                    subject=sub_split[l-1] #get subject name
                    timeslot=teacher_t[0,col] #get timeslot where class was found
                    flag=False
                    break
            if flag: #if no classes found
                upcoming_class={
                    "status":"No classes today",
                    "subject":subject,
                    "time_slot":None,
                    "class_data":class_data,
                    "room_no":None
            }
            else: #if classes found
                is_behind = datetime.now().time() < datetime.strptime(timeslot.split("-")[0], "%I:%M%p").time()
                status="Current class" if (curr_timeslot==timeslot and not is_behind) else "Upcoming class"
                upcoming_class={
                        "status":status,
                        "subject":subject,
                        "time_slot":timeslot,
                        "class_data":class_data,
                        "room_no":room_no
                }
        return upcoming_class
    
    def next_class_student(self,timetable,year,branch):
        Subject_data=db.fetch_generate_data("Subject_data")[0]["Subject_data"]
        time_slot=timetable[0,1:]
        days_list=timetable[1:,0]
        status,curr_timeslot,day=self.check_timeslot(time_slot,days_list) #checks current time exists within slot and return current time and day if exists
        upcoming_class={}
        subject=None
        room_no=None
        timeslot=None
        teacher=None
        if(not status):
            if timeslot==None:
                upcoming_class={
                    "status":"No classes today",
                    "subject":subject,
                    "time_slot":timeslot,
                    "room_no":room_no,
                    "teacher":teacher
                }
        else:
            r1=np.where(timetable[1:,0]==day)[0][0]+1  #checks row
            r2=np.where(timetable[0,1:]==curr_timeslot)[0][0]+1 #gets col
            flag=True
            for col in range(r2,timetable.shape[1]): #iterate over col till any None empty slot is found
                if timetable[r1,col]!=None:
                    subject=timetable[r1,col]
                    if not d.check_subject(year,branch,subject,Subject_data): #checks if an subject
                        continue
                    timeslot=timetable[0,col] #get timeslot where class was found
                    flag=False
                    break
            if flag: #if no classes found or not a subject
                upcoming_class={
                    "status":"No classes today",
                    "subject":subject,
                    "time_slot":None,
                    "room_no":None,
                    "teacher":None
            }
            else: #if classes found
                is_behind = datetime.now().time() < datetime.strptime(timeslot.split("-")[0], "%I:%M%p").time()
                status="Current class" if (curr_timeslot==timeslot and not is_behind) else "Upcoming class"
                upcoming_class={
                        "status":status,
                        "subject":subject,
                        "time_slot":timeslot,
                        "room_no":room_no,
                        "teacher":teacher
                }
        return upcoming_class