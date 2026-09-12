import random
import numpy as np
from .Teacher_Timetable import Teachers
from .ClassRoom_Timetable import ClassRoom
import pdb
import re

class Timetable_gen:
    def setfixedslots(self,year,y_b_s,constraint):
            if(constraint["fixed"]):  #checks if fixed slot 
                #get all constraint data
                name=constraint["name"]
                branches=constraint["branches"]
                days=constraint["days"]
                timeslot=constraint["timeslots"]
                for branch in branches:
                    for section,timetable in y_b_s[year][branch].items(): #gets section and timetable for each branch
                        for day in days:
                            for time in timeslot:
                                #finds row and col idx of particular day and time
                                row_idx = [i for i, val in enumerate(timetable[:, 0]) if val and str(val).strip()==str(day).strip()][0]
                                col_idx = [i for i, val in enumerate(timetable[0, :]) if val and str(val).strip()==str(time).strip()][0]
                                y_b_s[year][branch][section][row_idx,col_idx]=name
            else:
                name=constraint["name"]
                branches=constraint["branches"]
                duration=constraint["duration"]
                for branch in branches:
                    for section,timetable in y_b_s[year][branch].items():
                        credits=re.findall(r"\d+",duration)  #covert hrs to digits
                        credits=int(credits[0])
                        while(credits>0):
                            slots=np.argwhere(timetable==None)  #filters all empty slots
                            slots=[tuple(s) for s in slots] #converts them to tuple for better control
                            selected_slot=random.choice(slots)  #randomly pick one of the available slot
                            r1,r2=selected_slot  #gets row and col
                            y_b_s[year][branch][section][r1,r2]=name
                            slots.remove((r1,r2))
                            credits-=1

    def assigncommonslot(self,common_subject_list,year,teacher_map,teacher_t,subjects_detail,y_b_s):
        TT=Teachers()
        def get_teachers(teacher_map,subjects):
            teacher_list=set()
            for common_sub in subjects:
                for year,branches in teacher_map.items(): #iterate over all classes
                    for branch,sections in branches.items():
                        for section,subjects in sections.items():
                            for subject,teacher in subjects.items():
                                if(subject==common_sub): #if current subject is one of the common subject
                                    teacher_list.add(teacher) #add the teacher teaching to teacher list
            return list(teacher_list)
        
        def map_branch(subjects_detail,subjects,branches):
            mapped={}
            for branch,Levels in subjects_detail.items():
                if branch not in branches: #check if branch in list to protected branches with common sub and reducing computation
                    continue
                for Level,Subjects in Levels.items():
                    for curr_sub,credits in Subjects.items():
                        if curr_sub in subjects:
                            if curr_sub not in mapped.keys():
                                mapped[curr_sub]={
                                    "branches":[]
                                }
                            mapped[curr_sub]["branches"].append(branch)  #adds branches to a subject map
            return mapped
        
        for common_subject in common_subject_list:
            common_slots=None   #initialize first   
            branches=common_subject["branches"]
            subjects=common_subject["common_sub"]
            ref_branch=branches[0]
            row_names=y_b_s[year][ref_branch]["A"][1:,0] #gets row names from first
            col_names=y_b_s[year][ref_branch]["A"][0,1:] #gets col names from first
            teacher_list=get_teachers(teacher_map,subjects)
            branch_subject_map = map_branch(subjects_detail[year], subjects, branches)
            common_slots=None
            #build common slots across ALL subjects
            for subject,branch_info in branch_subject_map.items():
                for branch in branch_info["branches"]:
                    free_slots=set(map(tuple,np.argwhere(y_b_s[year][branch]["A"]==None)))
                    if common_slots is None:
                        common_slots=free_slots
                    else:
                        common_slots&=free_slots
            #intersect with all teachers at once
            for teacher in teacher_list:
                timetable_teacher_updated=TT.get_slots(teacher_t,teacher,row_names,col_names)
                none_slots=set(map(tuple,np.argwhere(timetable_teacher_updated==None)))
                common_slots&=none_slots
            #pick slots at once
            common_slots_int={(int(i),int(j)) for i, j in common_slots}
            selected_slots=random.sample(list(common_slots_int), 3)
            #assign SAME slots to all subjects
            for subject, branch_info in branch_subject_map.items(): # loop over each subject
                for branch in branch_info["branches"]:  # loop over branches for that subject
                    for sec, timetable in y_b_s[year][branch].items():  # loop over sections in that branch
                        for r1, r2 in selected_slots:   # loop over common selected slots
                            #Assign subject to class timetable
                            y_b_s[year][branch][sec][r1, r2]=subject
                            #Assign same slot to all relevant teachers
                            for curr_teacher in teacher_list:
                                for y,branches in teacher_map.items():
                                    for b,sections in branches.items():
                                        for s,subjects in sections.items():
                                            for sub_name,teacher_name in subjects.items():
                                                # only assign if teacher teaches this subject
                                                if teacher_name==curr_teacher and sub_name==subject:
                                                    assigned_subject=f"{y}-{b}-{s}-{subject}"
                                                    r_name=timetable[r1,0]
                                                    c_name=timetable[0,r2]
                                                    TT.set_slot(teacher_t,curr_teacher,r_name,c_name,assigned_subject)

    def setcommonslot(self,year,y_b_s,teacher_map,teacher_t,common_subject,common_subject_list):
        TT=Teachers()
        CC=ClassRoom()
        teacher_list=[]
        for common_sub,credit in common_subject.items():  #iterate over all common subjects
            for year,branches in teacher_map.items(): #iterate over all classes
                for branch,sections in branches.items():
                    for section,subjects in sections.items():
                        for subject,teacher in subjects.items():
                            if(subject==common_sub): #if current subject is one of the common subject
                                teacher_list.append(teacher) #add the teacher teaching to teacher list
        common_slots=set(map(tuple,np.argwhere(y_b_s[year]["CSE"]["A"]==None))) #get a single class timetable to filter already filled slots
        row_names=y_b_s[year]["CSE"]["A"][1:,0]
        col_names=y_b_s[year]["CSE"]["A"][0,1:]
        for teacher in teacher_list:
            timetable_teacher_updated=TT.get_slots(teacher_t,teacher,row_names,col_names)
            none_slots=set(map(tuple,np.argwhere(timetable_teacher_updated==None)))  #get all none slots
            common_slots&=none_slots  #get itersection of none slots between all teachers to get common empty slots
        common_slots_int = {(int(i), int(j)) for i, j in common_slots} #readability to int format
        selected_slots=random.sample(list(common_slots_int),3) #randomly select 3 slots
        for slot in selected_slots:  #select 1 slot
            r1=slot[0]
            r2=slot[1]
            for year,branches in y_b_s.items():
                for branch,sections in branches.items():
                    for sec,timetable in sections.items():
                        y_b_s[year][branch][sec][r1,r2]=f"Common subject"  #assign common slot to each class
            for curr_teacher in teacher_list:  #picks a teacher and iterates over teacher map 
                for year,branches in teacher_map.items():
                    for branch,sections in branches.items():
                        for section,subjects in sections.items():
                            for subject,teacher in subjects.items():
                                if(teacher==curr_teacher and subject in common_subject_list):  #checks teacher name and subject name equivalence
                                    assigned_subject=year+"-"+branch+"-"+section+"-"+"Common subject"
                                    r_name=timetable[r1,0]
                                    c_name=timetable[0,r2]
                                    TT.set_slot(teacher_t,curr_teacher,r_name,c_name,assigned_subject)

    def Make_Timetable(self,year,branch,Type,section,subjects,teacher_map,y_b_s,teacher_t,room_map,room_t):
        TT=Teachers()
        CC=ClassRoom()
        section_tt=y_b_s[year][branch][section]  #filters to get single section
        for curr_sub,credits in subjects.items():
            teach=teacher_map[year][branch][section][curr_sub]
            room_no=room_map[year][branch][Type][section]
            # timetable_teacher=teacher_t[teach]
            # timetable_room=room_t[room_no]
            row_names=section_tt[1:,0]
            col_names=section_tt[0,1:]
            timetable_teacher_updated=TT.get_slots(teacher_t,teach,row_names,col_names)
            timetable_room_updated=CC.get_slots(room_t,room_no,row_names,col_names)
            slots=np.argwhere((section_tt==None) & (timetable_teacher_updated==None) & (timetable_room_updated==None))  #filters all empty slots
            slots=[tuple(s) for s in slots] #converts them to tuple for better control
            max_tries=0
            while(1):
                #checks if all subjects are assigned or if no more empty slots left
                if credits==0 or not slots:
                    if(credits==0):
                        break 
                    else:
                        print(f"Timetable creation failed for section {section}-No empty slots remain")
                        return
                else:
                    row,col=timetable_teacher_updated.shape #gets the shape of numpy array
                    assigned_subject=year+"-"+branch+"-"+section+"-"+curr_sub
                    assigned_class=year+"-"+branch+"-"+section
                    max_tries+=1
                    #if there are 2hrs or more of class left to be assigned and less than 1000 tries                 
                    if credits>=2 and max_tries<1000: 
                        valid_slots=[s for s in slots if s[1]<col-1]
                        if valid_slots:
                            selected_slot=random.choice(valid_slots)  #randomly pick one of the available slot
                            r1,r2=selected_slot  #gets row and col
                            #checks of teacher,room and class slot emptiness
                            if (section_tt[r1,r2]==None and section_tt[r1,r2+1]==None and curr_sub not in section_tt[r1] and 
                                timetable_teacher_updated[r1,r2]==None and timetable_teacher_updated[r1,r2+1]==None and
                                # TT.check_consecutive(teacher_t,teach,r1,r2) and TT.check_consecutive(teacher_t,teach,r1,r2+1) and
                                timetable_room_updated[r1,r2]==None and timetable_room_updated[r1,r2+1]==None):
                                y_b_s[year][branch][section][r1,r2]=curr_sub
                                y_b_s[year][branch][section][r1,r2+1]=curr_sub
                                #assigns teacher,room and class slots
                                r_name=section_tt[r1,0]
                                c_name=section_tt[0,r2]
                                c_name2=section_tt[0,r2+1]
                                TT.set_slot(teacher_t,teach,r_name,c_name,assigned_subject)
                                TT.set_slot(teacher_t,teach,r_name,c_name2,assigned_subject)
                                CC.set_slot(room_t,room_no,r_name,c_name,assigned_class)
                                CC.set_slot(room_t,room_no,r_name,c_name2,assigned_class)
                                credits-=2
                                slots.remove((r1,r2))
                                slots.remove((r1,r2+1))
                    else:
                        selected_slot=random.choice(slots)  #randomly pick one of the available slot
                        r1,r2=selected_slot  #gets row and col
                        if (section_tt[r1,r2]==None and curr_sub not in section_tt[r1] and timetable_teacher_updated[r1,r2]==None  
                            # and TT.check_consecutive(teacher_t,teach,r1,r2) 
                            and timetable_room_updated[r1,r2]==None):
                            y_b_s[year][branch][section][r1,r2]=curr_sub
                            r_name=section_tt[r1,0]
                            c_name=section_tt[0,r2]
                            TT.set_slot(teacher_t,teach,r_name,c_name,assigned_subject)
                            CC.set_slot(room_t,room_no,r_name,c_name,assigned_class)
                            credits-=1
                            slots.remove((r1,r2))
                # elapsed = time.time() - start_time
                if max_tries > 200000:  #TODO remove when in prod
                    print(f"⚠️ Loop running too long ({max_tries} tries), entering debugger")
                    pdb.set_trace()  # Pause here to inspect


#TODO->Add logic to ensure teacher doesn't have more than more than 2hrs of consecutive classes
#TODO->Make a cleaner function to easily check condition instead of a massive if condition to ensure more scalability