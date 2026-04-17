from __future__ import annotations

import argparse
import json

import mysql.connector

from app.seed import seed_test_data
from app.store import db_config


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed deterministic AirHealth test data into MySQL.")
    parser.add_argument("--days", type=int, default=7, help="How many days of test data to generate. Default: 7")
    parser.add_argument(
        "--append",
        action="store_true",
        help="Append data instead of clearing existing rows first.",
    )
    args = parser.parse_args()

    conn = mysql.connector.connect(**db_config)
    try:
        result = seed_test_data(conn, days=args.days, clear_existing=not args.append)
    finally:
        conn.close()

    print(json.dumps({
        "ok": True,
        "days": result.days,
        "clear_existing": result.clear_existing,
        "inserted_rows": result.inserted_rows,
        "latest_snapshot": {
            **result.latest_snapshot,
            "recorded_at": result.latest_snapshot["recorded_at"].isoformat(),
        },
    }, indent=2))


if __name__ == "__main__":
    main()
