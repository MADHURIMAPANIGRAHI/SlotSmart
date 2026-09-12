from database import get_database,store_database
from datetime import datetime
import random

class Data_mover:
    def gen_next_id(self,role):
            try:
                db=store_database()
                year=datetime.now().year
                counter_id=f"{year}_{role}"
                seq=db.generate_unique_id(counter_id)
                unique_id=f"{year}{seq}"
                return unique_id
            except Exception as e:
                print(e)

    def whitelist(self,gmail,role):
        try:
            db=store_database()
            data={"gmail":gmail,"role":role,"visible":True}
            db.white_list(data)
        except Exception as e:
            print(e)

    def upload_data(self,role):
        try:
            db=get_database()
            db2=store_database()
            data={}
            if(role=='teacher'):
                df_teacher=db.fetch_data("teachers_dataset")
                df_teacher=df_teacher.sort_values("TeacherID")
                dict_teacher=df_teacher.to_dict("records")
                for teacher_data in dict_teacher:
                    U_id=self.gen_next_id(role)
                    gmail=f"{U_id}@gmail.com"
                    username=teacher_data["Name"]
                    phoneno=9876543210
                    Dept=teacher_data["Department"]
                    Designation=teacher_data["Designation"]
                    Subject=teacher_data["Subject"]
                    Workload=0
                    self.whitelist(gmail,role)
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
                    db2.Add_Update_data(f"{role}_dataset",data,{"gmail":data["gmail"]})
            #TODO
            elif(role=='student'):
                names = [
                    "Aarav","Vivaan","Aditya","Vihaan","Arjun","Reyansh","Muhammad","Sai","Aryan","Krishna",
                    "Ishaan","Shaurya","Atharv","Ayaan","Dhruv","Kabir","Rohan","Kunal","Yash","Dev",
                    "Ananya","Aadhya","Diya","Isha","Kavya","Pooja","Riya","Sneha","Neha","Priya",
                    "Rahul","Amit","Suresh","Nikhil","Varun","Akash","Siddharth","Manish","Rakesh","Vikas",
                    "Meera","Naina","Alia","Sanya","Tanya","Simran","Pallavi","Shreya","Aishwarya","Anjali",
                    "John","Alex","Chris","Sam","Daniel","David","Ryan","Kevin","Michael","James",
                    "Emma","Olivia","Sophia","Isabella","Mia","Amelia","Charlotte","Ava","Lily","Grace",
                    "Noah","Liam","Ethan","Lucas","Mason","Logan","Jacob","Benjamin","Elijah","Henry",
                    "Zara","Nora","Hannah","Ellie","Lucy","Chloe","Ella","Aria","Layla","Zoey"
                    ]
                df_student=db.fetch_classes("students_dataset","Year 4")
                df_student=df_student.sort_values("RollNo")
                dict_student=df_student.to_dict("records")
                for student_data in dict_student:
                    U_id=self.gen_next_id(role)
                    gmail=f"{U_id}@gmail.com"
                    username=random.choice(names)
                    phoneno=9876543210
                    Dept=student_data["Department"]
                    Year=student_data["Year"]
                    Course="B.Tech"
                    self.whitelist(gmail,role)
                    data={
                        "RollNo":U_id,
                        "Name":username,
                        "Contact":phoneno,
                        "gmail":gmail,
                        "Department":Dept,
                        "Year":Year,
                        "Course":Course
                    }
                    db2.Add_Update_data(f"{role}_dataset",data,{"gmail":data["gmail"]})
        except Exception as e:
            print(e)