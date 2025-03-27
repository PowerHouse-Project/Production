import pytest
from unittest.mock import patch, mock_open, MagicMock
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import automations

# Mock the devices_json import
mock_devices_json = MagicMock()
modules = {
    'devices_json': mock_devices_json,
}
patcher = patch.dict('sys.modules', modules)
patcher.start()

def test_loadAutomations_success():
    mock_data = json.dumps({
        "automations": [
            {"id": 1, "name": "Test Automation", "device_id": "123", "triggers": "12:00", "enabled": True, "status": "on"}
        ]
    })
    
    with patch("builtins.open", mock_open(read_data=mock_data)):
        result = automations.loadAutomations()
        assert result == {
            "automations": [
                {"id": 1, "name": "Test Automation", "device_id": 123, "triggers": "12:00", "enabled": True, "status": "on"}
            ]
        }

def test_loadAutomations_empty_file():
    mock_data = json.dumps({})
    
    with patch("builtins.open", mock_open(read_data=mock_data)):
        result = automations.loadAutomations()
        assert result == {"automations": []}

def test_loadAutomations_missing_automations_key():
    mock_data = json.dumps({"some_other_key": []})
    
    with patch("builtins.open", mock_open(read_data=mock_data)):
        result = automations.loadAutomations()
        assert result == {"automations": []}

def test_updateAutomationStatus(mocker):
    data = {"automations": [{"id": 1, "enabled": False}]}
    
    mock_open = mocker.patch("builtins.open", mocker.mock_open())
    mock_json_load = mocker.patch("json.load", return_value=data)
    mock_json_dump = mocker.patch("json.dump")

    automations.updateAutomationStatus(1, True)

    expected = {"automations": [{"id": 1, "enabled": True}]}
    mock_json_dump.assert_called_with(expected, mock_open(), indent=4)

def test_addAutomation(mocker):
    initial_data = {"automations": [{"id": 1, "name": "Test", "device_id": 2, "triggers": "10:00", "enabled": True, "status": "on"}]}
    mock_open = mocker.patch("builtins.open", mocker.mock_open())
    mock_json_load = mocker.patch("json.load", return_value=initial_data)
    mock_json_dump = mocker.patch("json.dump")

    automations.addAutomation("New Automation", 3, "12:30", "off")

    expected_data = {
        "automations": [
            {"id": 1, "name": "Test", "device_id": 2, "triggers": "10:00", "enabled": True, "status": "on"},
            {"id": 2, "name": "New Automation", "device_id": 3, "triggers": "12:30", "enabled": True, "status": "off"}
        ]
    }

    mock_json_dump.assert_called_with(expected_data, mock_open(), indent=4)

def test_deleteAutomation(mocker):
    initial_data = {
        "automations": [
            {"id": 1, "name": "Test", "device_id": 2, "triggers": "10:00", "enabled": True, "status": "on"},
            {"id": 2, "name": "To Delete", "device_id": 3, "triggers": "12:30", "enabled": True, "status": "off"}
        ]
    }
    mock_open = mocker.patch("builtins.open", mocker.mock_open())
    mock_json_load = mocker.patch("json.load", return_value=initial_data)
    mock_json_dump = mocker.patch("json.dump")

    automations.deleteAutomation(2)

    expected_data = {
        "automations": [
            {"id": 1, "name": "Test", "device_id": 2, "triggers": "10:00", "enabled": True, "status": "on"}
        ]
    }

    mock_json_dump.assert_called_with(expected_data, mock_open(), indent=4)

def test_editAutomation(mocker):
    initial_data = {
        "automations": [
            {"id": 1, "name": "Test", "device_id": 2, "triggers": "10:00", "enabled": True, "status": "on"}
        ]
    }
    mock_open = mocker.patch("builtins.open", mocker.mock_open())
    mock_json_load = mocker.patch("json.load", return_value=initial_data)
    mock_json_dump = mocker.patch("json.dump")

    automations.editAutomation(1, "Updated Name", 5, "18:00", False)

    expected_data = {
        "automations": [
            {"id": 1, "name": "Updated Name", "device_id": 5, "triggers": "18:00", "enabled": False, "status": "on"}
        ]
    }

    mock_json_dump.assert_called_with(expected_data, mock_open(), indent=4)

patcher.stop()