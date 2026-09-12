from fastapi import Cookie, HTTPException
from datetime import datetime, timezone
from database import get_database,store_database
from datetime import datetime, timezone
from bson import ObjectId


db=get_database()
db2=store_database()

async def get_current_user(session_id:str=Cookie(None)):
    if not session_id: #checks if session is sent
        raise HTTPException(status_code=401,detail="Not authenticated")
    session=db.fetch_user_data("session_info",{"session_id": session_id})
    if not session:  #checks if session exists in db
        raise HTTPException(status_code=401,detail="Session not found")

    expires_at = session["expires_at"]
    # Make fetched datetime timezone-aware if naive
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    #Verifys session token expire
    if expires_at < datetime.now(timezone.utc):
        db2.delete("session_info", {"session_id": session["session_id"]})
        raise HTTPException(status_code=401, detail="Session expired")
    
    user=db.fetch_user_data("user_info",{"_id": ObjectId(session["user_id"])},{"_id":0,"password":0})  #matches the user_id stores in session to retrive exact data
    if not user:
        raise HTTPException(status_code=401,detail="User not found")  #if user does not exists
    return user