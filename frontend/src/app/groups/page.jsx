"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../ui/dashboard/breadcrumbs";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IOSSwitch from "../ui/iosButton";
import AddGroupDialog from "../ui/addGroupDialogue";

const Groups = () => {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [checked, setChecked] = useState([]);
  const [devices, setDevices] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/device_info")
      .then((res) => res.json())
      .then((data) => {
        if (data.smart_home_devices && Array.isArray(data.smart_home_devices)) {
          const deviceMap = {};
          data.smart_home_devices.forEach((device) => {
            deviceMap[device.id] = device.name;
          });
          setDevices(deviceMap);
        } else {
          console.error("Unexpected API response:", data);
        }
      })
      .catch((err) => console.error("Error fetching devices:", err));

    fetchGroups();
  }, []);

  const handleToggle = (groupId) => {
    const newChecked = checked.includes(groupId)
      ? checked.filter((id) => id !== groupId)
      : [...checked, groupId];

    setChecked(newChecked);

    fetch(
      `http://localhost:8000/groups/status?group_id=${groupId}&status=${
        newChecked.includes(groupId) ? "on" : "off"
      }`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error toggling group:", data.error);
        }
      })
      .catch((err) => console.error("Error toggling group:", err));
  };

  const fetchGroups = () => {
    fetch("http://localhost:8000/groups")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.device_groups)) {
          setGroups(data.device_groups);
          setChecked(
            data.device_groups.filter((g) => g.status === "on").map((g) => g.id)
          );
        } else {
          console.error("Unexpected API response:", data);
          setGroups([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching groups:", err);
        setGroups([]);
      });
  };

  const handleDeleteClick = (groupId) => {
    fetch(`http://localhost:8000/groups/${groupId}`, { method: "DELETE" })
      .then(() => {
        setGroups(groups.filter((group) => group.id !== groupId));
        setChecked(checked.filter((id) => id !== groupId));
      })
      .catch((err) => console.error("Error deleting group:", err));
  };

  const handleEdit = (groupId, groupName, groupDevices) => {
    setEditingGroup({ id: groupId, name: groupName, devices: groupDevices });
    setOpen(true);
  };

  const handleGroupSaved = (newGroup) => {
    setGroups((prevGroups) => [...prevGroups, newGroup]);

    fetchGroups();
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
            sx={{
              fontFamily: "JetBrains Mono",
              fontWeight: 600,
              textTransform: "none",
              color: "white",
            }}
            onClick={() => {
              setEditingGroup(null);
              setOpen(true);
            }}
          >
            Add Group
          </Button>
        </Box>
      </Box>

      {/* Groups Display */}
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={group.id}>
            <Card
              sx={{
                height: "18vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.02)" },
                padding: 2,
              }}
            >
              {/* Edit and Delete Icons */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "text.secondary",
                }}
                onClick={() => handleEdit(group.id, group.name, group.devices)}
              >
                <EditIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  color: "text.secondary",
                }}
                onClick={() => handleDeleteClick(group.id)}
              >
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* Title and Switch in a column */}
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: 16, md: 20 },
                    fontWeight: 600,
                    fontFamily: "JetBrains Mono",
                    color: "primary.main",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  {group.name}
                </Typography>

                {/* Toggle Switch */}
                <IOSSwitch
                  edge="end"
                  onChange={() => handleToggle(group.id)}
                  checked={checked.includes(group.id)}
                />

                {/* Device Chips */}
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 3,
                    justifyContent: "center",
                  }}
                >
                  {group.devices && group.devices.length > 0 ? (
                    group.devices.map((deviceId) =>
                      devices[deviceId] ? (
                        <Chip
                          key={deviceId}
                          label={devices[deviceId]}
                          sx={{ fontSize: 12, fontFamily: "JetBrains Mono" }}
                        />
                      ) : null
                    )
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      No devices assigned
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Group Dialog */}
      <AddGroupDialog
        open={open}
        onClose={() => setOpen(false)}
        group={editingGroup}
        onSave={handleGroupSaved}
      />
    </div>
  );
};

export default Groups;
