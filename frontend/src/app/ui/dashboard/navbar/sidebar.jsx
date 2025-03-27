"use client";

import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Link from "next/link";
import { Tooltip } from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import DevicesIcon from "@mui/icons-material/Devices";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";

import { useAppStore } from "@/app/appStore";

const menuItems = [
  {
    name: "Home",
    icon: HomeIcon,
    link: "/dashboard",
  },
  {
    name: "Devices",
    icon: DevicesIcon,
    link: "/devices",
  },
  {
    name: "Automations",
    icon: SmartToyIcon,
    link: "/automations",
  },
  {
    name: "Energy Usage",
    icon: BatteryChargingFullIcon,
    link: "/energy",
  },
  {
    name: "Groups",
    icon: DynamicFeedIcon,
    link: "/groups",
  },
];

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function Sidebar() {
  const updateOpen = useAppStore((state) => state.updateOpen);
  const open = useAppStore((state) => state.Open);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const handleCloseDrawer = () => {
    if (open) {
      updateOpen(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader></DrawerHeader>
        <Divider />
        <List>
          {menuItems.map(({ name: Name, icon: Icon, link }) => (
            <Link key={link} href={link} passHref legacyBehavior>
              <ListItem
                disablePadding
                onClick={handleCloseDrawer}
                className="ease-linear transition-all duration-300 md:px-1"
              >
                <Tooltip
                  title={Name}
                  arrow
                  placement="right"
                  PopperProps={{
                    modifiers: [
                      {
                        name: "preventOverflow",
                        options: {
                          boundary: "window",
                        },
                      },
                    ],
                  }}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        fontSize: "1rem", // Bigger font size
                        padding: "6px 12px",
                        fontFamily: "JetBrains Mono",
                      },
                    },
                  }}
                >
                  <ListItemButton
                    className={`group transition-all duration-300 hover:bg-opacity-20 ${
                      isDarkMode
                        ? "hover:bg-main-light-blue-dark"
                        : "hover:bg-main-dark-purple-light"
                    }`}
                  >
                    <ListItemIcon
                      className={`transition-all duration-300 ${
                        isDarkMode
                          ? "text-main-dark-purple-light group-hover:text-main-dark-purple-light"
                          : "text-main-dark-blue-inactive group-hover:text-main-light-blue-dark"
                      }`}
                    >
                      <Icon
                        className={`transition-all duration-300 ${
                          isDarkMode
                            ? "group-hover:text-main-dark-purple-light"
                            : "group-hover:text-main-light-blue-dark"
                        }`}
                      />
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={
                          <span
                            style={{
                              fontFamily: "JetBrains Mono",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                            className={`transition-all duration-300 ${
                              isDarkMode
                                ? "group-hover:text-main-dark-purple-light"
                                : "group-hover:text-main-light-blue-dark"
                            }`}
                          >
                            {Name}
                          </span>
                        }
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
