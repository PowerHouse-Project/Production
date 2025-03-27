"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import BackspaceIcon from "@mui/icons-material/Backspace";
import { ThemeProvider, CssBaseline, TextField, MenuItem } from "@mui/material";
import getTheme from "../theme";
import { useRouter } from "next/navigation";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Custom Dot Component for iOS-style Password
const DotInput = ({ value, maxLength }) => {
  const dots = Array(maxLength).fill(false);
  for (let i = 0; i < value.length; i++) {
    dots[i] = true;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
      {dots.map((dot, index) => (
        <Box
          key={index}
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            bgcolor: dot ? "primary.main" : "transparent",
            border: "2px solid #ccc",
          }}
        />
      ))}
    </Box>
  );
};

const Keypad = ({ onKeyPress, onClear }) => {
  const handleButtonClick = (value) => {
    onKeyPress(value);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key >= "0" && event.key <= "9") {
        onKeyPress(event.key);
      } else if (event.key === "Backspace") {
        onClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKeyPress, onClear]);

  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
        <Button
          key={num}
          variant="outlined"
          onClick={() => handleButtonClick(num.toString())}
          sx={{ fontSize: "1.5rem", height: 50, fontFamily: "JetBrains Mono" }}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="outlined"
        onClick={onClear}
        sx={{ fontSize: "1.5rem", height: 50 }}
      >
        <BackspaceIcon />
      </Button>
    </Box>
  );
};

