import React, { useState } from "react";
import { Paper, InputBase, IconButton, Divider, Box, Chip, Typography, useTheme } from "@mui/material";
import { Search as SearchIcon, Tune as TuneIcon, Clear as ClearIcon } from "@mui/icons-material";

const trendingSearches = ["Milk", "Onions", "Study table", "Wireless mouse", "Rice 5kg"];

export default function SearchBar({
  placeholder = "Search for fresh food, furniture, electronics, shops...",
  onSearch,
}) {
  const [query, setQuery] = useState("");
  const theme = useTheme();

  const handleTextChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  const handleChipClick = (term) => {
    setQuery(term);
    if (onSearch) onSearch(term);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1.5px solid",
          borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 93, 211, 0.1)",
          borderRadius: 4,
          px: 2,
          height: 54,
          backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "#FFFFFF",
          boxShadow: theme.palette.mode === "dark" 
            ? "0px 8px 24px rgba(0, 0, 0, 0.2)" 
            : "0px 8px 24px rgba(108, 93, 211, 0.04)",
          transition: "all 0.3s ease",
          "&:hover, &:focus-within": {
            borderColor: "primary.main",
            boxShadow: theme.palette.mode === "dark" 
              ? "0px 8px 32px rgba(108, 93, 211, 0.15)" 
              : "0px 8px 32px rgba(108, 93, 211, 0.08)",
          },
        }}
      >
        <SearchIcon sx={{ color: "primary.main", mr: 1.5, fontSize: 22 }} />
        <InputBase
          fullWidth
          placeholder={placeholder}
          value={query}
          onChange={handleTextChange}
          sx={{
            fontSize: 16,
            fontWeight: 500,
            "& input::placeholder": {
              color: "text.secondary",
              opacity: 0.8,
            },
          }}
        />
        {query && (
          <IconButton size="small" onClick={handleClear} sx={{ mr: 1, color: "text.secondary" }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
        <Divider orientation="vertical" flexItem sx={{ my: 1.5, mx: 1 }} />
        <IconButton
          size="small"
          sx={{
            color: "primary.main",
            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(108, 93, 211, 0.06)",
            "&:hover": {
              backgroundColor: "primary.main",
              color: "#FFFFFF",
            },
            transition: "all 0.2s ease",
          }}
        >
          <TuneIcon fontSize="small" />
        </IconButton>
      </Paper>

      {/* TRENDING SECTION */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 2, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "1px" }}>
          Trending:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {trendingSearches.map((term) => (
            <Chip
              key={term}
              label={term}
              size="small"
              onClick={() => handleChipClick(term)}
              clickable
              sx={{
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(108, 93, 211, 0.03)",
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(108, 93, 211, 0.06)",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "#FFFFFF",
                  borderColor: "primary.main",
                },
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}