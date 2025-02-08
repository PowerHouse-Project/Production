"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

import Breadcrumb from "../ui/dashboard/breadcrumbs";

import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import IOSSwitch from "../ui/iosButton";
import EnergyUsageChart from "../ui/energyChart";
import { useTheme } from "@emotion/react";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [checked, setChecked] = useState([]);

  const theme = useTheme();
  const boxShadow =
    theme.palette.mode === "dark"
      ? "0px 4px 10px rgba(130, 83, 215, 0.5)" // Purple shadow for dark mode
      : "0px 4px 10px rgba(31, 153, 252, 0.5)"; // Blue shadow for light mode
  const strokeColor = theme.palette.mode === "dark" ? "#8253d7" : "#1F99FC";
  const bgColor = theme.palette.mode === "dark" ? "#39393D" : "#E9E9EA";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/device_info");
        const result = await response.json();

        if (result && Array.isArray(result.smart_home_devices)) {
          const devices = result.smart_home_devices;
          setData(devices);

          const initialChecked = devices
            .filter((device) => device.status === "on")
            .map((device) => device.id);
          setChecked(initialChecked);
        } else {
          console.error("Invalid response structure", result);
        }
      } catch (error) {
        console.error("Error fetching smart home devices:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (deviceId) => async () => {
    try {
      // Send API request to toggle device status
      const response = await fetch(
        `http://localhost:8000/device/${deviceId}/status`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to change device status");
      }

      // Toggle switch state locally
      setChecked((prevChecked) => {
        const currentIndex = prevChecked.indexOf(deviceId);
        const newChecked = [...prevChecked];

        if (currentIndex === -1) {
          newChecked.push(deviceId);
        } else {
          newChecked.splice(currentIndex, 1);
        }

        return newChecked;
      });
    } catch (error) {
      console.error("Error updating device status:", error);
    }
  };

  const totalPowerUsage = data.reduce(
    (acc, device) => acc + (device.power_usage || 0),
    0
  );
  const noOfDevices = data.length || 0;

  return (
    <div>
      <Breadcrumb />
      <Box height={30} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
            {[
              {
                title: "Energy Usage",
                value: `${totalPowerUsage} W`,
                icon: (
                  <ElectricBoltIcon
                    sx={{ color: "primary.main", fontSize: { xs: 50, md: 65 } }}
                  />
                ),
                link: "/energy",
              },
              {
                title: "Devices Connected",
                value: `${noOfDevices} Devices`,
                icon: (
                  <DevicesOtherIcon
                    sx={{ color: "primary.main", fontSize: { xs: 50, md: 65 } }}
                  />
                ),
                link: "/devices",
              },
              {
                title: "Automation Schedules", // Hardcoded value for now
                value: "18 Schedules",
                icon: (
                  <PrecisionManufacturingIcon
                    sx={{ color: "primary.main", fontSize: { xs: 50, md: 65 } }}
                  />
                ),
                link: "automations",
              },
            ].map((card, index) => (
              <Box key={index} sx={{ flex: 1 }}>
                <Link href={card.link} passHref legacyBehavior>
                  <Card
                    component="a"
                    sx={{
                      display: "block",
                      textDecoration: "none",
                      flex: 1,
                      height: 140,
                      // boxShadow: boxShadow,
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.01)" },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ fontSize: { xs: 50, md: 65 } }}>
                        {card.icon}
                      </Box>
                      <Box textAlign="right">
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: 16, md: 20 },
                            fontWeight: 600,
                            fontFamily: "JetBrains Mono",
                            color: "primary.main",
                          }}
                        >
                          {card.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontSize: { xs: 24, md: 36 },
                            fontWeight: 800,
                            fontFamily: "JetBrains Mono",
                            color: "primary.main",
                          }}
                        >
                          {card.value}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ flex: 1 }}>
            <Card
              component="a"
              sx={{
                height: { xs: "37vh", md: "55vh" },
                display: "flex",
                flexDirection: "column",
                // boxShadow: boxShadow,
                textDecoration: "none",
                color: "inherit",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.01)" }, // Slight hover effect
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  padding: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 20, md: 30 },
                    fontWeight: 800,
                    fontFamily: "JetBrains Mono",
                    marginBottom: 2,
                    marginLeft: 2,
                    marginTop: { xs: 1, md: 2 },
                    color: "primary.main",
                  }}
                >
                  Device Control
                </Typography>

                <List
                  sx={{
                    height: "100%",
                    maxHeight: "100%",
                    overflowY: "auto",
                    paddingRight: 1,
                    "&::-webkit-scrollbar": { width: "8px" },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: strokeColor,
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: bgColor,
                    },
                    width: "100%",
                  }}
                >
                  {data.map((device) => (
                    <ListItem
                      key={device.id}
                      sx={{
                        pl: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <ListItemIcon>
                        <IOSSwitch
                          edge="end"
                          onChange={handleToggle(device.id)}
                          checked={checked.includes(device.id)}
                        />
                      </ListItemIcon>
                      <Typography
                        sx={{
                          fontSize: { xs: 14, md: 18 },
                          fontWeight: 600,
                          fontFamily: "JetBrains Mono",
                          flexGrow: 1,
                          textAlign: "left",
                          color: "primary.main",
                        }}
                      >
                        {device.name}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={8} sx={{ display: { xs: "none", md: "block" } }}>
          <Link href="/energy" passHref legacyBehavior>
            <Card
              component="a"
              sx={{
                height: "55vh",
                display: "flex",
                flexDirection: "column",
                // boxShadow: boxShadow,
                width: "100%",
                textDecoration: "none", // Prevents underline
                color: "inherit", // Keeps original text color
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.01)" }, // Slight hover effect
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <EnergyUsageChart data={data} />
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
