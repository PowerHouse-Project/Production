import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";

const AddUserDialog = ({ open, onClose, onSave }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);

  useEffect(() => {
    // Fetch available devices from the API
    fetch("http://localhost:8000/device_info")
      .then((res) => res.json())
      .then((data) => {
        const allDevices = data.smart_home_devices || [];
        setDevices(allDevices);
      })
      .catch((err) => console.error("Error fetching devices:", err));
  }, []);

  const handleDeviceChange = (event) => {
    const { value } = event.target;
    setSelectedDevices(value);
  };

  const handleSubmit = () => {
    const newUser = {
      user_name: username,
      user_password: password,
      allocated_devices: selectedDevices.map(String), // Ensure they are strings
    };

    fetch("http://localhost:8000/add_user/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((data) => {
        handleClose();
      })
      .catch((err) => console.error("Error adding user:", err));
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setSelectedDevices([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: "Jetbrains Mono", color: "primary.main" }}>
        Add New User
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          InputLabelProps={{
            sx: { fontFamily: "Jetbrains Mono" },
          }}
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ fontFamily: "Jetbrains Mono" }}
        />
        <TextField
          margin="dense"
          label="Password"
          InputLabelProps={{
            sx: { fontFamily: "Jetbrains Mono" },
          }}
          type="password"
          fullWidth
          value={password}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,4}$/.test(value)) {
              setPassword(value);
            }
          }}
          sx={{ fontFamily: "Jetbrains Mono" }}
          helperText="Password must be 4 digits long."
        />

        {/* Device Selection */}
        <FormControl fullWidth sx={{ marginTop: 1 }}>
          <InputLabel
            id="device-select-label"
            sx={{ fontFamily: "Jetbrains Mono" }}
          >
            Select Devices
          </InputLabel>
          <Select
            labelId="device-select-label"
            multiple
            value={selectedDevices}
            onChange={handleDeviceChange}
            renderValue={(selected) =>
              selected
                .map((id) => devices.find((device) => device.id === id)?.name)
                .join(", ")
            }
            sx={{ fontFamily: "Jetbrains Mono" }}
          >
            {devices.map((device) => (
              <MenuItem
                key={device.id}
                value={device.id}
                sx={{ fontFamily: "Jetbrains Mono" }}
              >
                {" "}
                {/* Ensure font applied here too */}
                <Checkbox
                  sx={{ fontFamily: "Jetbrains Mono" }}
                  checked={selectedDevices.includes(device.id)}
                />
                <ListItemText
                  sx={{ fontFamily: "Jetbrains Mono" }}
                  primary={device.name}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Devices as Chips */}
        <Box sx={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedDevices.map((deviceId) => {
            const device = devices.find((d) => d.id === deviceId);
            return (
              <Chip
                key={deviceId}
                label={device?.name || "Unknown"}
                onDelete={() =>
                  setSelectedDevices((prev) =>
                    prev.filter((id) => id !== deviceId)
                  )
                }
                sx={{ fontFamily: "Jetbrains Mono" }}
              />
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
