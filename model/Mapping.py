import pandas as pd
import re
import numpy as np
import string
from .Data_Storage import Data_subjects
from .Teacher_Timetable import Teachers
from .ClassRoom_Timetable import ClassRoom
from database import get_database,store_database
from .Data_preprocessing import Preprocessor
from .json_swapper import Create_json

class Map:
    def generate_schedule_class(self,working_hrs):
        db=get_database()
        Slots=db.fetch_generate_data("Slots")
        slot_data=Slots[0]["Slots"][working_hrs]
        time_slot=slot_data["Slots"]
        days=slot_data["Days"]
        time_slot.insert(0,"")
        days.insert(0,"Day/Time")
        l1=len(days)
        l2=len(time_slot)
        timetable=np.full([l1,l2],None) #create a class hrs* week day size array
        timetable[0]=time_slot #assigns time slots to row 0
        timetable[:,0]=days #assigns days to columns1
        return timetable
    
    def data_setup(self,year):
        global df_building,df_student,df_teacher,res_df,y_b_s,b_s,s_t,teacher_t,room_t,teacher_map,room_map
        y_b_s={}
        b_s={}
        s_t={}
        teacher_t={}
        room_t={}
        teacher_map={}
        room_map={}
        #data input 
        data_set=get_database()
        pre_process=Preprocessor()
        df_building=data_set.fetch_data("rooms_dataset")
        df_student=data_set.fetch_classes("student_dataset",year)
        df_teacher=data_set.fetch_data("teacher_dataset")

        #Split subjects into corresponding new columns
        new_df_teacher=df_teacher['Subject'].str.split(',',expand=True)
        new_df_teacher.columns=[f"Subject{i+1}" for i in new_df_teacher.columns] #assigns columns names as Subject1,2,3
        df_teacher=pd.concat([df_teacher,new_df_teacher],axis=1) #merges the two df
        pre_process.update_workload(df_teacher,year,f"Teacher_Map")  #updates teacher's workload
        pre_process.update_classload(df_building,year,"Room_Map")   #updates room's workload
        df_building=df_building.sort_values(by=['Building','Type','Room']).reset_index(drop=True) #arranges based on building followed by class/lab
        #groups based on year and dept and gets all sections data, applies grouping of unique sections into 1 group
        res_df=df_student.groupby(['Year','Department'])['Section'].apply(lambda x: ",".join(sorted(x.unique()))).reset_index()
        res_dict=res_df.to_dict("records")
        self.student_data(res_dict,"student_info")
        
    def student_data(self,student_data,student_info):
        db=get_database()
        db2=store_database()
        if db.if_exists(student_info): #checks for existing data
            student_d=db.fetch_map(student_info)
        else:
            student_d={}
        for year_data in student_data: #loops over each record and gets data respective to keys
            year=year_data['Year'] 
            dept=year_data['Department']
            sections =year_data['Section'].split(",")
            if year not in student_d:
                student_d[year]={} #create new dict if new data
            student_d[year][dept]=sections #override existing data
        db2.store_data(student_info,student_d)
    
    def gen_empty_section(self,working_hrs):
        res_df_student=res_df.copy()
        res_df_student["Section"]=res_df_student["Section"].str.split(',') #ensures the given column is in list format
        res=res_df_student[["Year","Department","Section"]].values.tolist() #Generates a list of [year,dept,sec] 
        for r in res:
            s_t={} #select one year,branch,section
            for sec in r[2]:
                s_t[sec]=self.generate_schedule_class(working_hrs) #generates timetable for each section of corresponding branch for each year
            if r[0] not in y_b_s:
                y_b_s[r[0]]={} #creates a year dict
            y_b_s[r[0]][r[1]]=s_t  #assigns all the section timetable to corresponding year and branch
        return y_b_s
        
    def save_sec_tt(self,file_path="student_timetable.csv"): #stores section timetable based on year-branch-sections
        mode='w'
        with open(file_path,mode) as f:
            for year,branches in y_b_s.items():
                f.write(f"Year-{year}:\n")
                for branch,sections in branches.items():
                    f.write(f"Branch-{branch}:\n\n")
                    for sec,timetable in sections.items():
                        f.write(f"Section-{sec}:\n")
                        df=pd.DataFrame(timetable)
                        df.to_csv(f, index=False, header=False, lineterminator="\n")
                        f.write("\n")
                        
        print("Student timetable generated sucessfully-student_timetable.csv")

    def gen_empty_teacher(self,year,teacher_t): #creates empty timetable for each teacher's unique ID
        db=get_database()
        C=Create_json()
        P=Preprocessor()
        if(db.if_exists("teacher_t")):
            teacher_t=C.revert_json("teacher_t")
            P.update_slot(teacher_t,year)
            return teacher_t
        else:
            t=Teachers()
            for idx,row in df_teacher.iterrows():
                teacher_t[row['TeacherID']]=t.generate_schedule()
            return teacher_t
    
    def save_teacher_tt(self,teacher_t,file_path="teacher_timetable.csv"): #stores teacher's timetable
        mode="w"
        with open(file_path,mode) as f:
            for teacher,timetable in teacher_t.items():
                f.write(f"Teacher-{teacher}:\n")
                df=pd.DataFrame(timetable)
                df.to_csv(f, index=False, header=False, lineterminator="\n")
                f.write("\n")
        print("Teacher timetable generated sucessfully-teacher_timetable.csv")

    def gen_empty_room(self,year,room_t):  #creates empty timetable for each room's unique ID
        db=get_database()
        C=Create_json()
        P=Preprocessor()
        if(db.if_exists("room_t")):
            room_t=C.revert_json("room_t")
            P.update_slot(room_t,year)
            return room_t
        else:
            c=ClassRoom()
            for idx,Room_no in df_building.iterrows():
                room_t[Room_no['Room']]=c.generate_schedule()
            return room_t
            
    def save_room_tt(self,room_t,file_path="room_timetable.csv"): #stores room's timetable
        mode="w"
        with open(file_path,mode) as f:
            for room,timetable in room_t.items():
                f.write(f"Room-{room}:\n")
                df=pd.DataFrame(timetable)
                df.to_csv(f, index=False, header=False, lineterminator="\n")
                f.write("\n")
        print("Room timetable generated sucessfully-room_timetable.csv")
                
    def teacher_sec_mapper(self,year):
        TT=Teachers()
        db=store_database()
        res_df_teacher=res_df.copy() #creates duplicate for main to ensure consistency
        res_df_teacher["Section"]=res_df_teacher["Section"].str.split(',') #ensures the given column is in list format
        cols_to_search=df_teacher.columns[df_teacher.columns.get_loc('Workload') + 1:len(df_teacher.columns)] #ensures on subject1-n col selected
        d=Data_subjects()  #gets all subjects
        subject_dataset=d.subject_data()
        branches=subject_dataset[year]
        for branch,Type in branches.items():
            #filters to get all sections by year and branch
            sections=res_df.loc[(res_df['Year']==year) & (res_df['Department']==branch),'Section'].values.tolist()  
            for cat,subj in Type.items():
                if cat=='Lab':
                    for sub in subj:
                        search_sub=sub
                        search_sub2=sub.replace("Lab","").strip()  #filters only the subject name
                        # Strip spaces and check equality
                        mask=(df_teacher[cols_to_search].apply(lambda col:col.str.strip().str.lower().str.contains(search_sub2.lower(),na=False))).any(axis=1)
                        #makes list of teachers based on workload
                        teacher_list=df_teacher[mask].sort_values("Workload")["TeacherID"].values.tolist()  
                        idx2=0
                        for s in sections: #gets all section
                            for sec in s.split(','):  #gets each section
                                teach=teacher_list[idx2] #loops over all available teachers 
                                idx2=(idx2+1)%len(teacher_list) #circular loop
                                TT.assign_class(teacher_map,year,branch,sec,search_sub,teach)  #mapping
                                #inc workload per class assigned<rework in future based on hrs instead of count>
                                df_teacher.loc[df_teacher['TeacherID']==teach,'Workload']+=1  
                else:
                    for sub in subj:
                        search_sub=sub
                        # Strip spaces and check equality
                        mask=(df_teacher[cols_to_search].apply(lambda col:col.str.strip().str.lower().str.contains(search_sub.lower(),na=False))).any(axis=1)
                        #makes list of teachers based on workload
                        teacher_list=df_teacher[mask].sort_values("Workload")["TeacherID"].values.tolist()  
                        idx2=0
                        for s in sections: #gets all section
                            for sec in s.split(','):  #gets each section
                                teach=teacher_list[idx2] #loops over all available teachers 
                                idx2=(idx2+1)%len(teacher_list) #circular loop
                                TT.assign_class(teacher_map,year,branch,sec,search_sub,teach)  #mapping
                                #inc workload per class assigned<rework in future based on hrs instead of count>
                                df_teacher.loc[df_teacher['TeacherID']==teach,'Workload']+=1       
        cols_to_drop=[c for c in df_teacher.columns if re.fullmatch(r"Subject\d+",c)]  #gets all cols which have Subject1,2,3,..N
        df_teacher_store=df_teacher  #temporary copy as df_teacher is a global variable hence drop isn't working
        df_teacher_store=df_teacher_store.drop(columns=cols_to_drop) #drop columns
        teacher_dict=df_teacher_store.to_dict(orient='records')    
        db.store_data("teacher_dataset",teacher_dict)
        return teacher_map
    
    def room_sec_mapper(self):
        CC=ClassRoom()
        db=store_database()
        idx1=0
        class_df=df_building[df_building["Type"]=="Classroom"]
        class_list=class_df.sort_values("Workload")['Room'].values.tolist()  #makes a list of all classrooms
        student_list=res_df[['Year','Department','Section']].values.tolist() #filters to get list of year-branch-section
        for s_list in student_list:
            for sec in s_list[2].split(","):
                room_no=class_list[idx1]
                idx1=(idx1+1)%len(class_list)
                CC.assign_class(room_map,s_list[0],s_list[1],'Theory',sec,room_no)  #maps theory classroom
                df_building.loc[df_building['Room']==room_no,'Workload']+=1 #increases no of sections assigned
        
        for s_list in student_list:
            idx2=0
            dept=s_list[1]
            if s_list[1]=='IT':
                dept='CSE'  #CSE and IT both needs computer labs
            lab_df=df_building[df_building["Type"]=="Lab"]
            lab_rooms=lab_df[lab_df['Lab Type'].str.contains(dept, case=False, na=False)]  #checks if lab type matches the branch
            lab_list=lab_rooms.sort_values("Workload")["Room"].values.tolist() #makes a list of available labs room based on workload
            for sec in s_list[2].split(","):
                lab_no=lab_list[idx2]
                idx2=(idx2+1)%len(lab_list)
                CC.assign_class(room_map,s_list[0],s_list[1],'Lab',sec,lab_no)  #maps lab room
                df_building.loc[df_building['Room']==lab_no,'Workload']+=1 #increases no of sections assigned
        room_dict=df_building.to_dict(orient='records')    
        db.store_data("rooms_dataset",room_dict)
        return room_map
    
#TODO->In room_mapper, handling lab and theory dynamically
#TODO->In room_mapper, improve to handle more than 2 type dynamically
#TODO->In teacher_mapper, improve to handle more than just class and lab(far goal)
#TODO->In data_setup, further add more courses than just b.tech and modify ClassRoom and Teacher_Timetable accordinly