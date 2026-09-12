import uuid
from datetime import datetime, timezone
from database import databaseManager

db = databaseManager()

TIME_SLOTS = [
    None,                  # index 0 — day label column, unused
    "07:30AM-08:30AM",
    "08:40AM-09:40AM",
    "09:50AM-10:50AM",
    "11:00AM-12:00PM",
    "12:00PM-01:00PM",
    "01:00PM-02:00PM",
    "02:00PM-03:00PM",
    "03:00PM-04:00PM",
    "04:00PM-05:00PM",
]


class ReplacementManager:

    # ─────────────────────────────────────────────────────────
    # PARSING HELPERS
    # ─────────────────────────────────────────────────────────
    
    def get_raw_slot_index(self, year: int, dept: str, section: str, time_slot: str):
        shift_key = self.get_class_shift_key(year, dept, section)
        slots = db.get_slots_for_class(shift_key)
        if not shift_key:
            return None
        slots = db.get_slots_for_class(shift_key)
        if not slots:
            return None
        try:
            return slots.index(time_slot) + 1
        except ValueError:
            return None

    def get_class_shift_key(self, year: int, dept: str, section: str):
        class_key = self.build_class_key(year, dept, section)
        tt_doc = db.get_class_timetable(year)
        class_days = tt_doc.get("timetable", {}).get(class_key, [])

        all_active_slots = []
        for day_entry in class_days:
            for time_slot, slot_data in day_entry["schedule"].items():
                if slot_data.get("subject") not in (None, "Lunch", "CB", ""):
                    if time_slot not in all_active_slots:
                        all_active_slots.append(time_slot)

        if not all_active_slots:
            return None

        # Sort by TIME_SLOTS order
        all_active_slots.sort(key=lambda s: TIME_SLOTS.index(s) if s in TIME_SLOTS else 99)
        first = all_active_slots[0].split('-')[0]
        last = all_active_slots[-1].split('-')[1]
        return f"{first}-{last}"  # e.g. "09:50AM-05:00PM"

    def parse_cell_value(self, cell_value: str):
        """
        Parse a teacher timetable cell string.
        Format: "Year 2-CSE-H-Algorithms Lab"
        Returns: (year_int, dept, section, subject)
        """
        without_prefix = cell_value[5:]                   # "2-CSE-H-Algorithms Lab"
        parts = without_prefix.split("-", 3)              # ["2", "CSE", "H", "Algorithms Lab"]
        return int(parts[0]), parts[1], parts[2], parts[3]

    def time_slot_to_index(self, time_slot: str):
        """Map time string to column index (1-9)."""
        try:
            return TIME_SLOTS.index(time_slot)
        except ValueError:
            return None

    def index_to_time_slot(self, index: int):
        """Map column index to time string."""
        if 0 < index < len(TIME_SLOTS):
            return TIME_SLOTS[index]
        return None

    def strip_designation(self, full_name: str):
        """
        'AssistantProf Ravi' → 'Ravi'
        'Professor Amit'     → 'Amit'
        """
        return full_name.split(" ", 1)[-1] if " " in full_name else full_name

    def build_class_key(self, year: int, dept: str, section: str):
        return f"Year {year}-{dept}-{section}"

    def build_cell_value(self, year: int, dept: str, section: str, subject: str):
        return f"Year {year}-{dept}-{section}-{subject}"

    # ─────────────────────────────────────────────────────────
    # TIMETABLE LOOKUPS
    # ─────────────────────────────────────────────────────────

    def get_teacher_grid(self, teacher_id: str):
        """Return the 2D grid array for a teacher from the single teacher_t document."""
        return db.get_teacher_timetable(teacher_id)

    def get_class_slot(self, year: int, dept: str, section: str, day: str, time_slot: str):
        """
        Return a single slot dict {subject, teacher, room} from Timetable_{year}.
        Returns None if not found.
        """
        tt_doc = db.get_class_timetable(year)
        if not tt_doc:
            return None
        class_key = self.build_class_key(year, dept, section)
        for day_entry in tt_doc.get("timetable", {}).get(class_key, []):
            if day_entry.get("day") == day:
                return day_entry.get("schedule", {}).get(time_slot)
        return None

    def get_class_full_timetable(self, year: int, class_key: str):
        """Return the full day array for a class."""
        tt_doc = db.get_class_timetable(year)
        if not tt_doc:
            return None
        return tt_doc.get("timetable", {}).get(class_key)

    def is_slot_empty(self, slot: dict):
        """A slot is empty if subject is None, Lunch, or CB."""
        if not slot:
            return True
        return slot.get("subject") in (None, "Lunch", "CB", "")

    # ─────────────────────────────────────────────────────────
    # VALIDATION
    # ─────────────────────────────────────────────────────────

    def validate_source_slot(self, teacher_id: str, day: str, slot_index: int):
        """
        Check teacher owns the source slot.
        Returns cell_value string or raises ValueError.
        """
        grid = self.get_teacher_grid(teacher_id)
        if not grid:
            raise ValueError("Teacher timetable not found")

        for row in grid:
            if row[0] == day:
                if slot_index >= len(row) or not row[slot_index]:
                    raise ValueError("Selected slot is empty. Please select a slot you teach.")
                return row[slot_index]

        raise ValueError(f"Day '{day}' not found in teacher timetable")

    def validate_no_active_request(self, teacher_id: str):
        """Raise ValueError if teacher already has an active request."""
        if db.has_active_request(teacher_id):
            raise ValueError(
                "You already have an active replacement request. "
                "Resolve it before creating a new one."
            )

    def validate_not_same_slot(self, src_day, src_time, tgt_day, tgt_time):
        if src_day == tgt_day and src_time == tgt_time:
            raise ValueError("Source and target slots cannot be the same.")

    def get_class_last_slot(self, year: int, dept: str, section: str):
        """Find the last active time slot for a class across all days."""
        class_key = self.build_class_key(year, dept, section)
        tt_doc = db.get_class_timetable(year)
        class_days = tt_doc.get("timetable", {}).get(class_key, [])
        last_slot = None
        for day_entry in class_days:
            for time_slot, slot_data in day_entry["schedule"].items():
                if slot_data.get("subject") not in (None, "Lunch", "CB", ""):
                    if last_slot is None or TIME_SLOTS.index(time_slot) > TIME_SLOTS.index(last_slot):
                        last_slot = time_slot
        return last_slot

    def validate_same_class(self, source: dict, t_year: int, t_dept: str, t_section: str):
        src_last = self.get_class_last_slot(source["year"], source["dept"], source["section"])
        tgt_last = self.get_class_last_slot(t_year, t_dept, t_section)
        if src_last != tgt_last:
            raise ValueError("Cannot swap slots between classes with different shift timings.")

    def validate_room_available(self, room_id: str, day: str, slot_index: int):
        grid = db.get_room_timetable(room_id)
        if not grid:
            raise ValueError(f"Room {room_id} not found")
        for row in grid:
            if row[0] == day:
                if row[slot_index] is not None:
                    raise ValueError(f"Room {room_id} is already occupied at that slot.")
                return

    # ─────────────────────────────────────────────────────────
    # REQUEST INFERENCE
    # ─────────────────────────────────────────────────────────

    def infer_request_type(self, target_slot_data: dict, teacher_id: str):
        """
        Determine type based on target slot content.
        Returns: 'relocate' | 'swap_self' | 'swap_other'
        """
        if self.is_slot_empty(target_slot_data):
            return "relocate"
        if target_slot_data.get("teacher_id") == teacher_id:
            return "swap_self"
        return "swap_other"

    # ─────────────────────────────────────────────────────────
    # CORE FLOW
    # ─────────────────────────────────────────────────────────

    def select_source(self, teacher_id: str, day: str, time_slot: str):
        """
        Step 1: Teacher selects their source slot.
        Validates ownership, stores a draft request, returns the class timetable.
        """
        self.validate_no_active_request(teacher_id)
        slot_index = self.time_slot_to_index(time_slot)  # derive it here
        if not slot_index:
            raise ValueError(f"Invalid time slot: {time_slot}")
        cell_value = self.validate_source_slot(teacher_id, day, slot_index)      
        year, dept, section, subject = self.parse_cell_value(cell_value)
        class_key = self.build_class_key(year, dept, section)
        class_timetable = self.get_class_full_timetable(year, class_key)
        if not class_timetable:
            raise ValueError(f"Class timetable not found for {class_key}")

        teacher_info = db.get_teacher_by_id(teacher_id)
        if not teacher_info:
            raise ValueError("Teacher record not found")

        draft = {
            "status": "draft",
            "type": None,
            "requester": {
                "teacher_id": teacher_id,
                "name": teacher_info["Name"],
                "gmail": teacher_info["gmail"],
                "designation": teacher_info.get("Designation", "")
            },
            "source_slot": {
                "day": day,
                "time_slot": time_slot,
                "slot_index": slot_index,
                "subject": subject,
                "year": year,
                "dept": dept,
                "section": section,
                "class_key": class_key
            },
            "target_slot": None,
            "involved_teacher": None,
            "reason": None,
            "additional_message": None,
            "admin_note": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        mongo_id = db.create_replacement_request(draft)

        return {
            "request_id": mongo_id,
            "source_slot": draft["source_slot"],
            "class_timetable": class_timetable
        }

    def select_target(self, request_id: str, teacher_id: str,
                       target_class_key: str, day: str, time_slot: str,
                       reason: str, additional_message: str = ""):
       
        req = db.get_replacement_request(request_id)
        if not req:
            raise ValueError("Request not found")
        if req["status"] != "draft":
            raise ValueError("Request is no longer in draft state")
        if req["requester"]["teacher_id"] != teacher_id:
            raise PermissionError("Not your request")

        source = req["source_slot"]
        # Parse target class key "Year 1-CSE-A"
        try:
            parts = target_class_key.split("-", 2)
            t_year = int(parts[0].replace("Year ", "").strip())
            t_dept = parts[1]
            t_section = parts[2]
        except Exception:
            raise ValueError(f"Invalid class key format: {target_class_key}")

        self.validate_same_class(source, t_year, t_dept, t_section)
        self.validate_not_same_slot(source["day"], source["time_slot"], day, time_slot)

        target_slot_data = self.get_class_slot(t_year, t_dept, t_section, day, time_slot)
        if target_slot_data is None:
            raise ValueError("Target slot not found in class timetable")

        req_type = self.infer_request_type(target_slot_data, teacher_id)

        # Check room availability for relocate before proceeding
        if req_type == "relocate":
            src_slot_data = self.get_class_slot(
                source["year"], source["dept"], source["section"],
                source["day"], source["time_slot"]
            )
            room_id = src_slot_data.get("room") if src_slot_data else None
            if room_id:
                self.validate_room_available(room_id, day, self.time_slot_to_index(time_slot))

        involved_teacher = None
        if req_type == "swap_other":
            other = db.get_teacher_by_id(target_slot_data.get("teacher_id"))
            if not other:
                raise ValueError(
                    f"Teacher record not found for {target_slot_data.get('teacher')}"
                )
            involved_teacher = {
                "teacher_id": other["TeacherID"],
                "name": other["Name"],
                "gmail": other["gmail"],
                "designation": other.get("Designation", ""),
                "status": "pending"
            }

        new_status = ("awaiting_admin" if req_type in ("relocate", "swap_self")
                      else "pending_teacher")

        target_slot = {
            "day": day,
            "time_slot": time_slot,
            "slot_index": self.time_slot_to_index(time_slot),
            "subject": target_slot_data.get("subject"),
            "teacher": target_slot_data.get("teacher"),
            "room": target_slot_data.get("room"),
            "year": t_year,
            "dept": t_dept,
            "section": t_section,
            "class_key": target_class_key
        }

        db.update_replacement_request(request_id, {
            "type": req_type,
            "target_slot": target_slot,
            "involved_teacher": involved_teacher,
            "reason": reason,
            "additional_message": additional_message,
            "status": new_status
        })

        return {
            "request_id": request_id,
            "type": req_type,
            "status": new_status,
            "target_slot": target_slot,
            "involved_teacher": involved_teacher
        }

    def teacher_action(self, request_id: str, teacher_id: str, action: str):
        """
        Step 5: Involved teacher accepts or rejects a swap_other request.
        """
        req = db.get_replacement_request(request_id)
        if not req:
            raise ValueError("Request not found")
        if req["status"] != "pending_teacher":
            raise ValueError("This request is not awaiting teacher action")

        involved = req.get("involved_teacher")
        if not involved or involved["teacher_id"] != teacher_id:
            raise PermissionError("You are not the involved teacher for this request")

        if action == "accept":
            db.update_replacement_request(request_id, {
                "status": "awaiting_admin",
                "involved_teacher.status": "accepted"
            })
            return {"status": "awaiting_admin", "message": "Swap accepted. Forwarded to admin."}

        elif action == "reject":
            db.update_replacement_request(request_id, {
                "status": "rejected",
                "involved_teacher.status": "rejected"
            })
            return {"status": "rejected", "message": "Swap request rejected."}

        else:
            raise ValueError("action must be 'accept' or 'reject'")

    def admin_action(self, request_id: str, action: str, admin_note: str = ""):
        """
        Step 4: Admin approves or rejects a request.
        Applies timetable changes on approval.
        """
        req = db.get_replacement_request(request_id)
        if not req:
            raise ValueError("Request not found")
        if req["status"] == "pending_teacher":
            raise PermissionError(
                "Cannot act yet — waiting for the involved teacher to respond"
            )
        if req["status"] != "awaiting_admin":
            raise ValueError(f"Request is already {req['status']}")

        if action == "approve":
            self.apply_timetable_changes(req)
            db.update_replacement_request(request_id, {
                "status": "approved",
                "admin_note": admin_note
            })
            return {"status": "approved", "message": "Request approved. Timetables updated."}

        elif action == "reject":
            db.update_replacement_request(request_id, {
                "status": "rejected",
                "admin_note": admin_note
            })
            return {"status": "rejected", "message": "Request rejected."}

        else:
            raise ValueError("action must be 'approve' or 'reject'")

    def get_dashboard(self, role: str, teacher_id: str = None):
        """Return active requests + padding to minimum 5."""
        if role == "admin":
            return db.get_requests_dashboard()
        elif role == "teacher":
            return db.get_requests_dashboard(teacher_id=teacher_id)
        else:
            raise PermissionError("Access denied")

    # ─────────────────────────────────────────────────────────
    # TIMETABLE MODIFIER
    # ─────────────────────────────────────────────────────────

    def apply_timetable_changes(self, req: dict):
        """Permanently update class, teacher, room and raw timetables on approval."""
        src = req["source_slot"]
        tgt = req["target_slot"]
        req_type = req["type"]
        year = src["year"]
        class_key = src["class_key"]

        src_data = self.get_class_slot(year, src["dept"], src["section"],
                                        src["day"], src["time_slot"])
        tgt_data = self.get_class_slot(year, tgt["dept"], tgt["section"],
                                        tgt["day"], tgt["time_slot"])

        src_raw_idx = self.get_raw_slot_index(year, src["dept"], src["section"], src["time_slot"])
        tgt_raw_idx = self.get_raw_slot_index(year, src["dept"], src["section"], tgt["time_slot"])

        if req_type == "relocate":
            # Class timetable: move source → target, clear source
            db.update_class_slot(year, class_key, tgt["day"], tgt["time_slot"],
                                  src_data["subject"], src_data["teacher"],
                                  src_data.get("teacher_id"), src_data["room"])
            db.update_class_slot(year, class_key, src["day"], src["time_slot"],
                                  None, None, None, None)
            # Teacher timetable: clear source, write target
            cell = self.build_cell_value(year, src["dept"], src["section"], src["subject"])
            db.update_teacher_slot(req["requester"]["teacher_id"],
                                    src["day"], src["slot_index"], None)
            db.update_teacher_slot(req["requester"]["teacher_id"],
                                    tgt["day"], tgt["slot_index"], cell)
            # Room timetable: clear source, write target
            room_id = src_data.get("room")
            if room_id:
                db.update_room_slot(room_id, src["day"], src["slot_index"], None)
                db.update_room_slot(room_id, tgt["day"], tgt["slot_index"],
                                    self.build_class_key(src["year"], src["dept"], src["section"]))
            # Raw timetable: clear source, write target
            if src_raw_idx:
                db.update_raw_timetable_slot(year, class_key, src["day"], src_raw_idx, None)
            if tgt_raw_idx:
                db.update_raw_timetable_slot(year, class_key, tgt["day"], tgt_raw_idx, src["subject"])

        elif req_type == "swap_self":
            # Class timetable: swap both slots
            db.update_class_slot(year, class_key, src["day"], src["time_slot"],
                                  tgt_data["subject"], tgt_data["teacher"],
                                  tgt_data.get("teacher_id"), tgt_data["room"])
            db.update_class_slot(year, class_key, tgt["day"], tgt["time_slot"],
                                  src_data["subject"], src_data["teacher"],
                                  src_data.get("teacher_id"), src_data["room"])
            # Teacher timetable: swap both cells
            src_cell = self.build_cell_value(year, src["dept"], src["section"], src["subject"])
            tgt_cell = self.build_cell_value(year, tgt["dept"], tgt["section"], tgt["subject"])
            db.update_teacher_slot(req["requester"]["teacher_id"],
                                    src["day"], src["slot_index"], tgt_cell)
            db.update_teacher_slot(req["requester"]["teacher_id"],
                                    tgt["day"], tgt["slot_index"], src_cell)
            # Room timetable: swap both slots
            src_room = src_data.get("room")
            tgt_room = tgt_data.get("room")
            class_label = self.build_class_key(src["year"], src["dept"], src["section"])
            if src_room:
                db.update_room_slot(src_room, src["day"], src["slot_index"], None)
                db.update_room_slot(src_room, tgt["day"], tgt["slot_index"], class_label)
            if tgt_room:
                db.update_room_slot(tgt_room, tgt["day"], tgt["slot_index"], None)
                db.update_room_slot(tgt_room, src["day"], src["slot_index"], class_label)
            # Raw timetable: swap both slots
            if src_raw_idx and tgt_raw_idx:
                db.update_raw_timetable_slot(year, class_key, src["day"], src_raw_idx, tgt["subject"])
                db.update_raw_timetable_slot(year, class_key, tgt["day"], tgt_raw_idx, src["subject"])

        elif req_type == "swap_other":
            # Class timetable: swap both slots
            db.update_class_slot(year, class_key, src["day"], src["time_slot"],
                                  tgt_data["subject"], tgt_data["teacher"],
                                  tgt_data.get("teacher_id"), tgt_data["room"])
            db.update_class_slot(year, class_key, tgt["day"], tgt["time_slot"],
                                  src_data["subject"], src_data["teacher"],
                                  src_data.get("teacher_id"), src_data["room"])
            # Requester teacher timetable
            src_cell = self.build_cell_value(year, src["dept"], src["section"], src["subject"])
            tgt_cell = self.build_cell_value(year, tgt["dept"], tgt["section"], tgt["subject"])
            db.update_teacher_slot(req["requester"]["teacher_id"],
                                    src["day"], src["slot_index"], tgt_cell)
            db.update_teacher_slot(req["requester"]["teacher_id"],
                                    tgt["day"], tgt["slot_index"], src_cell)
            # Involved teacher timetable
            inv_id = req["involved_teacher"]["teacher_id"]
            db.update_teacher_slot(inv_id, tgt["day"], tgt["slot_index"], src_cell)
            db.update_teacher_slot(inv_id, src["day"], src["slot_index"], tgt_cell)
            # Room timetable: swap both slots
            src_room = src_data.get("room")
            tgt_room = tgt_data.get("room")
            class_label = self.build_class_key(src["year"], src["dept"], src["section"])
            if src_room:
                db.update_room_slot(src_room, src["day"], src["slot_index"], None)
                db.update_room_slot(src_room, tgt["day"], tgt["slot_index"], class_label)
            if tgt_room:
                db.update_room_slot(tgt_room, tgt["day"], tgt["slot_index"], None)
                db.update_room_slot(tgt_room, src["day"], src["slot_index"], class_label)
            # Raw timetable: swap both slots
            if src_raw_idx and tgt_raw_idx:
                db.update_raw_timetable_slot(year, class_key, src["day"], src_raw_idx, tgt["subject"])
                db.update_raw_timetable_slot(year, class_key, tgt["day"], tgt_raw_idx, src["subject"])

    def cancel_request(self, request_id: str, teacher_id: str):
        req = db.get_replacement_request(request_id)
        if not req:
            raise ValueError("Request not found")
        if req["requester"]["teacher_id"] != teacher_id:
            raise PermissionError("Not your request")
        if req["status"] in ("approved", "rejected"):
            raise ValueError(f"Request is already {req['status']}, cannot cancel")
        
        db.update_replacement_request(request_id, {"status": "rejected"})
        return {"message": "Request cancelled successfully"}