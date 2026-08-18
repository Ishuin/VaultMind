from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user_setting import UserSetting
import json


class CRUDUserSetting:
    def get(self, db: Session, user_id: int) -> Optional[UserSetting]:
        return db.query(UserSetting).filter(UserSetting.user_id == user_id).first()

    def get_values(self, db: Session, user_id: int) -> Dict[str, Any]:
        obj = self.get(db, user_id)
        if not obj or not obj.values:
            return {}
        try:
            return json.loads(obj.values)
        except Exception:
            return {}

    def upsert_values(self, db: Session, user_id: int, values: Dict[str, Any]) -> UserSetting:
        obj = self.get(db, user_id)
        if not obj:
            obj = UserSetting(user_id=user_id, values=json.dumps(values or {}))
            db.add(obj)
        else:
            existing = {}
            try:
                existing = json.loads(obj.values) if obj.values else {}
            except Exception:
                existing = {}
            existing.update(values or {})
            obj.values = json.dumps(existing)
        db.commit()
        db.refresh(obj)
        return obj

    def remove_keys(self, db: Session, user_id: int, keys: list) -> UserSetting:
        obj = self.get(db, user_id)
        if not obj:
            obj = UserSetting(user_id=user_id, values="{}")
            db.add(obj)
            db.commit()
            db.refresh(obj)
            return obj
        existing = {}
        try:
            existing = json.loads(obj.values) if obj.values else {}
        except Exception:
            existing = {}
        for k in keys:
            existing.pop(k, None)
        obj.values = json.dumps(existing)
        db.commit()
        db.refresh(obj)
        return obj


user_setting = CRUDUserSetting()
