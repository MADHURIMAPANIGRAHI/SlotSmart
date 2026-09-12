from fastapi import APIRouter, Depends, Response, Cookie,HTTPException,status
from authentication import AuthManager,get_current_user
from model import (Main,Create_json,Preprocessor,Data_subjects,Find_next_class,
MySubjects,SubstituionManager,SwapManager,ReplacementManager,LeaveManager)
from services import UserManager,RoomManager
from database import section_tt, get_database
from .schemas import *
from Messaging import Message,Notification
from Misc import Data_mover
from authentication.dependencies import get_current_user

#initialize all the required classes
manager = LeaveManager()
Initiate=Main()
json_obj=Create_json()
section_timetable=section_tt()
db=get_database()
preprocess=Preprocessor()
d=Data_subjects()
Fnc=Find_next_class()
Um=UserManager()
Rm=RoomManager()
Auth=AuthManager()
move=Data_mover()
ms=MySubjects()
msgs=Message()
n=Notification()
replacement = ReplacementManager()
substitue_system=SubstituionManager()
swap_system=SwapManager()

router=APIRouter()

@router.post("/register",response_model=ResponseModel,tags=["Auth"])
def register(data:RegisterUser):
    return Auth.register_user(data.gmail,data.password,data.role,data.org_name,data.user_name,data.user_id)

# Login endpoint
@router.post("/login",response_model=LoginResponse,tags=["Auth"])
def login(data:LoginUser,response:Response):
    return Auth.login_user(data.gmail,data.password, response)

# Logout endpoint
@router.post("/logout",response_model=ResponseModel,tags=["Auth"])
def logout(response: Response, session_id: str = Cookie(None)):
    return Auth.logout_user(session_id, response)

@router.get("/me",tags=["Auth"])
def me(user=Depends(get_current_user)):
    return {
        "username":user["username"],
        "user_id":user["user_id"],
        "role":user["role"]
    }

@router.post('/add_user',response_model=ResponseModel,tags=["Users"])
def add_user(data:AddUser,user=Depends(get_current_user)):
    try:
        if db.if_exists_cat(f"{data.role}_dataset",{"gmail":data.gmail}):
            raise HTTPException(status_code=409,detail="User already registered, please use Update option instead of Add")
        U_id=Um.create_user(data.username,data.gmail,data.phoneno,data.Workload,data.Dept,data.role,data.Subject,
                   data.Designation,data.Course,data.Year)
        return {"message":f"Sucessfully Registered, you Unique id is {U_id}"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)

@router.post("/import_bulk_data",tags=["Users"])
def import_bulk_data(data:Role,user=Depends(get_current_user)):
    try:
        move.upload_data(data.role)
        return {"message":"Successfully uploaded all data"}
    except Exception as e:
        print(e)

@router.post('/update_user',response_model=ResponseModel,tags=["Users"])
def update_user(data:UpdateUser,user=Depends(get_current_user)):
    try:
        Um.update_user(data.userid,data.username,data.gmail,data.phoneno,data.Workload,data.Dept,data.role,data.Subject,
                   data.Designation,data.Course,data.Year,data.Section)
        return {"message":"Updated user successfully"}
    except Exception as e:
        print(e)

@router.post('/remove_user',response_model=ResponseModel,tags=["Users"])
def remove_user(data:RemoveUser,user=Depends(get_current_user)):
    try:
        Um.delete_user(data.Userid,data.role)
        return {"message":"successfully removed user"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)

@router.post('/add_room',response_model=ResponseModel,tags=["Rooms"])
def add_room(data:AddRoom,user=Depends(get_current_user)):
    try:
        if db.if_exists_cat(f"rooms_dataset",{"Building":data.Building,"Room":data.Room}):
            raise HTTPException(status_code=409,detail="Room already registered, please use Update option instead of Add")
        Rm.AddRoom(data.Building,data.Floor,data.Room,data.Type,data.Capacity,data.Lab_type,data.Workload)
        return {"message":"sucessful"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)

