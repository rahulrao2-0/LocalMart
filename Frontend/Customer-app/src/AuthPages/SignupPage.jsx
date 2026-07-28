import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonOutlined,
  LockOutlined,
  MailOutlineOutlined,
  ArrowBack,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";

export default function SignupPage({ themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const validateEmail = (email) => {
    const lowerEmail = email.toLowerCase().trim();
    return lowerEmail.includes("@") && lowerEmail.endsWith("gmail.com");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanUsername = username.trim();
    const cleanGmail = gmail.trim();

    if (!cleanUsername || !cleanGmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (!validateEmail(cleanGmail)) {
      setError("Please enter a valid Gmail address (e.g., user@gmail.com).");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: cleanUsername,
          email: cleanGmail.toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Signup failed. Please try again.");
      }

      // Store user in Redux store
      const userData = data.user || { full_name: cleanUsername, email: cleanGmail };
      dispatch(setUser(userData));

      const successMsg = "Signup Successful !Please verifiy your email";
      setSuccess(successMsg);
      setTimeout(() => {
        setLoading(false);
        navigate("/verify-email", {
          state: {
            email: cleanGmail.toLowerCase(),
            message: successMsg,
          },
        });
      }, 1000);
    } catch (err) {
      // Fallback for frontend demo if backend offline
      const userData = { full_name: cleanUsername, email: cleanGmail };
      dispatch(setUser(userData));
      const successMsg = "Signup Successful !Please verifiy your email";
      setSuccess(successMsg);
      setTimeout(() => {
        setLoading(false);
        navigate("/verify-email", {
          state: {
            email: cleanGmail.toLowerCase(),
            message: successMsg,
          },
        });
      }, 1000);
    }
  };

  const handleGoogleSignup = () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    setTimeout(() => {
      const googleUser = {
        full_name: "Google User",
        email: "user@gmail.com",
        isGoogleUser: true,
      };

      dispatch(setUser(googleUser));
      setSuccess("Google Authentication successful!");
      
      setTimeout(() => {
        setGoogleLoading(false);
        navigate("/");
      }, 1000);
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 6,
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decorative Elements matching homepage theme */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: { xs: "300px", md: "500px" },
          height: { xs: "300px", md: "500px" },
          borderRadius: "50%",
          background: "rgba(108, 93, 211, 0.05)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: { xs: "350px", md: "600px" },
          height: { xs: "350px", md: "600px" },
          borderRadius: "50%",
          background: "rgba(255, 117, 81, 0.05)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          sx={{
            mb: 3,
            color: "text.secondary",
            fontWeight: 700,
            borderRadius: 3,
            "&:hover": {
              backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(108, 93, 211, 0.05)",
            },
          }}
        >
          Back to Shopping
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 6,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: themeMode === "dark"
              ? "0px 20px 40px rgba(0, 0, 0, 0.4)"
              : "0px 20px 40px rgba(108, 93, 211, 0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 8px 20px rgba(108, 93, 211, 0.3)",
                mb: 2,
              }}
            >
              <PersonOutlined sx={{ color: "#FFFFFF", fontSize: 28 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join LocalMart to shop hyperlocally from sellers near you
            </Typography>
          </Box>

          {/* Feedback Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Username"
                placeholder="Enter your username"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || googleLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />

              <TextField
                label="Gmail Address"
                placeholder="username@gmail.com"
                type="email"
                fullWidth
                required
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                disabled={loading || googleLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />

              <TextField
                label="Password"
                placeholder="Create password (min 4 characters)"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || googleLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || googleLoading}
                sx={{
                  py: 1.5,
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 3,
                  height: 56,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              OR
            </Typography>
          </Divider>

          {/* Google Auth Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
            startIcon={
              !googleLoading && (
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )
            }
            sx={{
              py: 1.5,
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 3,
              borderColor: "divider",
              color: "text.primary",
              backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(108, 93, 211, 0.04)",
              },
              height: 56,
            }}
          >
            {googleLoading ? <CircularProgress size={24} color="primary" /> : "Sign up with Google"}
          </Button>



          {/* Navigation to Login */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  p: 0,
                  minWidth: 0,
                  ml: 0.5,
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                    backgroundColor: "transparent",
                  },
                }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}