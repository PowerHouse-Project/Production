import unittest
from unittest.mock import patch, mock_open
import json
import devices_json as dj

# Assuming your original code is imported here
from groups import addGroup, deleteGroup, editGroup, changeGroupStatus, getGroupsForSelectedUser


class TestDeviceGroupFunctions(unittest.TestCase):
    
    # Helper method to mock file read/write for users_db.json
    def mock_file_read(self, data):
        return patch('builtins.open', new_callable=mock_open, read_data=json.dumps(data))

    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({
        "users": [
            {
                "user_name": "Aditya S",
                "device_groups": [
                    {"id": 1, "name": "Living Room Devices", "status": "off", "devices": [1, 4, 6]}
                ]
            }
        ]
    }))
    def test_addGroup_no_devices(self, mock_file):
        result = addGroup("Living Room Lights", [])
        self.assertEqual(result, {"error": "No devices selected!"})

    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({
        "users": [
            {
                "user_name": "Aditya S",
                "device_groups": [
                    {"id": 1, "name": "Living Room Devices", "status": "off", "devices": [1, 4, 6]}
                ]
            }
        ]
    }))
    def test_addGroup_no_name(self, mock_file):
        result = addGroup("", [2, 3, 4])
        self.assertEqual(result, {"error": "No group name provided!"})

    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({
        "users": [
            {
                "user_name": "Aditya S",
                "device_groups": [
                    {"id": 1, "name": "Living Room Devices", "status": "off", "devices": [1, 4, 6]}
                ]
            }
        ]
    }))
    def test_deleteGroup_user_not_found(self, mock_file):
        result = deleteGroup(1)  # Change selected_user.json to an invalid user
        self.assertEqual(result, {"error": "Selected user not found!"})

    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({
        "users": [
            {
                "user_name": "Aditya S",
                "device_groups": [
                    {"id": 1, "name": "Living Room Devices", "status": "off", "devices": [1, 4, 6]}
                ]
            }
        ]
    }))
    def test_editGroup_user_not_found(self, mock_file):
        result = editGroup(1, name="New Name", devices=[2, 4])  # Change selected_user.json to an invalid user
        self.assertEqual(result, {"error": "Selected user not found!"})

    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({
        "users": [
            {
                "user_name": "Aditya S",
                "device_groups": [
                    {"id": 1, "name": "Living Room Devices", "status": "off", "devices": [1, 4, 6]}
                ]
            }
        ]
    }))
    def test_changeGroupStatus_user_not_found(self, mock_file):
        result = changeGroupStatus(1, "off")  # Change selected_user.json to an invalid user
        self.assertEqual(result, {"error": "Selected user not found!"})

    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({
        "users": [
            {
                "user_name": "Aditya S",
                "device_groups": [
                    {"id": 1, "name": "Living Room Devices", "status": "off", "devices": [1, 4, 6]}
                ]
            }
        ]
    }))
    def test_getGroupsForSelectedUser_user_not_found(self, mock_file):
        result = getGroupsForSelectedUser()  # Change selected_user.json to an invalid user
        self.assertEqual(result, {"error": "Selected user not found!"})


if __name__ == '__main__':
    unittest.main()
