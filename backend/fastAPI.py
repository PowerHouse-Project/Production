from typing import List, Optional
from pydantic import BaseModel

import devices_json as dj
import users as u
import energy_json as ej
import automations as am
import groups as gr
import testPDF as pdf

import asyncio
import os
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
from fastapi.responses import FileResponse

# Serve user data (Only for testing purposes)
USER_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "database", "users_db.json")
# print(USER_DB_PATH) # For testing purposes

print("Current Working Directory:", os.getcwd())
print("Graphs folder exists:", os.path.exists("graphs"))
print("Available files in graphs:", os.listdir("graphs"))

base_dir = os.path.dirname(os.path.abspath(__file__))
daily_graph_path = os.path.join(base_dir, "graphs", "daily_energy_graph.png")
monthly_graph_path = os.path.join(base_dir, "graphs", "monthly_energy_graph.png")

print("Daily graph path:", daily_graph_path, "| Exists:", os.path.exists(daily_graph_path))
print("Monthly graph path:", monthly_graph_path, "| Exists:", os.path.exists(monthly_graph_path))


app = FastAPI()

latest_updates = deque(maxlen=5)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    user_name: str
    user_password: str
    allocated_devices: Optional[List[str]] = None

class DeviceAllocation(BaseModel):
    user_id: int
    device_ids: List[int]

class GroupRequestNoStatus(BaseModel):
    name: str
    device_ids: List[int]

class GroupRequestStatus(BaseModel):
    name: str
    device_ids: List[int]
    status: str

class DeviceIdsRequest(BaseModel):
    device_ids: List[int]


class EnergyReportRequest(BaseModel):
    from_month: int
    to_month: int
    from_date: int
    to_date: int
    device_ids: List[int]
    theme: str = "dark"

@app.on_event("startup")
async def startup_event():
    """Starts device updates when the FastAPI server starts."""
    loop = asyncio.get_event_loop()
    loop.create_task(dj.updateDevices())
    asyncio.create_task(am.automation_scheduler())

@app.get("/")
def root():
    return {"message": "Welcome to the Smart Home API!"}

@app.get("/device_info")
async def device_info():
    """Returns the current JSON data."""
    jsonData = dj.loadDevicesJSON()
    return jsonData

@app.post("/device/{id}/status")
def change_device_status(id: int, status: str):
    """Changes the status of a device according to its ID."""
    return dj.changeDeviceStatus(id, status)

@app.post("/device/{id}/name/{new_name}")
def change_device_name(id: int, new_name: str):
    """Changes the name of a device according to its ID."""
    result = dj.changeDeviceName(id, new_name)
    return result

@app.get("/updates")
def get_updates():
    """Returns combined updates from devices and users."""
    device_updates = dj.getUpdates()
    user_updates = u.getUpdates()

    all_updates = device_updates + user_updates
    latest_updates.extend(all_updates)

    return {"updates": all_updates}

@app.get("/latest_updates")
def get_latest_updates():
    """Returns the latest 5 updates."""
    return {"latest_updates": list(latest_updates)}

@app.post("/device/{id}/connect")
async def change_connection_status(id: int):
    """Toggle the connection status of a device."""
    result = await dj.changeConnection(id)
    return result

@app.get("/user_data")
def get_user_data():
    """Loads and returns the user data from the JSON file."""
    try:
        with open(USER_DB_PATH, "r") as file:
            user_data = json.load(file)
        return user_data
    except FileNotFoundError:
        return {"error": f"User database file not found"}
    except json.JSONDecodeError:
        return {"error": "Error decoding JSON data"}

@app.get("/device_functions")
def get_device_functions():
    """Returns the list of device functions."""
    return {"functions": dj.deviceFunctions()}

@app.post("/select_user/{user}")
def set_selected_user(user: str):
    """Sets the selected user"""
    return u.select_user(user)

@app.get("/selected_user")
def get_selected_user():
    """Returns the selected user"""
    return u.get_selected_user()

@app.post("/add_user")
def add_new_user(user: UserRequest):
    """Adds a new user with the given name, password, and optional allocated devices."""
    return u.add_user(user.user_name, user.user_password, user.allocated_devices or [])

@app.put("/rename_user/{new_name}")
def rename_user(new_name: str):
    """API endpoint to rename the selected user."""
    return u.rename_selected_user(new_name)

