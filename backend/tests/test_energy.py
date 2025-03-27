import json
import pytest
from unittest import mock
from energy_json import get_energy_data, set_energy_goal, get_energy_goal

@pytest.fixture
def mock_files(mocker):
    """Mocks file operations for testing."""
    mock_open = mocker.patch("builtins.open", mocker.mock_open())
    mock_json_load = mocker.patch("json.load")
    mock_json_dump = mocker.patch("json.dump")
    return mock_json_load, mock_json_dump


def test_get_energy_data_daily(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.return_value = [
        { "timestamp": "2025-03-01T00:00:00", "power_usage": 4800 },
        { "timestamp": "2025-03-02T00:00:00", "power_usage": 5120 },
        { "timestamp": "2025-03-03T00:00:00", "power_usage": 4500 }
    ]

    result = get_energy_data("daily")
    assert result == [
        { "timestamp": "2025-03-01T00:00:00", "power_usage": 4800 },
        { "timestamp": "2025-03-02T00:00:00", "power_usage": 5120 },
        { "timestamp": "2025-03-03T00:00:00", "power_usage": 4500 }
    ]


def test_get_energy_data_monthly(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.return_value = [
        { "timestamp": "2024-01-01T00:00:00", "power_usage": 150000 },
        { "timestamp": "2024-02-01T00:00:00", "power_usage": 153500 },
        { "timestamp": "2024-03-01T00:00:00", "power_usage": 160000 }
    ]

    result = get_energy_data("monthly")
    assert result == [
        { "timestamp": "2024-01-01T00:00:00", "power_usage": 150000 },
        { "timestamp": "2024-02-01T00:00:00", "power_usage": 153500 },
        { "timestamp": "2024-03-01T00:00:00", "power_usage": 160000 }
    ]


def test_get_energy_data_invalid_time_range(mock_files):
    result = get_energy_data("yearly")
    assert result == {"error": "Invalid time range. Use 'daily' or 'monthly'."}


def test_get_energy_data_file_not_found(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = FileNotFoundError

    result = get_energy_data("daily")
    assert result == {"error": "daily_energy.json not found."}


def test_get_energy_data_json_decode_error(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = json.JSONDecodeError("Invalid JSON", "", 0)

    result = get_energy_data("monthly")
    assert result == {"error": "Invalid JSON format in monthly_energy.json."}


def test_set_energy_goal(mock_files):
    mock_json_dump = mock_files[1]
    result = set_energy_goal(15.0)
    assert result == {"success": "Energy goal set to 15.0 and saved to energy_goal.json"}
    mock_json_dump.assert_called_once_with({"goal_value": 15.0}, mock.ANY, indent=4)


def test_set_energy_goal_error(mock_files):
    mock_json_dump = mock_files[1]
    mock_json_dump.side_effect = Exception("Some error")

    result = set_energy_goal(20.0)
    assert result == {"error": "Error saving energy goal: Some error"}


def test_get_energy_goal(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.return_value = {"goal_value": 14.0}

    result = get_energy_goal()
    assert result == {"goal_value": 14.0}


def test_get_energy_goal_file_not_found(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = FileNotFoundError

    result = get_energy_goal()
    assert result == {"error": "energy_goal.json not found."}


def test_get_energy_goal_json_decode_error(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = json.JSONDecodeError("Invalid JSON", "", 0)

    result = get_energy_goal()
    assert result == {"error": "Invalid JSON format in energy_goal.json."}
