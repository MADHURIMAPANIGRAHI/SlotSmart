from database import get_database
import numpy as np

class Preprocessor:
    def update_workload(self,data_df,year,collection):
        db=get_database()
        if(db.if_exists_cat(collection,{"year": year})):
            map=db.fetch_generate_data(collection,{"year":year},{"_id":0,"data":1})
            #iterates over entire dict to get each teacher
            for _,branches in map.items():
                for branch,sections in branches.items():
                    for section,subject in sections.items():
                        for sub,teacher in subject.items():
                            data_df.loc[(data_df['TeacherID']==teacher),'Workload']-=1 #reduce workload if teacher assigned
        else:
            return None

    def update_classload(self,data_df,year,collection):        
        db=get_database()
        if(db.if_exists_cat(collection,{"year": year})):
            map=db.fetch_generate_data(collection,{"year":year},{"_id":0,"data":1})
            #iterates over entire dict to get each room
            for _,branches in map.items():
                for branch,Types in branches.items():
                    for Type,sections in Types.items():
                        for section,room in sections.items():
                            data_df.loc[(data_df['Room']==room),'Workload']-=1 #reduce workload if room assigned
        else:
            return None

    def update_slot(self,data_df,year):
        for name,timetable in data_df.items():
            mask=np.char.find(timetable.astype(str),year)!=-1
            timetable[mask]=None