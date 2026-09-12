import numpy as np

class Teachers:
    def check_availablity(self,teacher_t,teach,r1,r2):
        if teacher_t[teach][r1,r2]==None: #checks if requested slot is empty
            return True
        else:
            return False
        
    def set_slot(self,teacher_t,teach,r_name,c_name,assigned_subject):
        master=teacher_t[teach]
        r1=np.where(master[1:,0]==r_name)[0][0]+1
        r2=np.where(master[0,1:]==c_name)[0][0]+1
        teacher_t[teach][r1,r2]=assigned_subject  #set given slot with class assigned
    
    def assign_class(self,teacher_map,year,branch,sections,subject,teacher):
        # Make a new dict for each year if it doesn't exist
        if year not in teacher_map:
            teacher_map[year]={}
        # Make a new dict for each branch if it doesn't exist    
        if branch not in teacher_map[year]:
            teacher_map[year][branch]={}
        # Make a new dict for each sec if it doesn't exist
        if sections not in teacher_map[year][branch]:
            teacher_map[year][branch][sections]={}
        #assigns subject and teacher dict for respective class
        teacher_map[year][branch][sections][subject]=teacher

    def check_consecutive(self,teacher_t,teach,r1,r2):
        timetable=teacher_t[teach]
        row,col=timetable.shape
        left_filled=(r2==0) or (timetable[r1,r2-1] is None)  #checks if it's the starting col or if left to curr col is empty
        right_filled=(r2==col-1) or (timetable[r1,r2+1] is None) #checks if it's last col or if  to curr col is empty
        return left_filled and right_filled


    def generate_schedule(self,days = ["Day/Time","Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"],
                        time_slot=["","07:30AM-08:30AM","08:40AM-09:40AM","09:50AM-10:50AM","11:00AM-12:00PM","12:00PM-01:00PM",
                                   "01:00PM-02:00PM","02:00PM-03:00PM","03:00PM-04:00PM","04:00PM-05:00PM"]):
        l1=len(days)
        l2=len(time_slot)
        timetable=np.full([l1,l2],None) #create a class hrs* week day size array
        timetable[0]=time_slot #assigns time slots to row 0
        timetable[:,0]=days #assigns days to columns1
        return timetable
    
    def get_slots(self,teacher_t,teacher,row_names,col_names):
        master_t=teacher_t[teacher]
        #get required rows and col based on current used timeslot 
        row_idx=[np.where(master_t[1:,0]==row)[0][0]+1 for row in row_names]
        col_idx=[np.where(master_t[0,1:]==col)[0][0]+1 for col in col_names]
        #include headers
        subset_rows=[0]+row_idx
        subset_cols=[0]+col_idx 
        # Extract subset from master_t
        subset=master_t[np.ix_(subset_rows, subset_cols)]
        return subset