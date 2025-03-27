"use client";

import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Breadcrumb from "@/app/ui/dashboard/breadcrumbs";
import IOSSwitch from "../ui/iosButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [checked, setChecked] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState(null);
  const [disappearingDevices, setDisappearingDevices] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [notConnectedDevices, setNotConnectedDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  // const [selectedDeviceName, setSelectedDeviceName] = useState("");

  const disappearingStyle = {
    opacity: 0,
    transition: "opacity 0.3s ease-out",
  };

  useEffect(() => {
    fetch("http://localhost:8000/selected_user")
      .then((res) => res.json())
      .then((data) => {
        setIsSuperUser(data.user_role === "super_user");
      })
      .catch((err) => {
        console.error("Error fetching user role:", err);
        setIsSuperUser(false);
      });

    // Fetch devices information
    fetch("http://localhost:8000/device_info")
      .then((res) => res.json())
      .then((data) => {
        const connectedDevices = (data.smart_home_devices || []).filter(
          (device) => device.connection_status === "connected"
        );

        setDevices(connectedDevices);

        const checkedDevices = connectedDevices
          .filter((device) => device.status === "on")
          .map((device) => device.id);
        setChecked(checkedDevices);
      })
      .catch((err) => {
        console.error("Error fetching devices:", err);
        setDevices([]);
      });
  }, []);

  const fetchNotConnectedDevices = async () => {
    try {
      const response = await fetch("http://localhost:8000/device_info");
      const data = await response.json();
      const notConnected = (data.smart_home_devices || []).filter(
        (device) => device.connection_status === "not_connected"
      );
      setNotConnectedDevices(notConnected);
    } catch (error) {
      console.error("Error fetching not-connected devices:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      // First, update the UI (toggle checked state)
      setChecked((prevChecked) =>
        prevChecked.includes(id)
          ? prevChecked.filter((deviceId) => deviceId !== id)
          : [...prevChecked, id]
      );

      const device = devices.find((d) => d.id === id);
      const newStatus = device.status === "on" ? "off" : "on";

      const response = await fetch(
        `http://localhost:8000/device/${id}/status?status=${newStatus}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to change device status");
      }

      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === id ? { ...device, status: newStatus } : device
        )
      );
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const handleEdit = (id, name) => {
    setDeviceId(id);
    setDeviceName(name);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/device/${deviceId}/name/${deviceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.id === deviceId ? { ...device, name: deviceName } : device
          )
        );
        setOpenDialog(false);
      } else {
        console.error("Error updating device name:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating device name:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/device/${id}/connect`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setDisappearingDevices((prev) => [...prev, id]);

        setTimeout(() => {
          setDevices((prevDevices) =>
            prevDevices.filter((device) => device.id !== id)
          );
          setDisappearingDevices((prev) =>
            prev.filter((deviceId) => deviceId !== id)
          );
        }, 300);
      } else {
        console.error(
          "Error toggling device connection status:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error toggling device connection status:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setDeviceToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deviceToDelete) {
      handleDelete(deviceToDelete);
    }
    setOpenDeleteDialog(false);
    setDeviceToDelete(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setDeviceToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddDeviceClick = async () => {
    await fetchNotConnectedDevices();
    setOpenAddDialog(true);
    setDeviceName("");
  };

  const handleAddDeviceConfirm = async () => {
    if (selectedDeviceId) {
      try {
        const nameToUse = deviceName.trim();

        const response = await fetch(
          `http://localhost:8000/device/${selectedDeviceId}/connect`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: nameToUse }),
          }
        );

        if (response.ok) {
          const updatedResponse = await fetch(
            "http://localhost:8000/device_info"
          );
          const updatedData = await updatedResponse.json();
          const connectedDevices = (
            updatedData.smart_home_devices || []
          ).filter((device) => device.connection_status === "connected");
          setDevices(connectedDevices);

          const newDevice = connectedDevices.find(
            (device) => device.id === selectedDeviceId
          );
          if (newDevice && newDevice.status === "on") {
            setChecked((prevChecked) => [...prevChecked, newDevice.id]);
          }

          // Reset states
          setOpenAddDialog(false);
          setSelectedDeviceId(null);
          setDeviceName("");
        } else {
          console.error("Error connecting device:", response.statusText);
        }
      } catch (error) {
        console.error("Error connecting device:", error);
      }
    }
  };

  const handleAddDeviceCancel = () => {
    setOpenAddDialog(false);
    setSelectedDeviceId(null);
    setDeviceName("");
  };

  return (
    <div>
      {/* <Breadcrumb /> */}
      <Box sx={{ paddingTop: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          {isSuperUser && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddDeviceClick}
              sx={{
                fontFamily: "JetBrains Mono",
                fontWeight: 600,
                textTransform: "none",
                color: "white",
              }}
            >
              Add Device
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {devices.map((device) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
              <Card
                sx={{
                  height: "15vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "scale(1.02)" },
                  ...(disappearingDevices.includes(device.id) &&
                    disappearingStyle),
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "80%",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <IOSSwitch
                      edge="end"
                      onChange={() => handleToggle(device.id)}
                      checked={checked.includes(device.id)}
                    />

                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: 16, md: 20 },
                          fontWeight: 600,
                          fontFamily: "JetBrains Mono",
                          color: "primary.main",
                        }}
                      >
                        {device.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontFamily={"JetBrains Mono"}
                        sx={{ fontSize: { xs: 12, md: 16 } }}
                      >
                        {device.ip}
                      </Typography>
                    </Box>
                  </Stack>

                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "text.secondary",
                    }}
                    onClick={() => handleEdit(device.id, device.name)}
                  >
                    {isSuperUser && <EditIcon sx={{ fontSize: 20 }} />}
                  </IconButton>

                  <IconButton
                    sx={{ position: "absolute", bottom: 8, right: 8 }}
                    onClick={() => handleDeleteClick(device.id)}
                  >
                    {isSuperUser && <DeleteIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialog for editing device name */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontFamily: "JetBrains Mono", color: "primary.main" }}
        >
          Edit Device Name
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 2, paddingBottom: 2 }}>
          <TextField
            autoFocus
            fullWidth
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            sx={{ fontFamily: "JetBrains Mono" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            sx={{ fontFamily: "JetBrains Mono" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{ fontFamily: "JetBrains Mono" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for deleting a device */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontFamily: "JetBrains Mono", color: "primary.main" }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 2, paddingBottom: 2 }}>
          <Typography sx={{ fontFamily: "JetBrains Mono" }}>
            Are you sure you want to delete this device?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            color="primary"
            sx={{ fontFamily: "JetBrains Mono" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="primary"
            sx={{ fontFamily: "JetBrains Mono" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding a device */}
      <Dialog
        open={openAddDialog}
        onClose={handleAddDeviceCancel}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontFamily: "JetBrains Mono", color: "primary.main" }}
        >
          Add Device
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 2, paddingBottom: 2 }}>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="device-select-label">Select Device</InputLabel>
            <Select
              labelId="device-select-label"
              id="device-select"
              value={selectedDeviceId || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedDeviceId(selectedId);

                // Only set the device name if the input field is empty
                if (!deviceName.trim()) {
                  const selectedDevice = notConnectedDevices.find(
                    (device) => device.id === selectedId
                  );
                  if (selectedDevice) {
                    setDeviceName(selectedDevice.name);
                  }
                }
              }}
              label="Select Device"
            >
              {notConnectedDevices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <TextField
            autoFocus
            fullWidth
            label="Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            sx={{ fontFamily: "JetBrains Mono" }}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddDeviceCancel}
            color="primary"
            sx={{ fontFamily: "JetBrains Mono" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddDeviceConfirm}
            variant="contained"
            color="primary"
            sx={{ fontFamily: "JetBrains Mono", color: "white" }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Devices;
