import pytest
from app.api.decision_dates import list_decision_dates
from app.api.decisions import get_decision_replay, export_decision_csv, get_decision_revisions
from app.api.analytics import get_analytics_summary
from app.api.health import health_check, data_quality_audit


def test_health():
    res = health_check()
    assert res["status"] == "healthy"
    assert res["product"] == "WindLens"


def test_decision_dates():
    res = list_decision_dates()
    assert res["count"] == 31
    assert res["decision_dates"][0]["decision_date"] == "2026-01-01"
    assert res["decision_dates"][0]["delivery_date"] == "2026-01-02"
    assert res["decision_dates"][-1]["decision_date"] == "2026-01-31"
    assert res["decision_dates"][-1]["delivery_date"] == "2026-02-01"


def test_decision_replay_jan14():
    res = get_decision_replay("2026-01-14", "15:30")
    assert res["decision_date"] == "2026-01-14"
    assert res["delivery_date"] == "2026-01-15"
    assert len(res["intervals"]) == 48
    assert res["summary"]["matched_intervals"] == 48
    assert res["summary"]["coverage_pct"] == 100.0
    assert res["summary"]["mae_mw"] > 0


def test_decision_revisions_jan14():
    res = get_decision_revisions("2026-01-14", "15:30")
    revisions = res["revisions"]
    assert len(revisions) > 0
    # Check that post-15:30 revisions are flagged as EXCLUDED
    post_cutoff = [r for r in revisions if r["publish_time"] > "2026-01-14T15:30:00Z"]
    for r in post_cutoff:
        assert r["status"] == "EXCLUDED"
        assert r["is_eligible"] is False


def test_csv_export():
    res = export_decision_csv("2026-01-14", "15:30")
    csv_text = res.body.decode("utf-8")
    assert "# WindLens Decision Snapshot Export" in csv_text
    assert "2026-01-14" in csv_text
    assert "2026-01-15" in csv_text
    assert "Settlement Period,Interval Start Time (UTC)" in csv_text


def test_analytics_summary():
    res = get_analytics_summary("2026-01-01", "2026-01-31", "15:30")
    assert res["decision_days_count"] == 31
    assert res["total_matched_intervals"] == 31 * 48
    assert res["coverage_pct"] == 100.0
    assert len(res["diurnal_profile"]) == 24
    assert res["mae_mw"] > 0


def test_data_quality_report():
    res = data_quality_audit()
    assert res["status"] == "healthy"
    assert res["records_ingested"]["missing_intervals"] == 0
