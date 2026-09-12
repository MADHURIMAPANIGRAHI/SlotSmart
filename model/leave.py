from database.database_System import databaseManager
from datetime import datetime, date, timedelta
import math

db = databaseManager()


class LeaveManager:
    def _parse_slots_collection(self) -> list:
        slots = db.get_all_slot_keys()
        if not slots:
            raise ValueError("Slots collection is empty or missing.")
        return slots

    def _time_to_slot_indices(self, start_time: str, end_time: str, all_slots: list) -> list:
        """
        Given a time range, return indices of slots that overlap with it.
        """
        def parse_t(t):
            return datetime.strptime(t, "%I:%M%p")

        range_start = parse_t(start_time)
        range_end = parse_t(end_time)

        matched = []
        for i, slot_key in enumerate(all_slots):
            parts = slot_key.split("-")
            slot_s = parse_t(parts[0])
            slot_e = parse_t(parts[1])
            if slot_s < range_end and slot_e > range_start:
                matched.append(i)
        return matched

    def _get_teacher_schedule(self, teacher_id: str) -> list:
        """Returns teacher's 2D schedule array from teacher_t."""
        schedule = db.get_teacher_timetable(teacher_id)
        if schedule is None:
            raise ValueError(f"Teacher {teacher_id} not found in teacher_t.")
        return schedule

    def _get_date_day_index(self, d: date) -> int:
        """Monday=0 ... Sunday=6"""
        return d.weekday()

    def _parse_teacher_cell(self, cell: str) -> dict:
        """
        Parses teacher_t cell value.
        Format: "Year 2-CSE-F-Algorithms Lab"
        Returns: {year, branch, class_id, subject}
        """
        try:
            # Split on "-" max 3 times
            # "Year 2-CSE-F-Algorithms Lab" → ["Year 2", "CSE", "F", "Algorithms Lab"]
            parts = cell.split("-", 3)
            year = parts[0].replace("Year ", "").strip()   # "2"
            branch = parts[1].strip()                       # "CSE"
            section = parts[2].strip()                      # "F"
            subject = parts[3].strip()                      # "Algorithms Lab"
            class_id = f"Year {year}-{branch}-{section}"   # "Year 2-CSE-F"
            return {
                "year": year,
                "branch": branch,
                "class_id": class_id,
                "subject": subject
            }
        except (IndexError, AttributeError):
            return {}

    def _get_affected_slots(self, teacher_id: str, start_date: date, end_date: date,
                            start_time: str = None, end_time: str = None) -> list:
        """
        Returns list of dicts: {date, day_index, slot_index, slot_key, subject, year, branch, class_id}
        for all classes the teacher has during the leave period.
        """
        schedule = self._get_teacher_schedule(teacher_id)
        all_slots = self._parse_slots_collection()
        results = []

        current = start_date
        while current <= end_date:
            day_idx = self._get_date_day_index(current)
            if day_idx + 1 >= len(schedule):
                current += timedelta(days=1)
                continue

            day_row = schedule[day_idx + 1]

            if start_time and end_time:
                if current == start_date == end_date:
                    slot_indices = self._time_to_slot_indices(start_time, end_time, all_slots)
                elif current == start_date:
                    slot_indices = self._time_to_slot_indices(start_time, "11:59PM", all_slots)
                elif current == end_date:
                    slot_indices = self._time_to_slot_indices("12:00AM", end_time, all_slots)
                else:
                    slot_indices = list(range(len(day_row) - 1))
            else:
                slot_indices = list(range(len(day_row) - 1))

            for si in slot_indices:
                if si + 1 >= len(day_row):
                    continue
                cell = day_row[si + 1]
                if cell is None:
                    continue
                parsed = self._parse_teacher_cell(cell)
                if not parsed:
                    continue
                results.append({
                    "date": current.isoformat(),
                    "day_index": day_idx,
                    "slot_index": si,
                    "slot_key": all_slots[si] if si < len(all_slots) else None,
                    "subject": parsed["subject"],
                    "year": parsed["year"],
                    "branch": parsed["branch"],
                    "class_id": parsed["class_id"]
                })
            current += timedelta(days=1)

        return results

    def _calculate_vacation_days(self, start_date: date, end_date: date,
                                 start_time: str = None, end_time: str = None) -> int:
        """
        Count vacation days:
        - Full days = 1 per day
        - Partial: fraction < 0.5 → 0.5, >= 0.5 → 1
        - Total returned as int (ceil)
        """
        all_slots = self._parse_slots_collection()
        total_slots = len(all_slots)
        if total_slots == 0:
            return 0

        total = 0.0
        delta = (end_date - start_date).days + 1

        for i in range(delta):
            if start_time and end_time:
                if delta == 1:
                    count = len(self._time_to_slot_indices(start_time, end_time, all_slots))
                elif i == 0:
                    count = len(self._time_to_slot_indices(start_time, "11:59PM", all_slots))
                elif i == delta - 1:
                    count = len(self._time_to_slot_indices("12:00AM", end_time, all_slots))
                else:
                    count = total_slots

                fraction = count / total_slots
                total += 0.5 if fraction < 0.5 else 1.0
            else:
                total += 1.0

        return math.ceil(total)

    def _is_teacher_available_on_date(self, teacher_id: str, check_date: date, slot_index: int) -> bool:
        """
        Full availability check:
        1. No class in teacher_t for that day/slot
        2. Not on approved leave covering that date/slot
        3. Not already assigned as substitute for another class in that slot
        """
        day_index = self._get_date_day_index(check_date)

        try:
            schedule = self._get_teacher_schedule(teacher_id)
        except ValueError:
            return False

        if day_index + 1 < len(schedule):
            day_row = schedule[day_index + 1]
            if slot_index + 1 < len(day_row):
                cell = day_row[slot_index + 1]
                if cell is not None:
                    return False

        approved_leaves = db.get_leave_requests_by_query({
            "teacher_id": teacher_id,
            "status": "approved"
        })
        for leave in approved_leaves:
            l_start = date.fromisoformat(leave["start_date"])
            l_end = date.fromisoformat(leave["end_date"])
            if not (l_start <= check_date <= l_end):
                continue
            if leave.get("start_time") and leave.get("end_time"):
                all_slots = self._parse_slots_collection()
                affected = self._time_to_slot_indices(
                    leave["start_time"], leave["end_time"], all_slots
                )
                if slot_index in affected:
                    return False
            else:
                return False

        existing_sub = db.get_sub_slots_by_query({
            "assigned_teacher_id": teacher_id,
            "date": check_date.isoformat(),
            "slot_index": slot_index,
            "status": {"$in": ["assigned", "accepted"]}
        })
        if existing_sub:
            return False

        return True

    def _get_substitute_candidates(self, subject: str, year: str, branch: str,
                                   check_date: date, slot_index: int) -> dict:
        """
        Returns ranked substitute candidates:
        tier1 — teacher has the subject (or its base name) in their Subject field
        tier2 — teacher has any subject from the same branch and year
        tier3 — any available teacher
        """
        all_teachers = db.get_all("teacher_dataset", {}, {"_id": 0})
        subject_data = db.get_subject_data()

        # Strip " Lab" suffix to get base subject name for matching
        base_subject = subject.replace(" Lab", "").strip()

        # Collect all subjects for this branch and year (Theory + Lab combined)
        year_key = f"Year {year}" if not year.startswith("Year") else year
        branch_data = subject_data.get(year_key, {}).get(branch, {})
        alternate_subjects = set()
        for type_subjects in branch_data.values():
            for subj_name in type_subjects.keys():
                alternate_subjects.add(subj_name.replace(" Lab", "").strip())
        alternate_subjects.discard(base_subject)

        tier1, tier2, tier3 = [], [], []
        seen = set()

        for t in all_teachers:
            tid = t.get("TeacherID")
            if not tid:
                continue
            if not self._is_teacher_available_on_date(tid, check_date, slot_index):
                continue

            subjects_taught = [s.strip() for s in t.get("Subject", "").split(",") if s.strip()]
            base_subjects_taught = [s.replace(" Lab", "").strip() for s in subjects_taught]
            entry = {
                "teacher_id": tid,
                "name": t.get("Name"),
                "department": t.get("Department")
            }

            if base_subject in base_subjects_taught:
                tier1.append(entry)
                seen.add(tid)
            elif any(s in alternate_subjects for s in base_subjects_taught):
                tier2.append(entry)
                seen.add(tid)

        for t in all_teachers:
            tid = t.get("TeacherID")
            if not tid or tid in seen:
                continue
            if not self._is_teacher_available_on_date(tid, check_date, slot_index):
                continue
            tier3.append({
                "teacher_id": tid,
                "name": t.get("Name"),
                "department": t.get("Department")
            })

        return {"tier1": tier1, "tier2": tier2, "tier3": tier3}

    def submit_leave(self, teacher_id: str, start_date: str, end_date: str, reason: str,
                     start_time: str = None, end_time: str = None) -> str:
        """Teacher submits a leave request. Returns new leave_request_id."""
        if not reason or not reason.strip():
            raise ValueError("Reason is required.")

        s_date = date.fromisoformat(start_date)
        e_date = date.fromisoformat(end_date)

        if e_date < s_date:
            raise ValueError("End date cannot be before start date.")
        if (start_time and not end_time) or (end_time and not start_time):
            raise ValueError("Both start_time and end_time must be provided together.")

        existing = db.get_leave_requests_by_query({
            "teacher_id": teacher_id,
            "status": {"$in": ["pending_admin", "approved"]}
        })
        for ex in existing:
            ex_start = date.fromisoformat(ex["start_date"])
            ex_end = date.fromisoformat(ex["end_date"])
            if not (e_date < ex_start or s_date > ex_end):
                raise ValueError("An overlapping active leave request already exists.")

        vacation_days = self._calculate_vacation_days(s_date, e_date, start_time, end_time)

        doc = {
            "teacher_id": teacher_id,
            "start_date": start_date,
            "end_date": end_date,
            "start_time": start_time,
            "end_time": end_time,
            "reason": reason.strip(),
            "status": "pending_admin",
            "vacation_days": vacation_days,
            "created_at": datetime.utcnow().isoformat(),
            "cancelled_by": None
        }
        return db.create_leave_request(doc)

    def get_leave_request(self, leave_request_id: str) -> dict:
        doc = db.get_leave_request(leave_request_id)
        if not doc:
            raise ValueError("Leave request not found.")
        return doc

    def cancel_leave_by_teacher(self, teacher_id: str, leave_request_id: str):
        """Teacher cancels only if still pending_admin."""
        doc = db.get_leave_request(leave_request_id)
        if not doc:
            raise ValueError("Leave request not found.")
        if doc["teacher_id"] != teacher_id:
            raise PermissionError("You can only cancel your own leave requests.")
        if doc["status"] != "pending_admin":
            raise PermissionError("Cannot cancel after admin has acted on this request.")

        db.update_leave_request(leave_request_id, {
            "status": "cancelled",
            "cancelled_by": "teacher"
        })

    def admin_approve_leave(self, leave_request_id: str) -> dict:
        """
        Admin approves leave.
        Finds all affected slots and creates leave_sub_slots documents.
        Returns summary of slots created.
        """
        doc = db.get_leave_request(leave_request_id)
        if not doc:
            raise ValueError("Leave request not found.")
        if doc["status"] != "pending_admin":
            raise ValueError("Request is not in pending_admin state.")

        db.update_leave_request(leave_request_id, {"status": "approved"})

        teacher_id = doc["teacher_id"]
        s_date = date.fromisoformat(doc["start_date"])
        e_date = date.fromisoformat(doc["end_date"])
        start_time = doc.get("start_time")
        end_time = doc.get("end_time")

        affected = self._get_affected_slots(teacher_id, s_date, e_date, start_time, end_time)

        if not affected:
            return {"slots_created": 0, "message": "No classes found in leave period."}

        slots_created = 0
        for slot in affected:
            sub_slot_doc = {
                "leave_request_id": leave_request_id,
                "teacher_id": teacher_id,
                "date": slot["date"],
                "day_index": slot["day_index"],
                "slot_index": slot["slot_index"],
                "slot_key": slot["slot_key"],
                "subject": slot["subject"],
                "year": slot["year"],
                "branch": slot["branch"],
                "class_id": slot["class_id"],
                "assigned_teacher_id": None,
                "status": "unassigned",
                "created_at": datetime.utcnow().isoformat()
            }
            db.create_sub_slot(sub_slot_doc)
            slots_created += 1

        return {"slots_created": slots_created, "message": "Leave approved and sub slots created."}

    def admin_reject_leave(self, leave_request_id: str):
        """Admin rejects leave request."""
        doc = db.get_leave_request(leave_request_id)
        if not doc:
            raise ValueError("Leave request not found.")
        if doc["status"] != "pending_admin":
            raise ValueError("Request is not in pending_admin state.")

        db.update_leave_request(leave_request_id, {"status": "rejected"})

    def admin_cancel_approved_leave(self, leave_request_id: str):
        """Admin cancels approved leave. All sub slots cancelled regardless of state."""
        doc = db.get_leave_request(leave_request_id)
        if not doc:
            raise ValueError("Leave request not found.")
        if doc["status"] != "approved":
            raise ValueError("Only approved leaves can be cancelled by admin.")

        db.update_leave_request(leave_request_id, {
            "status": "cancelled",
            "cancelled_by": "admin"
        })
        db.cancel_all_sub_slots_for_leave(leave_request_id)

    def get_sub_slot_candidates(self, sub_slot_id: str) -> dict:
        """For a given sub slot, return ranked substitute teacher candidates."""
        slot = db.get_sub_slot(sub_slot_id)
        if not slot:
            raise ValueError("Sub slot not found.")

        return self._get_substitute_candidates(
            subject=slot["subject"],
            year=slot.get("year", ""),
            branch=slot.get("branch", ""),
            check_date=date.fromisoformat(slot["date"]),
            slot_index=slot["slot_index"]
        )

    def admin_assign_substitute(self, sub_slot_id: str, assigned_teacher_id: str):
        """Admin assigns a substitute teacher to a sub slot."""
        slot = db.get_sub_slot(sub_slot_id)
        if not slot:
            raise ValueError("Sub slot not found.")
        if slot["status"] not in ("unassigned", "rejected"):
            raise ValueError("Sub slot is not available for assignment.")

        teacher = db.get_teacher_by_id(assigned_teacher_id)
        if not teacher:
            raise ValueError("Assigned teacher not found.")

        db.update_sub_slot(sub_slot_id, {
            "assigned_teacher_id": assigned_teacher_id,
            "status": "assigned"
        })

    def teacher_respond_to_sub_slot(self, teacher_id: str, sub_slot_id: str, action: str):
        """Substitute teacher accepts or rejects a sub slot. action: 'accept' or 'reject'"""
        if action not in ("accept", "reject"):
            raise ValueError("Action must be 'accept' or 'reject'.")

        slot = db.get_sub_slot(sub_slot_id)
        if not slot:
            raise ValueError("Sub slot not found.")
        if slot.get("assigned_teacher_id") != teacher_id:
            raise PermissionError("This sub slot is not assigned to you.")
        if slot["status"] != "assigned":
            raise ValueError("Sub slot is not in assigned state.")

        db.update_sub_slot(sub_slot_id, {
            "status": "accepted" if action == "accept" else "rejected"
        })

    def get_admin_leave_list(self) -> list:
        """Active requests padded to last 5 if fewer active."""
        active = db.get_leave_requests_by_query({
            "status": {"$in": ["pending_admin", "approved"]}
        })
        active = sorted(active, key=lambda x: x.get("created_at", ""), reverse=True)

        if len(active) >= 5:
            return active

        needed = 5 - len(active)
        active_ids = {d["_id"] for d in active}
        others = db.get_leave_requests_by_query({
            "status": {"$nin": ["pending_admin", "approved"]}
        })
        others = sorted(others, key=lambda x: x.get("created_at", ""), reverse=True)

        padded = []
        for doc in others:
            if doc["_id"] not in active_ids:
                padded.append(doc)
            if len(padded) >= needed:
                break

        return active + padded

    def get_teacher_leave_history(self, teacher_id: str) -> list:
        """All leave requests for a teacher, newest first."""
        docs = db.get_leave_requests_by_query({"teacher_id": teacher_id})
        return sorted(docs, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_sub_slots_for_leave(self, leave_request_id: str) -> list:
        """All sub slots for a given leave request."""
        return db.get_sub_slots_by_query({"leave_request_id": leave_request_id})

    def get_daily_substitutions(self, query_date: str) -> list:
        """
        All substitution info for a given date.
        Called by student/teacher dashboard modules.
        """
        slots = db.get_sub_slots_by_query({
            "date": query_date,
            "status": {"$in": ["assigned", "accepted"]}
        })
        return [{
            "slot_key": s.get("slot_key"),
            "slot_index": s.get("slot_index"),
            "assigned_teacher_id": s.get("assigned_teacher_id"),
            "subject": s.get("subject"),
            "class_id": s.get("class_id"),
            "year": s.get("year"),
            "branch": s.get("branch"),
            "status": s.get("status")
        } for s in slots]

    def get_teacher_pending_sub_slots(self, teacher_id: str) -> list:
        """Sub slots assigned to a teacher awaiting their response."""
        return db.get_sub_slots_by_query({
            "assigned_teacher_id": teacher_id,
            "status": "assigned"
        })

    def get_teacher_vacation_days(self, teacher_id: str) -> int:
        """Total approved vacation days for a teacher."""
        leaves = db.get_leave_requests_by_query({
            "teacher_id": teacher_id,
            "status": "approved"
        })
        return sum(l.get("vacation_days", 0) for l in leaves)