const Users = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordValid, setPasswordValid] = useState(null);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeletePassword("");
    setDeleteError("");
    setDeleteDialogOpen(true);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/user_data");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNewUserSubmit = async () => {
    if (
      newUsername.trim() === "" ||
      newPassword.length !== 4 ||
      isNaN(newPassword)
    ) {
      setError(
        "Username must not be empty and password must be a 4-digit number."
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/add_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: newUsername,
          user_password: newPassword,
          allocated_devices: [],
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(`Failed to add user: ${errorMessage}`);
        return;
      }

      setOpenNewUserDialog(false);
      setNewUsername("");
      setNewPassword("");
      setError("");

      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      setError("An error occurred while adding the user.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || deletePassword.length !== 4 || isNaN(deletePassword)) {
      setDeleteError("Please enter a valid 4-digit password.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/delete_user/${encodeURIComponent(
          userToDelete.user_name
        )}/${encodeURIComponent(deletePassword)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        setDeleteError(`Failed to delete user: ${errorMessage}`);
        return;
      }

      // Fetch users again to update the UI correctly
      await fetchUsers();

      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteError("An error occurred while deleting the user.");
    }
  };

  const router = useRouter();

  const theme = getTheme(darkMode ? "dark" : "light");

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
    setPasswordInput("");
    setPasswordValid(null);
  };

  const handlePasswordSubmit = async () => {
    if (selectedUser && passwordInput === selectedUser.user_password) {
      setPasswordValid(true);

      try {
        const response = await fetch(
          `http://localhost:8000/select_user/${selectedUser.user_name}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          console.error("Failed to set selected user");
          return;
        }

        const selectedResponse = await fetch(
          "http://localhost:8000/selected_user"
        );
        const selectedData = await selectedResponse.json();
        console.log("Selected user from API:", selectedData);

        router.push("/dashboard");
      } catch (error) {
        console.error("Error setting selected user:", error);
      }
    } else {
      setPasswordValid(false);
    }
  };

  const handleKeyPress = (value) => {
    if (passwordInput.length < 4) {
      setPasswordInput((prevInput) => prevInput + value);
    }
  };

  const handleClear = () => {
    setPasswordInput((prevInput) => prevInput.slice(0, -1));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          px: 2,
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 16, right: 16 }}
          color="inherit"
          onClick={() => setDarkMode(!darkMode)}
        >
          <LightModeIcon sx={{ color: "primary.main", fontSize: "1.5rem" }} />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontFamily: "JetBrains Mono",
            fontWeight: "800",
            mb: 3,
            color: "primary.main",
            fontSize: "2.5rem",
          }}
        >
          Users List
        </Typography>

        {loading ? (
          <CircularProgress color="primary" />
        ) : (
          <Container
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 3,
              maxWidth: "1000px",
            }}
          >
            {users.length > 0 ? (
              users.map((user, index) => (
                <Card
                  key={index}
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.primary",
                    textAlign: "center",
                    p: 2,
                    boxShadow: 6,
                    borderRadius: 3,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <CardContent onClick={() => handleUserClick(user)}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "JetBrains Mono",
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                    >
                      {user.user_name}
                    </Typography>
                    <Typography
                      variant="h7"
                      sx={{
                        fontFamily: "JetBrains Mono",
                        fontWeight: "bold",
                        color: "primary.main",
                      }}
                    >
                      {user.user_role === "super_user"
                        ? "Super User"
                        : "Sub User"}
                    </Typography>
                  </CardContent>

                  {/* Delete Button */}
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      color: "primary.main",
                    }}
                    onClick={() => handleDeleteClick(user)}
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Card>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                No users found.
              </Typography>
            )}
          </Container>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            Enter Password for {selectedUser ? selectedUser.user_name : "User"}
          </DialogTitle>
          <DialogContent>
            <DotInput value={passwordInput} maxLength={4} />
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mt: 2,
                mb: 2,
                fontFamily: "JetBrains Mono",
                fontSize: { xs: "15px", md: "24px" },
              }}
            >
              Please enter your 4-digit password:
            </Typography>

            <Keypad
              onKeyPress={handleKeyPress}
              onClear={handleClear}
              onSubmit={handlePasswordSubmit}
            />

            {passwordValid !== null && (
              <Typography
                variant="body2"
                sx={{
                  color: passwordValid ? "green" : "red",
                  textAlign: "center",
                  mt: 1,
                }}
              >
                {passwordValid ? "Password is correct!" : "Incorrect password."}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              color="primary"
              disabled={passwordInput.length !== 4}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openNewUserDialog}
          onClose={() => setOpenNewUserDialog(false)}
        >
          <DialogTitle
            sx={{ fontFamily: "Jetbrains Mono", color: "primary.main" }}
          >
            Add New User
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body1"
              sx={{ mb: 2, fontFamily: "JetBrains Mono" }}
            >
              Enter a username and a 4-digit password.
            </Typography>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="4-digit Password"
              variant="outlined"
              fullWidth
              required
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              inputProps={{
                maxLength: 4,
                pattern: "[0-9]*",
                inputMode: "numeric",
              }}
              sx={{ mb: 2 }}
            />
            {error && <Typography color="error">{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenNewUserDialog(false)}
              color="primary"
              sx={{ fontFamily: "JetBrains Mono" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewUserSubmit}
              color="primary"
              sx={{ fontFamily: "JetBrains Mono" }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle
            sx={{ fontFamily: "JetBrains Mono", color: "primary.main" }}
          >
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body1"
              sx={{ mb: 2, fontFamily: "JetBrains Mono" }}
            >
              Selected user to delete:{" "}
              <strong>{userToDelete?.user_name}</strong>
            </Typography>
            <TextField
              label="Enter 4-digit Password"
              variant="outlined"
              fullWidth
              required
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              inputProps={{
                maxLength: 4,
                pattern: "[0-9]*",
                inputMode: "numeric",
              }}
              sx={{ mb: 2 }}
            />
            {deleteError && (
              <Typography color="error">{deleteError}</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              color="primary"
              sx={{ fontFamily: "JetBrains Mono" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              sx={{ fontFamily: "JetBrains Mono" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 5, fontFamily: "JetBrains Mono", color: "white" }}
          onClick={() => setOpenNewUserDialog(true)}
        >
          Add New User
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default Users;
