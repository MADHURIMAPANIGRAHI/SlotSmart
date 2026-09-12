import pandas as pd
import math
from database import get_database,store_database
from datetime import datetime
import string

db=store_database()
db2=get_database()

class UserManager:
    def gen_next_id(self,role):
        try:
            year=datetime.now().year
            counter_id=f"{year}_{role}"
            seq=db.generate_unique_id(counter_id)
            unique_id=f"{year}{seq}"
            return unique_id
        except Exception as e:
            print(e)

    def whitelist(self,gmail,role):
        try:
            data={"gmail":gmail,"role":role,"visible":True}
            db.white_list(data)
        except Exception as e:
            print(e)

    def assign_student_section(self):
        sections=string.ascii_uppercase
        df_building=db2.fetch_data("rooms_dataset")
        df_student=db2.fetch_data("student_dataset")
        df_student=df_student.sort_values("RollNo").reset_index(drop=True)
        avg=math.ceil(df_building[df_building["Type"]=="Classroom"]["Capacity"].mean())
        df_student=df_student.sort_values(by=["Course","Year","Department","RollNo"])
        prev_year,prev_branch= None,None
        section_idx = 0
        count = 0
        for idx,row in df_student.iterrows():
            year,branch=row["Year"],row["Department"] #get current year and Department
            if year!=prev_year or branch!=prev_branch:  #check if year or Department changes
                section_idx=0
                count = 0
            df_student.at[idx,"Section"]=sections[section_idx] #gets a letter for section
            count+=1
            if count==avg: #check if avg is reached and increments to next section
                section_idx+=1
                count=0
            prev_year,prev_branch = year,branch
        student_dict=df_student.to_dict("records")
        db.store_data("student_dataset",student_dict)

    def create_user(self,username,gmail,phoneno,Workload,Dept=None,role=None,
                    Subject=None,Designation=None,Course=None,Year=None):
        self.whitelist(gmail,role)
        U_id=self.gen_next_id(role)
        data={}
        try:
            if(role=='teacher'):
                data={
                    "TeacherID":U_id,
                    "Name":username,
                    "Contact":phoneno,
                    "gmail":gmail,
                    "Department":Dept,
                    "Designation":Designation,
                    "Subject":Subject,
                    "Workload":Workload
                }
            elif(role=='student'):
                data={
                    "RollNo":U_id,
                    "Name":username,
                    "Contact":phoneno,
                    "gmail":gmail,
                    "Department":Dept,
                    "Course":Course,
                    "Year":Year
                }
            db.Add_Update_data(f"{role}_dataset",data,{"gmail":data["gmail"]})
            self.assign_student_section()
            return U_id
        except Exception as e:
            print(e)

    def update_user(self,UserId,username,gmail,phoneno,Workload,Dept=None,role=None,
                    Subject=None,Designation=None,Course=None,Year=None,Section=None):
        data={}
        try:
            if(role=='teacher'):
                data={
                    "TeacherID":UserId,
                    "Name":username,
                    "Contact":phoneno,
                    "gmail":gmail,
                    "Department":Dept,
                    "Designation":Designation,
                    "Subject":Subject,
                    "Workload":Workload
                }
            elif(role=='student'):
                data={
                    "RollNo":UserId,
                    "Name":username,
                    "Contact":phoneno,
                    "gmail":gmail,
                    "Department":Dept,
                    "Course":Course,
                    "Year":Year,
                    "Section":Section
                }
            query={"RollNo":UserId} if role=="student" else {"TeacherID":UserId}
            db.update_whitelist(f"{role}_dataset",query,gmail,role)
            db.Add_Update_data(f"{role}_dataset",data,query)
        except Exception as e:
            print(e)
    
    def delete_user(self,UserId,role):
        query={"RollNo":UserId} if role=="student" else {"TeacherID":UserId}
        gmail=db2.fetch_generate_data(f"{role}_dataset",query,{"_id":0,"gmail":1})
        db.delete_data(f"{role}_dataset",query)
        db.delete("white_list_data",gmail)