@router.post('/update_room',response_model=ResponseModel,tags=["Rooms"])
def update_room(data:UpdateRoom,user=Depends(get_current_user)):
    try:
        Rm.AddRoom(data.Building,data.Floor,data.Room,data.Type,data.Capacity,data.Lab_type,data.Workload)
        return {"message":"Updated room successfully"}
    except Exception as e:
        print(e)

@router.post('/remove_room',response_model=ResponseModel,tags=["Rooms"])
def remove_room(data:RemoveRoom,user=Depends(get_current_user)):
    try:
        Rm.DeleteRoom(data.Building,data.Room)
        return {"message":"Successfully removed room"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)

@router.post('/generate_timetable',tags=["Generate"])
def generate_timetable(data:Generate,user=Depends(get_current_user)):
    try:
        Initiate.Initalize(data.year,data.working_hrs)
        Initiate.generate(data.year,data.constraints,data.common_subject)
        Initiate.store()
        json_obj.generate_json()
        full_timetable=section_timetable.fetch_data(data.year)  #fetches the entire year's timetable
        return full_timetable
    except Exception as e:
        print("timetable gen",e)

@router.post('/get_class_timetable',tags=["Generate"])
def Class_timetable(data:Class_Timetable,user=Depends(get_current_user)):
    try:
        class_name="timetable."+data.year+"-"+data.branch+"-"+data.section
        class_tt=section_timetable.fetch_data(data.year,class_name) #feteches exact value from the year's timetable
        return class_tt
    except Exception as e:
        print(e)

@router.post('/get_teacher_timetable',tags=["Generate"]) 
def teacher_timetable(data:Teacher,user=Depends(get_current_user)): #indev
    try:
        teacher_json,_=json_obj.teacher_json(data.teacher_id,"teacher_t")
        return teacher_json
    except Exception as e:
        print(e)

@router.get('/generate_data',tags=["Generate"])
def generate_page_data(user=Depends(get_current_user)):
    try:
        Slots=db.fetch_generate_data("Slots")
        slot_data=Slots[0]["Slots"] #sends a data set combined of timeslots,days,branches 
        return slot_data
    except Exception as e:
        print(e)

@router.get('/generate_student_data',tags=["Generate"])
def generate_student_data(user=Depends(get_current_user)):
    try:
        student_info=db.fetch_generate_data("student_info")
        return student_info
    except Exception as e:
        print(e)

@router.get('/generate_dashboard_data',tags=["Dashboard"])
def generate_dashboard_data(user=Depends(get_current_user)):
    try:
        role=user['role']
        if role!="admin":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Not authorized to use this command!")
        building_dict,teacher_dict,student_dict,Subject_data,count,Unique_sub,dropdown_data=d.dashboard_data()
        active_Swap_Request=swap_system.get_swap_request()
        return {"Teacher":teacher_dict,"Room":building_dict,"Subject":Subject_data,"Student":student_dict,
                "Count":count,"Unique_sub":Unique_sub,"dropdown_data":dropdown_data,"active_Swap_Request":active_Swap_Request}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get('/generate_teacher_dashboard',tags=["Dashboard"])
def generate_teacher_dashboard(user=Depends(get_current_user)):
    try:
        teacher_id=user['user_id']
        teacher_name=user["username"]
        teacher_json,teacher_t=json_obj.teacher_json(teacher_id,"teacher_t")
        next_class=Fnc.next_class_is(teacher_t)
        return {"teacher_timetable":teacher_json,"username":teacher_name,"upcoming_class":next_class}
    except Exception as e:
        print(e)

@router.get('/teacher_subjects',tags=["MISC"])
def teacher_subjects(user=Depends(get_current_user)):
    try:
        teacher_id=user['user_id']
        teacher_name=user["username"]
        _,teacher_t=json_obj.teacher_json(teacher_id,"teacher_t")
        unique_sub=ms.get_subject(teacher_t)
        return {"Subject_name":unique_sub}
    except Exception as e:
        print("Error in teacher_subject")

