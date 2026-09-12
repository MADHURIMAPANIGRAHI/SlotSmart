from database import get_database

db=get_database()

class Data_subjects:
    def dashboard_data(self):
        Subject_data=db.fetch_generate_data("Subject_data")
        Subject_data_filtered=Subject_data[0]['Subject_data']
        teacher_data=db.fetch_data("teacher_dataset")
        building_data=db.fetch_data("rooms_dataset")
        building_data=building_data.fillna("N/A")
        building_dict=building_data.to_dict("records")
        teacher_data=teacher_data.fillna("N/A").sort_values("TeacherID")
        teacher_dict=teacher_data.to_dict("records")
        student_data=db.fetch_data("student_dataset")
        student_data=student_data.fillna("N/A").sort_values("RollNo")
        student_dict=student_data.to_dict("records")
        Unique_sub=set()
        for year,branches in Subject_data_filtered.items():
            for branch,Types in branches.items():
                for Type,subjects in Types.items():
                    for subject,credits in subjects.items():
                        Unique_sub.add(subject)
        count=len(Unique_sub)
        dropdown_data=db.fetch_generate_data("dropdown_data")[0]
        return building_dict,teacher_dict,student_dict,Subject_data,count,Unique_sub,dropdown_data

    def subject_data(self):
        yearly_subjects_with_labs=db.fetch_generate_data("Subject_data")
        subject_data=yearly_subjects_with_labs[0]['Subject_data']
        branch_subjects = {
            "CSE": [
                "Data Structures", "Algorithms", "DBMS", "Operating Systems",
                "Software Engineering", "Artificial Intelligence", "Computer Networks", "Web Development",
                "Machine Learning", "Cloud Computing", "Computer Architecture"
            ],
            "IT": [
                "Networking", "Web Development", "Programming", "Cybersecurity", "Cloud Computing",
                "Data Analytics", "DBMS"
            ],
            "ECE": [
                "Digital Electronics", "Signals & Systems", "Microprocessors",
                "Communication Systems", "Analog Circuits", "VLSI Design", "Control Systems",
                "Microcontrollers"
            ],
            "ME": [
                "Thermodynamics", "Mechanics", "Fluid Mechanics", "Manufacturing Processes",
                "Heat Transfer", "Dynamics", "Mechanics of Materials", "Mechanical Design"
            ],
            "Civil": [
                "Structural Analysis", "Surveying", "Construction Materials",
                "Transportation Engineering", "Geotechnical Engineering", "Construction Management",
                "Structural Design"
            ],
            "EEE": [
                "Electrical Machines", "Control Systems", "Power Systems",
                "Renewable Energy", "Power Electronics"
            ]
        } 
        return subject_data
    
    def update_dataset(self,Year,subjects_detail,common_subject_list):
        for common_subject in common_subject_list:  
            branches=common_subject["branches"]
            common_sub=common_subject["common_sub"]
            for branch,Types in subjects_detail[Year].items(): #iterate over particular year's subject 
                if branch not in branches:
                    continue
                for Level, subjects in Types.items():
                    for subject in list(subjects.keys()):
                        if subject in common_sub:
                            subjects.pop(subject)  #remove subject which is present in common subject list
    
    def check_subject(self,year,branch,subject,all_subject_data):  #compared given subject with all subjects in a particular year,branch
        subject_dict=all_subject_data
        curr_subject=subject_dict[year][branch]
        for Type,subjects in curr_subject.items():
            for sub in subjects.keys():
                if(sub==subject):
                    return True
        return False