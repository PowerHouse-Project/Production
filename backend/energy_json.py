import json
import os

ENERGY_FOLDER = os.path.join(os.path.dirname(__file__), "energy")
# print(ENERGY_FOLDER)

def get_energy_data(time_range: str):
    """Fetch energy usage data from JSON files."""
    
    if time_range not in ["daily", "monthly"]:
        return {"error": "Invalid time range. Use 'daily' or 'monthly'."}

    file_path = os.path.join(ENERGY_FOLDER, f"{time_range}_energy.json")

    try:
        with open(file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"error": f"{time_range}_energy.json not found."}
    except json.JSONDecodeError:
        return {"error": f"Invalid JSON format in {time_range}_energy.json."}


def set_energy_goal(goal_value: float):
    """Set a static energy goal with a specific value and save it to a JSON file."""
    
    goal_data = {
        "goal_value": goal_value,
    }

    goal_file_path = os.path.join(ENERGY_FOLDER, "energy_goal.json")
    
    try:
        with open(goal_file_path, "w") as file:
            json.dump(goal_data, file, indent=4)
        return {"success": f"Energy goal set to {goal_value} and saved to energy_goal.json"}
    except Exception as e:
        return {"error": f"Error saving energy goal: {str(e)}"}
    
def get_energy_goal():
    """Fetch the current energy goal from the JSON file."""
    goal_file_path = os.path.join(ENERGY_FOLDER, "energy_goal.json")
    
    try:
        with open(goal_file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"error": "energy_goal.json not found."}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format in energy_goal.json."}