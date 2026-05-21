import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.getenv("AUDIT_DB_PATH", BASE_DIR / "audit.db"))

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    service TEXT,
    path TEXT,
    description TEXT NOT NULL,
    status_code INTEGER,
    metadata TEXT
)
"""


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_audit_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = _connect()
    conn.execute(CREATE_TABLE_SQL)
    conn.commit()
    conn.close()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    if row is None:
        return {}
    return {
        "id": row["id"],
        "timestamp": row["timestamp"],
        "event_type": row["event_type"],
        "category": row["category"],
        "service": row["service"],
        "path": row["path"],
        "description": row["description"],
        "status_code": row["status_code"],
        "metadata": json.loads(row["metadata"] or "{}"),
    }


def record_event(
    event_type: str,
    category: str,
    description: str,
    service: Optional[str] = None,
    path: Optional[str] = None,
    status_code: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    init_audit_db()
    payload = json.dumps(metadata or {})
    conn = _connect()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO audit_events (timestamp, event_type, category, service, path, description, status_code, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (_now_iso(), event_type, category, service, path, description, status_code, payload),
    )
    conn.commit()
    row_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM audit_events WHERE id = ?", (row_id,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def _parse_timestamp(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    try:
        datetime.fromisoformat(value)
        return value
    except ValueError:
        raise ValueError(f"Invalid ISO timestamp: {value}")


def query_events(
    event_type: Optional[str] = None,
    category: Optional[str] = None,
    service: Optional[str] = None,
    path_contains: Optional[str] = None,
    since: Optional[str] = None,
    until: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    init_audit_db()
    if limit < 1:
        limit = 100
    if offset < 0:
        offset = 0
    since = _parse_timestamp(since)
    until = _parse_timestamp(until)

    where_clauses = ["1 = 1"]
    params: List[Any] = []

    if event_type:
        where_clauses.append("event_type = ?")
        params.append(event_type)
    if category:
        where_clauses.append("category = ?")
        params.append(category)
    if service:
        where_clauses.append("service = ?")
        params.append(service)
    if path_contains:
        where_clauses.append("path LIKE ?")
        params.append(f"%{path_contains}%")
    if since:
        where_clauses.append("timestamp >= ?")
        params.append(since)
    if until:
        where_clauses.append("timestamp <= ?")
        params.append(until)

    sql = (
        "SELECT * FROM audit_events WHERE "
        + " AND ".join(where_clauses)
        + " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    )
    params.extend([limit, offset])
    conn = _connect()
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def get_event_statistics() -> Dict[str, Any]:
    init_audit_db()
    conn = _connect()
    totals = conn.execute("SELECT COUNT(*) AS total FROM audit_events").fetchone()["total"]
    by_type = {
        row["event_type"]: row["total"]
        for row in conn.execute("SELECT event_type, COUNT(*) AS total FROM audit_events GROUP BY event_type")
    }
    by_category = {
        row["category"]: row["total"]
        for row in conn.execute("SELECT category, COUNT(*) AS total FROM audit_events GROUP BY category")
    }
    by_service = {
        row["service"] or "unknown": row["total"]
        for row in conn.execute("SELECT COALESCE(service, 'unknown') AS service, COUNT(*) AS total FROM audit_events GROUP BY service")
    }
    last_occurrence = {
        row["event_type"]: row["last_seen"]
        for row in conn.execute(
            "SELECT event_type, MAX(timestamp) AS last_seen FROM audit_events GROUP BY event_type"
        )
    }
    conn.close()
    return {
        "total_events": totals,
        "events_by_type": by_type,
        "events_by_category": by_category,
        "events_by_service": by_service,
        "last_occurrence": last_occurrence,
    }


def clear_audit_events() -> None:
    init_audit_db()
    conn = _connect()
    conn.execute("DELETE FROM audit_events")
    conn.commit()
    conn.close()