@router.get('/generate_student_dashboard',tags=["Generate"])
def generate_student_dashboard(user=Depends(get_current_user)):
    try:
        student_name=user['username']
        student_id=user['user_id']
        data=db.fetch_generate_data("student_map",{"RollNo":student_id})
        year=data["Year"]
        branch=data["Branch"]
        section=data["Section"]
        class_name_query="timetable."+year+"-"+branch+"-"+section
        class_tt=section_timetable.fetch_data(year,class_name_query) #feteches exact value from the year's timetable
        class_name=year+"-"+branch+"-"+section
        timetable=json_obj.revert_json(f"Timetable_raw_{year}")
        timetable_raw=timetable[class_name]
        next_class=Fnc.next_class_student(timetable_raw,year,branch)
        return {"student_timetable":class_tt,"username":student_name,"upcoming_class":next_class}
    except Exception as e:
        print("Exception:",e)

@router.get('/student_subjects',tags=["MISC"])
def student_subjects(user=Depends(get_current_user)):
    try:
        user_info=db.fetch_generate_data("student_dataset",{"RollNo":user["user_id"]},{"_id":0,"Year":1,"Department":1})
        year=user_info["Year"]
        Department=user_info["Department"]
        Subject_data=db.fetch_generate_data("Subject_data")[0]["Subject_data"][year][Department]
        return Subject_data
    except Exception as e:
        print("Error in teacher_subject")

@router.get('/msg_dashboard',tags=["Messages"])
def msg_dashboard(user=Depends(get_current_user)):
    try:
        return msgs.generate_dashboard()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get('/get_notification',tags=["Messages"])
def get_notification(user=Depends(get_current_user)):
    try:
        gmail=user['gmail']
        return n.get_notification(gmail)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get('/get_user_messages',tags=["Messages"])
def get_user_messages(user=Depends(get_current_user)):
    try:
        gmail=user['gmail']
        return msgs.get_user_messages(gmail)
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")
    
@router.post('/send_message',tags=["Messages"])
def send_message(data:MessageModel,user=Depends(get_current_user)):
    try:
        sender_gmail=user['gmail']
        username=user['username']
        return msgs.sender(username,sender_gmail,data.receiver,data.can_Reply,data.group,data.message,data.subject)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post('/reply_msg',tags=["Messages"])
