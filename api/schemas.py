from pydantic import BaseModel
from typing import Optional

class Class_Timetable(BaseModel):  #expected format of generation call from frontend
    course:Optional[str]=None
    branch:Optional[str]=None
    year:Optional[str]=None
    section:Optional[str]=None

class Teacher(BaseModel): #expected format of teacher timetable call from frontend
    teacher_id:Optional[str]=None

class Generate(BaseModel): #expected format of student timetable call from frontend
    course:Optional[str]=None
    year:Optional[str]=None
    working_hrs:Optional[str]=None
    constraints:Optional[list]=None
    common_subject:Optional[list]=None

class RegisterUser(BaseModel):
    user_name:str
    gmail:str
    password:str
    role:Optional[str]="user"
    org_name:Optional[str]=None
    user_id:Optional[str]=None

class LoginUser(BaseModel):
    gmail:str
    password:str

class LoginResponse(BaseModel):
    username:str
    user_id:str
    role:str

class ResponseModel(BaseModel):
    message:str

class AddUser(BaseModel):
    #common roles
    username:str
    gmail:str
    phoneno:int
    Dept:str
    role:str
    #teacher specific roles
    Subject:Optional[str]=None
    Designation:Optional[str]=None
    Workload:Optional[int]=0
    #student specific roles
    Course:Optional[str]=None
    Year:Optional[str]=None

class UpdateUser(BaseModel):
    #common roles
    userid:str
    username:Optional[str]=None
    gmail:Optional[str]=None
    phoneno:Optional[int]=None
    Dept:Optional[str]=None
    role:str
    #teacher specific roles
    Subject:Optional[str]=None
    Designation:Optional[str]=None
    Workload:Optional[int]=0
    #student specific roles
    Course:Optional[str]=None
    Year:Optional[str]=None
    Section:Optional[str]=None

class RemoveUser(BaseModel):
    Userid:str
    role:str

class AddRoom(BaseModel):
    Building:str
    Floor:str
    Room:str
    Type:str
    Capacity:int
    Lab_type:Optional[str]="N/A"
    Workload:Optional[int]=0

class UpdateRoom(BaseModel):
    Building:str
    Floor:str
    Room:str
    Type:str
    Capacity:int
    Lab_type:Optional[str]="N/A"
    Workload:Optional[int]=0

class RemoveRoom(BaseModel):
    Building:str
    Room:str

class Role(BaseModel):
    role:str

class MessageModel(BaseModel):
    group:Optional[dict]={}
    can_Reply:Optional[bool]=True
    receiver:Optional[list]=[]
    message:str
    subject:str

class ReplyModel(BaseModel):
    parent_Msg_Id:str
    receiver_Gmail:str
    message:str

class ReadModel(BaseModel):
    msg_Id:str

class SlotSelectionModel(BaseModel):
    current_Class:str

class SwapModel(BaseModel):
    current_Slot:dict
    reason:str
    new_Timeslot:dict
    message:Optional[str]=""

class SourceSlotRequest(BaseModel):
    day: str
    time_slot: str       # e.g. "11:00AM-12:00PM"

class TargetSlotRequest(BaseModel):
    request_id: str
    target_class_key: str        # e.g. "Year 1-CSE-A"
    day: str
    time_slot: str
    reason: str
    additional_message: Optional[str] = ""

class TeacherActionRequest(BaseModel):
    request_id: str
    action: str          # "accept" or "reject"

class AdminActionRequest(BaseModel):
    request_id: str
    action: str          # "approve" or "reject"
    admin_note: Optional[str] = ""

class CancelRequestBody(BaseModel):
    request_id: str

class LeaveSubmitRequest(BaseModel):
    start_date: str           # ISO format: YYYY-MM-DD
    end_date: str             # ISO format: YYYY-MM-DD
    reason: str
    start_time: Optional[str] = None   # e.g. "09:00AM"
    end_time: Optional[str] = None     # e.g. "01:00PM"

class TeacherCancelLeaveRequest(BaseModel):
    leave_request_id: str

class TeacherSubResponseRequest(BaseModel):
    sub_slot_id: str
    action: str               # "accept" or "reject"

class AdminApproveRequest(BaseModel):
    leave_request_id: str

class AdminRejectRequest(BaseModel):
    leave_request_id: str

class AdminCancelRequest(BaseModel):
    leave_request_id: str

class AdminAssignSubRequest(BaseModel):
    sub_slot_id: str
    assigned_teacher_id: str

class AdminSubSlotsRequest(BaseModel):
    leave_request_id: str

class AdminCandidatesRequest(BaseModel):
    sub_slot_id: str

class AdminTeacherVacationRequest(BaseModel):
    teacher_id: str

class DailySubQuery(BaseModel):
    date: str                 # ISO format: YYYY-MM-DD