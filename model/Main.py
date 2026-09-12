from .Timetable_Maker_new import Timetable_gen
from .Mapping import Map
from .Data_Storage import Data_subjects
import pickle

class Main:

    def Initalize(self,year,working_hrs): #getting all the empty data,timetable and mapping
        global y_b_s,teacher_t,room_t,teacher_map,room_map
        y_b_s={}
        teacher_t={}
        room_t={}
        teacher_map={}
        room_map={}
        m=Map()
        m.data_setup(year)
        y_b_s=m.gen_empty_section(working_hrs)
        teacher_t=m.gen_empty_teacher(year,teacher_t)
        room_t=m.gen_empty_room(year,room_t)
        teacher_map=m.teacher_sec_mapper(year)
        room_map=m.room_sec_mapper()
    
    def generate(self,year,constraints,common_subject):
        d=Data_subjects() #get all the subjects
        T=Timetable_gen()
        subjects_detail=d.subject_data()
        if constraints:
            for constraint in constraints:
                T.setfixedslots(year,y_b_s,constraint)
        if common_subject:
            T.assigncommonslot(common_subject,year,teacher_map,teacher_t,subjects_detail,y_b_s)
            d.update_dataset(year,subjects_detail,common_subject)
        for year,branches in y_b_s.items():
            for branch,sections in branches.items():
                for sec,timetable in sections.items():
                    section=sec
                    subjects=subjects_detail[year][branch] #selects theory subjects
                    for Type,sub_list in subjects.items():
                        T.Make_Timetable(year,branch,Type,section,sub_list,teacher_map,y_b_s,teacher_t,
                                         room_map,room_t) #generates timetable           

    def store(self): #saves generated timetable
        m=Map()
        m.save_sec_tt()
        m.save_teacher_tt(teacher_t)
        m.save_room_tt(room_t)
        with open("y_b_s.pkl","wb") as f:
            pickle.dump(y_b_s,f,protocol=pickle.HIGHEST_PROTOCOL)
        with open("teacher_t.pkl","wb") as f:
            pickle.dump(teacher_t,f,protocol=pickle.HIGHEST_PROTOCOL)
        with open("room_t.pkl","wb") as f:
            pickle.dump(room_t,f,protocol=pickle.HIGHEST_PROTOCOL)
        with open("teacher_map.pkl","wb") as f:
            pickle.dump(teacher_map,f,protocol=pickle.HIGHEST_PROTOCOL)
        with open("room_map.pkl","wb") as f:
            pickle.dump(room_map,f,protocol=pickle.HIGHEST_PROTOCOL)

#TODO->add logic for handling grouped slots(example-3hrs lab must be in 3 continous slot, 3hrs session,etc)