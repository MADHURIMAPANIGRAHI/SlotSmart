class MySubjects:
    def get_subject(self,timetable):
        unique_sub={}
        for i in range(1,len(timetable)):          # skip first row
            for j in range(1,len(timetable[i])):   # skip first column
                if timetable[i][j] is not None:
                    subject_list=timetable[i][j].split("-")
                    subject=subject_list[len(subject_list)-1]
                    year=subject_list[0]
                    branch=subject_list[1]
                    section=subject_list[2]
                    time=timetable[0][j]
                    day=timetable[i][0]
                    if subject not in unique_sub.keys():
                        unique_sub[subject]={
                            "Year":year,
                            "Branch":branch,
                            "Section":section,
                            "Time_slot":[]
                        }
                    unique_sub[subject]["Time_slot"].append(day+" "+time)
        return unique_sub