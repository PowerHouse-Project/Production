"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import ListSubheader from "@mui/material/ListSubheader";

import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import IOSSwitch from "../ui/iosButton";
import EnergyUsageChart from "../ui/energyChart";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/smart_home_devices"
        );
        const result = await response.json();
        setData(result);
        const initialChecked = result
          .filter((device) => device.status === "on")
          .map((device) => device.id);
        setChecked(initialChecked);
      } catch (error) {
        console.error("Error fetching smart home devices:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (deviceId) => () => {
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
                    sx={{ color: "#1F99FC", fontSize: { xs: 50, md: 65 } }}
                  />
                ),
              },
              {
                title: "Devices Connected",
                value: `${noOfDevices} Devices`,
                icon: (
                  <DevicesOtherIcon
                    sx={{ color: "#1F99FC", fontSize: { xs: 50, md: 65 } }}
                  />
                ),
              },
              {
                title: "Automation Schedules", // Hardcoded value for now
                value: "18 Schedules",
                icon: (
                  <PrecisionManufacturingIcon
                    sx={{ color: "#1F99FC", fontSize: { xs: 50, md: 65 } }}
                  />
                ),
              },
            ].map((card, index) => (
              <Card
                key={index}
                sx={{
                  flex: 1,
                  height: 140,
                  boxShadow: "0px 4px 10px rgba(31, 153, 252, 0.5)",
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
                  <Box sx={{ fontSize: { xs: 50, md: 65 } }}>{card.icon}</Box>
                  <Box textAlign="right">
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: 16, md: 20 },
                        fontWeight: 600,
                        fontFamily: "JetBrains Mono",
                      }}
                      className="text-main-light-blue-dark"
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: 24, md: 36 },
                        fontWeight: 800,
                        fontFamily: "JetBrains Mono",
                      }}
                      className="text-main-light-blue-dark"
                    >
                      {card.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: { xs: "37vh", md: "55vh" },
              display: "flex",
              flexDirection: "column",
              boxShadow: "0px 4px 10px rgba(31, 153, 252, 0.5)",
            }}
          >
            <CardContent
              sx={{
                height: "100%", // Make sure it takes the full height
                display: "flex",
                flexDirection: "column",
                padding: 2,
              }}
            >
              {/* Subheader with margin for spacing */}
              <ListSubheader
                sx={{
                  fontSize: { xs: 20, md: 27 },
                  fontWeight: 800,
                  fontFamily: "JetBrains Mono",
                  marginBottom: 2,
                  color: "#1F99FC",
                }}
              >
                Device Control
              </ListSubheader>

              {/* Scrollable List */}
              <List
                sx={{
                  height: "100%",
                  maxHeight: "100%",
                  overflowY: "auto",
                  paddingRight: 1,
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#1F99FC",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0",
                  },
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
                      }}
                      className="text-main-light-blue-dark"
                    >
                      {device.name}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card
            sx={{ height: "55vh", display: "flex", flexDirection: "column" }}
          >
            <CardContent
              sx={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <EnergyUsageChart data={data} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
