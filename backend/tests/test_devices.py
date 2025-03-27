import json
import pytest
from unittest import mock
from devices_json import (
    loadJSON, loadDevicesJSON, changeDeviceName, changeDeviceStatus, sumPower, sumRating, changeConnection
)

@pytest.fixture
def mock_files(mocker):
    """Mocks file operations for testing."""
    mock_open = mocker.patch("builtins.open", mocker.mock_open())
    mock_json_load = mocker.patch("json.load")
    mock_json_dump = mocker.patch("json.dump")
    return mock_json_load, mock_json_dump

def test_loadJSON(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = [
        {"users": [{"user_name": "Aditya", "allocated_devices": [1, 2]}]},
        {"selected_user": "Aditya"},
        {"smart_home_devices": [{"id": 1, "name": "Light", "status": "off"}, {"id": 2, "name": "Fan", "status": "on"}]}
    ]

    result = loadJSON()

    assert result == {"smart_home_devices": [
        {"id": 1, "name": "Light", "status": "off"},
        {"id": 2, "name": "Fan", "status": "on"},
    ]}

def test_changeDeviceName(mock_files):
    mock_json_load, mock_json_dump = mock_files
    mock_json_load.side_effect = [
        {"users": [{"user_name": "Aditya", "allocated_devices": [1]}]},  
        {"selected_user": "Aditya"},  
        {"smart_home_devices": [{"id": 1, "name": "Light"}]}
    ]

    result = changeDeviceName(1, "New Light")
    assert result == {"success": "Changed device name to New Light."}

    mock_json_dump.assert_called_with({"smart_home_devices": [{"id": 1, "name": "New Light"}]}, mock.ANY, indent=2)


def test_sumPower(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = [
        {"users": [{"user_name": "Aditya", "allocated_devices": [1, 2]}]},  
        {"selected_user": "Aditya"},  
        {"smart_home_devices": [{"id": 1, "power_usage": 10}, {"id": 2, "power_usage": 20}]}
    ]

    assert sumPower() == 30

def test_sumRating(mock_files):
    mock_json_load, _ = mock_files
    mock_json_load.side_effect = [
        {"users": [{"user_name": "Aditya", "allocated_devices": [1, 2]}]},  
        {"selected_user": "Aditya"},  
        {"smart_home_devices": [{"id": 1, "power_rating": 50}, {"id": 2, "power_rating": 30}]}
    ]

    assert sumRating() == 80