@app.delete("/delete_user/{user_name}/{user_password}")
def delete_user(user_name: str, user_password: str):
    """Deletes a user with the given name and password."""
    return u.delete_user(user_name, user_password)

@app.post("/allocate_devices")
def allocate_devices(request: DeviceAllocation):
    """Allocates devices to a user based on their user ID."""
    return u.allocate_devices(request.user_id, request.device_ids)

@app.get("/devices/oven/{device_id}/timer/{timer}")
def set_oven_timer(device_id: int, timer: int):
    """Set the timer for an oven device."""
    return dj.setOvenTimer(device_id, timer)

@app.get("/energy_usage")
def fetch_energy_usage(range: str):
    if range == "daily":
        return ej.get_energy_data("daily")
    elif range == "monthly":
        return ej.get_energy_data("monthly")
    else:
        raise HTTPException(status_code=400, detail="Invalid range")
    
@app.get("/energy_usage/{time_range}")
def fetch_energy_usage(time_range: str):
    return ej.get_energy_data(time_range)

@app.get("/energy_goal")
def read_energy_goal():
    """Endpoint to read/fetch the current energy goal"""
    return ej.get_energy_goal()

@app.post("/energy_goal/{goal_value}")
def set_energy_goal(goal_value: float):
    """Endpoint to set the energy goal"""
    return ej.set_energy_goal(goal_value)

@app.get("/automations")
async def get_automations():
    """Returns the current automation rules"""
    return am.loadAutomations()

@app.post("/automations/add_automation/{name}/{device_id}/{trigger_time}/{status}")
def add_automation(name: str, device_id: int, trigger_time: str, status: str):
    """Add a new automation rule with enabled=True by default"""
    return am.addAutomation(name, device_id, trigger_time, status)

@app.put("/automations/edit_automation/{automation_id}/{name}/{device_id}/{trigger_time}/{status}")
def edit_automation(automation_id: int, name: str, device_id: int, trigger_time: str, status: str):
    status_bool = status.lower() == "true"
    # print(f"Received: ID={automation_id}, Name={name}, Device ID={device_id}, Time={trigger_time}, Status={status_bool}")
    return am.editAutomation(automation_id, name, device_id, trigger_time, status_bool)

@app.delete("/automations/{automation_id}")
def delete_automation(automation_id: int):
    """FastAPI endpoint to delete an automation by ID."""
    return am.deleteAutomation(automation_id)

@app.post("/automations/{automation_id}/{status}")
def update_automation_status(automation_id: int, status: bool):
    """Update the 'enabled' status of an automation by ID"""
    return am.updateAutomationStatus(automation_id, status)

@app.delete("/automations/{automation_id}")
def delete_automation(automation_id: int):
    """Delete an automation rule by ID"""
    return am.deleteAutomation(automation_id)

@app.get("/groups")
def get_groups():
    """Retrieve all groups for the selected user"""
    return gr.getGroupsForSelectedUser()

@app.post("/groups/add_group")
def add_group(group: GroupRequestNoStatus):
    """Add a new group to the selected user"""
    return gr.addGroup(group.name, group.device_ids)

@app.post("/groups/edit_group/{group_id}")
def edit_group(group_id: int, group: GroupRequestStatus):
    """Edit an existing group for the selected user"""
    return gr.editGroup(group_id, group.name, group.device_ids, group.status)

@app.put("/groups/status")
def update_group_status(group_id: int, status: str):
    """FastAPI endpoint to update group status using query parameters"""
    return gr.changeGroupStatus(group_id, status)

@app.delete("/groups/{group_id}")
def delete_group(group_id: int):
    """Delete a group from the selected user"""
    return gr.deleteGroup(group_id)

@app.post("/energy_report/")
def generate_energy_report(data: EnergyReportRequest):
        print(f"FastAPI CWD: {os.getcwd()}")
        print(f"Graphs folder exists: {os.path.exists(os.path.join(os.getcwd(), 'graphs'))}")
        print(f"Daily graph exists: {os.path.exists(os.path.join(os.getcwd(), 'graphs', 'daily_energy_graph.png'))}")

        pdf_path = pdf.generate_pdf(
            from_month=data.from_month,
            to_month=data.to_month,
            from_day=data.from_date,
            to_day=data.to_date,
            device_ids=data.device_ids,
            theme=data.theme
        )
        return FileResponse(pdf_path, filename="Energy_Report.pdf")