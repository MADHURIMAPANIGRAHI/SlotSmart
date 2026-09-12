from passlib.context import CryptContext
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import Response, HTTPException
from database import store_database,get_database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db=store_database()
db2=get_database()

class AuthManager:
    def hash_password(self,password:str)->str:
        return pwd_context.hash(password) #hash password
    
    def register_user(self,gmail:str,password:str,role:str,org_name:str,user_name:str,user_id:str):  #creates user
        if db.gmail_exists(gmail):
            raise HTTPException(status_code=409,detail="Email already exists")
        else:
            try:
                hashed_pw=self.hash_password(password)
                user_data={
                    "username":user_name,
                    "gmail":gmail,
                    "password":hashed_pw,
                    "role":role,
                    "org_name":org_name,
                    "user_id":user_id
                }
                db.store_user_data("user_info",user_data) #stores in user_info
                return {"message":"User registered sucessfully"}
            except Exception as e:
                print(e)

    def verify_password(self,plain_password:str,hashed_password:str)->bool:
        return pwd_context.verify(plain_password,hashed_password)  #verifys the hashed password with entered password

    def create_session(self,user_id:str,response:Response):
        session_id=str(uuid.uuid4())  #creates a random session token
        expiry=datetime.now(timezone.utc) + timedelta(days=30)  #makes 30days expire session
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "expires_at": expiry
        }
        db.store_user_data("session_info",session_data) #stores in session_info
        response.set_cookie(  #makes cookies for browser
            key="session_id",
            value=session_id,
            httponly=True, #Only browser Http can read
            secure=False, #HTTPS
            samesite="lax",  #prevent unauthorized used from different sites
            path="/",
            max_age=30*24*60*60  #30days expire time
        )

    def login_user(self,gmail:str,password:str,response:Response):
        user=db2.fetch_user_data("user_info",{"gmail":gmail}) 
        if not user or not self.verify_password(password,user["password"]): #checks if user name exists and password matches
            raise HTTPException(status_code=401,detail="Invalid credentials")
        self.create_session(str(user["_id"]),response)  #creates a password based on user's mongodb id
        user=db2.fetch_user_data("user_info",{"gmail":gmail},{"_id":0,"username":1,"role":1,"user_id":1}) 
        return user

    def logout_user(self,session_id:str,response: Response):
        if not session_id:
            return {"message":"No active session"}
        # Delete session from DB
        db.delete("session_info",{"session_id":session_id})  #deletes session for logout
        # Clear cookie in browser
        response.delete_cookie("session_id") #clears session cookies
        return {"message":"Logout successful"}