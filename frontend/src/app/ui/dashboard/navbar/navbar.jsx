"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import UpdateIcon from "@mui/icons-material/Update";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";

import { useAppStore } from "@/app/appStore";
import { useThemeMode } from "@/app/themeRegistery";
import AccountMenu from "../accountMenu";

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
}));

export default function Navbar() {
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [updates, setUpdates] = React.useState([]);
  const updateOpen = useAppStore((state) => state.updateOpen);
  const Open = useAppStore((state) => state.Open);
  const { toggleTheme } = useThemeMode();

  const isNotificationMenuOpen = Boolean(notificationAnchorEl);

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/User Manual.pdf";
    link.download = "User Manual.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchLatestUpdates = async () => {
    try {
      const response = await fetch("http://localhost:8000/latest_updates");
      const data = await response.json();
      setUpdates(data.latest_updates);
    } catch (error) {
      console.error("Error fetching latest updates:", error);
    }
  };

  const handleNotificationsOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchLatestUpdates();
  };

  const handleMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const getUpdateIcon = (update) => {
    if (
      update.toLowerCase().includes("error") ||
      update.toLowerCase().includes("warning")
    ) {
      return <WarningIcon fontSize="small" color="error" />;
    } else if (update.toLowerCase().includes("success")) {
      return <CheckCircleIcon fontSize="small" color="success" />;
    } else {
      return <UpdateIcon fontSize="small" color="primary" />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2, ml: { md: -2 } }}
            onClick={() => updateOpen(!Open)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              display: { xs: "block" },
              fontFamily: "JetBrains Mono",
              fontWeight: 800,
              textAlign: "center",
              color: "primary.main",
            }}
            className="font-jetBrains"
          >
            PowerHouse
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex" }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleDownloadPDF}
            >
              <InfoIcon />
            </IconButton>
            <IconButton size="large" color="inherit">
              <LightModeIcon onClick={toggleTheme} />
            </IconButton>
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              <Badge
                badgeContent={updates.length > 0 ? updates.length : 0}
                color="primary"
                variant="dot"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <AccountMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Icon Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={isNotificationMenuOpen}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              borderRadius: 2,
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuList>
          {updates.length > 0 ? (
            updates.map((update, index) => (
              <React.Fragment key={index}>
                <MenuItem sx={{ fontFamily: "JetBrains Mono" }}>
                  <ListItemIcon>{getUpdateIcon(update)}</ListItemIcon>
                  <ListItemText
                    primary={update}
                    primaryTypographyProps={{
                      sx: {
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontFamily: "JetBrains Mono",
                        fontSize: { xs: "14px", sm: "16px", md: "18px" },
                      },
                    }}
                  />
                </MenuItem>
                {index < updates.length - 1 && <Divider />}{" "}
                {/* No divider after last update */}
              </React.Fragment>
            ))
          ) : (
            <MenuItem sx={{ fontFamily: "JetBrains Mono" }}>
              <ListItemIcon>
                <UpdateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="No updates"
                primaryTypographyProps={{
                  sx: {
                    fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  },
                }}
              />
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Box>
  );
}
