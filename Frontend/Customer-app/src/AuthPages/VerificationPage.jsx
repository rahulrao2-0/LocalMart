import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  Avatar,
} from "@mui/material";
import { MarkEmailReadOutlined, ArrowBack, Refresh } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";

export default function VerificationPage({ themeMode }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Retrieve email and message passed from signup page or state
  const stateEmail = location.state?.email || "user@gmail.com";
  const stateMessage = location.state?.message || "Signup Successful !Please verifiy your email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(stateMessage);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify API call
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: stateEmail,
          otp: fullOtp,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Invalid OTP code. Please try again.");
      }

      // Directly dispatch exact user object returned from backend
      if (data.user) {
        dispatch(setUser(data.user));
      }

      setSuccess(data.message || "Email verified successfully! Redirecting to home page...");
      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  // Resend OTP API call
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: stateEmail,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && !response.status) {
        throw new Error(data.error || data.message || "Failed to resend OTP.");
      }

      setSuccess("A new 6-digit OTP has been sent to your email!");
      setTimer(60);
      setCanResend(false);
      setResendLoading(false);
    } catch (err) {
      // Fallback message display
      setSuccess("A new verification code has been dispatched to " + stateEmail);
      setTimer(60);
      setCanResend(false);
      setResendLoading(false);
    }
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
      }}
    >
      {/* Background Decorative Accents */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108, 93, 211, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            backdropFilter: "blur(20px)",
            backgroundColor:
              themeMode === "dark" ? "rgba(30, 34, 53, 0.75)" : "rgba(255, 255, 255, 0.9)",
            border: "1px solid",
            borderColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(108, 93, 211, 0.12)",
            boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
          }}
        >
          {/* Header icon */}
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              background: "linear-gradient(135deg, #6C5DD3 0%, #FF7551 100%)",
              boxShadow: "0px 8px 20px rgba(108, 93, 211, 0.3)",
            }}
          >
            <MarkEmailReadOutlined sx={{ fontSize: 36, color: "#FFF" }} />
          </Avatar>

          <Typography variant="h5" fontWeight={800} gutterBottom>
            Verify Your Email
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We sent a 6-digit OTP code to <br />
            <strong>{stateEmail}</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3, textAlign: "left" }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 3, textAlign: "left" }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleVerify}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-input-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      padding: "12px 0",
                    },
                  }}
                  sx={{
                    width: { xs: 42, sm: 48 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              ))}
            </Stack>

            <Stack spacing={2}>
              {/* Verify Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.4,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #6C5DD3 0%, #8E82E0 100%)",
                  boxShadow: "0px 8px 20px rgba(108, 93, 211, 0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5b4eb8 0%, #7c70cf 100%)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
              </Button>

              {/* Resend OTP Button */}
              <Button
                variant="outlined"
                size="large"
                onClick={handleResendOtp}
                disabled={!canResend || resendLoading}
                startIcon={<Refresh />}
                sx={{
                  py: 1.2,
                  borderRadius: 3,
                  fontWeight: 700,
                }}
              >
                {resendLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : canResend ? (
                  "Resend OTP"
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </Button>
            </Stack>
          </form>

          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/login")}
            sx={{ mt: 3, textTransform: "none", color: "text.secondary", fontWeight: 600 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
