"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../ui/dashboard/breadcrumbs";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import IOSSwitch from "../ui/iosButton";

const Automations = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(dayjs());
  const [condition, setCondition] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceStatus, setDeviceStatus] = useState(false);
  const [automations, setAutomations] = useState([]);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [automationToDelete, setAutomationToDelete] = useState(null);

  const conditions = ["At time"];

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("http://localhost:8000/device_info");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.smart_home_devices) {
          throw new Error("Invalid JSON structure received");
        }

        const connectedDevices = data.smart_home_devices.filter(
          (device) => device.connection_status === "connected"
        );

        setDevices(connectedDevices);
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    };

    const fetchAutomations = async () => {
      try {
        const response = await fetch("http://localhost:8000/automations");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAutomations(data.automations || []);
      } catch (error) {
        console.error("Error fetching automation data:", error);
      }
    };

    fetchDevices();
    fetchAutomations();
  }, []);

  const getDeviceName = (deviceId) => {
    const device = devices.find((d) => String(d.id) === String(deviceId));
    return device ? device.name : "Unknown Device";
  };

  useEffect(() => {
    if (selectedDevice) {
      const device = devices.find((d) => d.name === selectedDevice);
      if (device) {
        console.log("Updating deviceStatus:", device.status);
        setDeviceStatus(device.status === "on");
      }
    }
  }, [selectedDevice, devices]);

  const handleOpenDialog = (automation = null) => {
    if (automation) {
      setEditingAutomation(automation);
      setName(automation.name);
      const triggerTime = dayjs(automation.triggers, "HH:mm");
      setTrigger(triggerTime.isValid() ? triggerTime : dayjs());
      setCondition("At time");
      setSelectedDevice(getDeviceName(automation.device_id));
      setDeviceStatus(automation.status === "on");
    } else {
      setEditingAutomation(null);
      setName("");
      setTrigger(dayjs());
      setCondition("At time");
      setSelectedDevice("");
      setDeviceStatus(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAutomation(null);
    setName("");
    setTrigger(dayjs());
    setCondition("");
    setSelectedDevice("");
    setDeviceStatus(false);
  };

  const handleSave = async () => {
    const device = devices.find((d) => d.name === selectedDevice);
    if (!device) {
      console.error("Invalid device selected");
      return;
    }

    const isEditing = editingAutomation !== null;

    const apiUrl = isEditing
      ? `http://localhost:8000/automations/edit_automation/${
          editingAutomation.id
        }/${encodeURIComponent(name)}/${device.id}/${trigger.format("HH:mm")}/${
          deviceStatus ? "on" : "off"
        }`
      : `http://localhost:8000/automations/add_automation/${encodeURIComponent(
          name
        )}/${device.id}/${trigger.format("HH:mm")}/${
          deviceStatus ? "on" : "off"
        }`;

    try {
      const response = await fetch(apiUrl, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedResponse = await fetch("http://localhost:8000/automations");
      if (!updatedResponse.ok) {
        throw new Error(`HTTP error! Status: ${updatedResponse.status}`);
      }

      const updatedData = await updatedResponse.json();
      setAutomations(updatedData.automations || []);
    } catch (error) {
      console.error("Error saving automation:", error);
    }

    console.log("Saving Automation:", {
      name,
      device_id: device.id,
      trigger: trigger.format("HH:mm"),
      status: deviceStatus ? "on" : "off",
    });

    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (automation) => {
    setAutomationToDelete(automation);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAutomationToDelete(null);
  };

  const confirmDelete = async () => {
    if (!automationToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8000/automations/${automationToDelete.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete automation. Status: ${response.status}`
        );
      }

      setAutomations((prev) =>
        prev.filter((a) => a.id !== automationToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting automation:", error);
    }

    handleCloseDeleteDialog();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this automation?"))
      return;

    try {
      const response = await fetch(`http://localhost:8000/automations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete automation. Status: ${response.status}`
        );
      }

      setAutomations((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting automation:", error);
    }
  };

  const handleToggle = async (id) => {
    const automation = automations.find((a) => a.id === id);
    if (!automation) return;

    const newStatus = !automation.enabled;

    try {
      const response = await fetch(
        `http://localhost:8000/automations/${id}/${newStatus}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update status. Server responded with ${response.status}`
        );
      }

      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, enabled: newStatus } : a))
      );
    } catch (error) {
      console.error("Error updating automation status:", error);
    }
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              fontFamily: "JetBrains Mono",
              fontWeight: 600,
              textTransform: "none",
              color: "white",
            }}
          >
            Add Schedule
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {automations.map((automation) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={automation.id}>
            <Card
              sx={{
                height: { xs: "20vh", md: "15vh" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80%",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                {/* Automation Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: 16, md: 20 },
                    fontWeight: 600,
                    fontFamily: "JetBrains Mono",
                    color: "primary.main",
                  }}
                >
                  {automation.name}
                </Typography>

                {/* Device Name as Chip */}
                <Chip
                  label={getDeviceName(automation.device_id)}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1, fontFamily: "JetBrains Mono" }}
                />

                {/* Toggle Switch */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2" fontFamily={"JetBrains Mono"}>
                    Enabled
                  </Typography>
                  <IOSSwitch
                    checked={automation.enabled}
                    onChange={() => handleToggle(automation.id)}
                  />
                </Stack>
              </CardContent>

              {/* Edit & Delete Buttons */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "text.secondary",
                }}
                onClick={() => handleOpenDialog(automation)}
              >
                <EditIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <IconButton
                sx={{ position: "absolute", bottom: 8, right: 8 }}
                onClick={() => handleOpenDeleteDialog(automation)}
              >
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Adding Automation */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontFamily: "JetBrains Mono", color: "primary.main" }}
        >
          Add Schedule
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          {/* Name Input */}
          <TextField
            label="Automation Name"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ fontFamily: "JetBrains Mono" }}
          />

          {/* Condition Dropdown */}
          <TextField
            select
            label="Condition"
            variant="outlined"
            fullWidth
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {conditions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Show time and device options only when "At time" is selected */}
          {condition === "At time" && (
            <>
              {/* Trigger Time Picker */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Trigger Time"
                  value={trigger}
                  onChange={(newValue) => setTrigger(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>

              {/* Device Selection */}
              <TextField
                select
                label="Select Device"
                variant="outlined"
                fullWidth
                required
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.name}>
                    {device.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Device On/Off Toggle (Using IOSSwitch) */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <span>Device Status:</span>
                <IOSSwitch
                  checked={deviceStatus}
                  onChange={(e) => {
                    console.log(
                      "Switch toggled:",
                      e.target.checked ? "on" : "off"
                    );
                    setDeviceStatus(e.target.checked);
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>

        {/* Dialog Actions */}
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
            sx={{ fontFamily: "JetBrains Mono", color: "white" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle
          sx={{ fontFamily: "JetBrains Mono", color: "primary.main" }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "JetBrains Mono" }}>
            Are you sure you want to delete automation{" "}
            <strong sx={{ color: "primary.main" }}>
              {automationToDelete?.name}
            </strong>{" "}
            associated with{" "}
            <strong>{getDeviceName(automationToDelete?.device_id)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="primary"
            sx={{ fontFamily: "JetBrains Mono" }}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} sx={{ fontFamily: "JetBrains Mono" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Automations;