def reply_msg(data:ReplyModel,user=Depends(get_current_user)):
    try:
        parent_Msg_Id=data.parent_Msg_Id
        username=user['username']
        sender_Gmail=user['gmail']
        receiver_Gmail=data.receiver_Gmail
        message=data.message
        return msgs.reply_msg(parent_Msg_Id,username,sender_Gmail,receiver_Gmail,message)
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post('/read_msg',tags=["Messages"])
def read_msg(data:ReadModel,user=Depends(get_current_user)):
    try:
        receiver_Gmail=user['gmail']
        msg_Id=data.msg_Id
        return msgs.read_msg(msg_Id,receiver_Gmail)
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post('/soft_delete_msg',tags=["Messages"])
def soft_delete_msg(data:ReadModel,user=Depends(get_current_user)):
    try:
        gmail=user['gmail']
        msg_Id=data.msg_Id
        return msgs.soft_delete_msg(msg_Id,gmail)
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post('/delete_msg',tags=["Messages"])
def delete_msg(data:ReadModel,user=Depends(get_current_user)):
    try:
        role=user['role']
        msg_Id=data.msg_Id
        return msgs.delete_msg(role,msg_Id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get('/swap_dashboard',tags=['Substitue and leave']) 
def load_swap_dashboard(user=Depends(get_current_user)):
    try:
        user_id=user["user_id"]
        teacher_timetable,_=json_obj.teacher_json(user_id,"teacher_t")
        return {"teacher_timetable":teacher_timetable}
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")
    
@router.post('/resolve_class',tags=['Substitue and leave'])
def resolve_class(data:SlotSelectionModel,_=Depends(get_current_user)):
    try:
        current_Class=data.current_Class
        return swap_system.resolve_class(current_Class)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post('/request_swap',tags=['Substitue and leave'])
def request_swap(data:SwapModel,user=Depends(get_current_user)):
    try:
        username=user["username"]
        user_id=user["user_id"]
        current_Slot=data.current_Slot
        new_Slot=data.new_Timeslot
        reason=data.reason
        msg=data.message
        return swap_system.request_swap(username,user_id,current_Slot,new_Slot,reason,msg)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post('/swap_class',tags=['Substitue and leave']) 
def swap_class(data:SwapModel,user=Depends(get_current_user)):
    try:
        username=user["username"]
        user_id=user["user_id"]
        role=user["role"]
        current_Slot=data.current_Slot
        new_Slot=data.new_Timeslot
        _,teacher_timetable=json_obj.teacher_json(user_id,"teacher_t")
        swap_system.swapper(username,user_id,role,teacher_timetable)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

def require_role(user: dict, *roles):
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Access denied")

@router.post("/relocate/select_source",tags=['Relocate'])
async def select_source(body: SourceSlotRequest,user: dict = Depends(get_current_user)):
    require_role(user, "teacher")
    try:
        result = replacement.select_source(
            teacher_id=user["user_id"],
            day=body.day,
            time_slot=body.time_slot,
        )
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post("/relocate/select_target",tags=['Relocate'])
async def select_target(body: TargetSlotRequest,user: dict = Depends(get_current_user)):
    require_role(user, "teacher")
    try:
        result = replacement.select_target(
            request_id=body.request_id,
            teacher_id=user["user_id"],
            target_class_key=body.target_class_key,
            day=body.day,
            time_slot=body.time_slot,
            reason=body.reason,
            additional_message=body.additional_message
        )
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post("/relocate/teacher_action",tags=['Relocate'])
async def teacher_action(body: TeacherActionRequest,user: dict = Depends(get_current_user)):
    require_role(user, "teacher")
    try:
        return replacement.teacher_action(
            request_id=body.request_id,
            teacher_id=user["user_id"],
            action=body.action
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post("/relocate/admin_action",tags=['Relocate'])
async def admin_action(body: AdminActionRequest,user: dict = Depends(get_current_user)):
    require_role(user, "admin")
    try:
        return replacement.admin_action(
            request_id=body.request_id,
            action=body.action,
            admin_note=body.admin_note
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.get("/relocate/requests",tags=['Relocate'])
async def get_requests(user: dict = Depends(get_current_user)):
    require_role(user, "teacher", "admin")
    try:
        return replacement.get_dashboard(
            role=user["role"],
            teacher_id=user.get("user_id")
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")
    
@router.post("/relocate/cancel",tags=['Relocate'])
async def cancel_request(body: CancelRequestBody,user: dict = Depends(get_current_user)):
    require_role(user, "teacher")
    try:
        return replacement.cancel_request(body.request_id, user["user_id"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Something went wrong")

@router.post("/submit", tags=["Substitute"])
def submit_leave(body: LeaveSubmitRequest, user=Depends(get_current_user)):
    """Teacher submits a leave request."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can submit leave requests.")
    try:
        leave_id = manager.submit_leave(
            teacher_id=user["user_id"],
            start_date=body.start_date,
            end_date=body.end_date,
            reason=body.reason,
            start_time=body.start_time,
            end_time=body.end_time
        )
        return {"leave_request_id": leave_id, "message": "Leave request submitted successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel", tags=["Substitute"])
def cancel_leave(body: TeacherCancelLeaveRequest, user=Depends(get_current_user)):
    """Teacher cancels their own leave request (only before admin approval)."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can cancel their leave requests.")
    try:
        manager.cancel_leave_by_teacher(user["user_id"], body.leave_request_id)
        return {"message": "Leave request cancelled successfully."}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my_requests", tags=["Substitute"])
def get_my_leave_requests(user=Depends(get_current_user)):
    """Teacher views their own leave history."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied.")
    try:
        return manager.get_teacher_leave_history(user["user_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my_vacation_days", tags=["Substitute"])
def get_my_vacation_days(user=Depends(get_current_user)):
    """Teacher views their total approved vacation days."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied.")
    try:
        days = manager.get_teacher_vacation_days(user["user_id"])
        return {"teacher_id": user["user_id"], "vacation_days": days}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my_sub_slots", tags=["Substitute"])
def get_my_pending_sub_slots(user=Depends(get_current_user)):
    """Substitute teacher views sub slots assigned to them awaiting response."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied.")
    try:
        return manager.get_teacher_pending_sub_slots(user["user_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/respond_sub_slot", tags=["Substitute"])
def respond_to_sub_slot(body: TeacherSubResponseRequest, user=Depends(get_current_user)):
    """Substitute teacher accepts or rejects a sub slot assignment."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied.")
    try:
        manager.teacher_respond_to_sub_slot(user["user_id"], body.sub_slot_id, body.action)
        return {"message": f"Sub slot {body.action}ed successfully."}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/requests", tags=["Substitute"])
def get_admin_leave_list(user=Depends(get_current_user)):
    """Admin views active leave requests padded to last 5 if fewer active."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        return manager.get_admin_leave_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/approve", tags=["Substitute"])
def admin_approve_leave(body: AdminApproveRequest, user=Depends(get_current_user)):
    """Admin approves a leave request and creates sub slots."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        return manager.admin_approve_leave(body.leave_request_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/reject", tags=["Substitute"])
def admin_reject_leave(body: AdminRejectRequest, user=Depends(get_current_user)):
    """Admin rejects a leave request."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        manager.admin_reject_leave(body.leave_request_id)
        return {"message": "Leave request rejected."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/cancel", tags=["Substitute"])
def admin_cancel_leave(body: AdminCancelRequest, user=Depends(get_current_user)):
    """Admin cancels an already approved leave. All sub slots are cancelled."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        manager.admin_cancel_approved_leave(body.leave_request_id)
        return {"message": "Approved leave cancelled. All sub slots have been cancelled."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/sub_slots", tags=["Substitute"])
def get_sub_slots_for_leave(body: AdminSubSlotsRequest, user=Depends(get_current_user)):
    """Admin views all sub slots for a specific leave request."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        return manager.get_sub_slots_for_leave(body.leave_request_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/candidates", tags=["Substitute"])
def get_substitute_candidates(body: AdminCandidatesRequest, user=Depends(get_current_user)):
    """Admin gets ranked substitute teacher candidates for a sub slot."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        return manager.get_sub_slot_candidates(body.sub_slot_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/assign_sub", tags=["Substitute"])
def admin_assign_substitute(body: AdminAssignSubRequest, user=Depends(get_current_user)):
    """Admin assigns a substitute teacher to a sub slot."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        manager.admin_assign_substitute(body.sub_slot_id, body.assigned_teacher_id)
        return {"message": "Substitute assigned successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/teacher_vacation_days", tags=["Substitute"])
def get_teacher_vacation_days_admin(body: AdminTeacherVacationRequest, user=Depends(get_current_user)):
    """Admin views vacation days taken by a specific teacher."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    try:
        days = manager.get_teacher_vacation_days(body.teacher_id)
        return {"teacher_id": body.teacher_id, "vacation_days": days}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/daily_substitutions", tags=["Substitute"])
def get_daily_substitutions(body: DailySubQuery, user=Depends(get_current_user)):
    """
    Returns substitution schedule for a given date.
    Accessible by teachers, students and admin for dashboards.
    """
    if user["role"] not in ("teacher", "student", "admin"):
        raise HTTPException(status_code=403, detail="Access denied.")
    try:
        return manager.get_daily_substitutions(body.date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))