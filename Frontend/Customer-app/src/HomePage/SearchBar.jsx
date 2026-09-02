import React, { useState, useEffect, useRef } from "react";
import { 
  Paper, InputBase, IconButton, Divider, Box, Chip, Typography, 
  useTheme, List, ListItem, ListItemIcon, ListItemText, CircularProgress,
  ClickAwayListener, ListItemButton
} from "@mui/material";
import { 
  Search as SearchIcon, Tune as TuneIcon, Clear as ClearIcon,
  Inventory as ProductIcon, Store as BrandIcon, Category as CategoryIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAutocompleteSuggestions } from "../services/searchApi";

const trendingSearches = ["Milk", "Onions", "Study table", "Wireless mouse", "Rice 5kg"];

export default function SearchBar({
  placeholder = "Search for fresh food, furniture, electronics, shops...",
  onSearch,
  navigateOnSearch = false
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const theme = useTheme();
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  
  const handleTextChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);

    if (!navigateOnSearch && onSearch) {
      onSearch(val);
    }
    
    if (val.length >= 2) {
      setLoading(true);
      setShowDropdown(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await getAutocompleteSuggestions(val);
          setSuggestions(response?.suggestions || response || []);
        } catch (error) {
          console.error("Autocomplete error:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowDropdown(false);
    const label = suggestion.text || suggestion.name;
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'brand') {
      navigate(`/search?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(label)}`);
    } else if (suggestion.type === 'category') {
      navigate(`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(label)}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(label)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
       handleSuggestionClick(suggestions[selectedIndex]);
    } else {
       if (navigateOnSearch) {
         navigate(`/search?q=${encodeURIComponent(query)}`);
       } else {
         if (onSearch) onSearch(query);
         else navigate(`/search?q=${encodeURIComponent(query)}`);
       }
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onSearch && !navigateOnSearch) onSearch("");
  };

  const handleChipClick = (term) => {
    setQuery(term);
    if (navigateOnSearch) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      if (onSearch) onSearch(term);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product': return <ProductIcon fontSize="small" sx={{ color: "text.secondary" }} />;
      case 'brand': return <BrandIcon fontSize="small" sx={{ color: "text.secondary" }} />;
      case 'category': return <CategoryIcon fontSize="small" sx={{ color: "text.secondary" }} />;
      default: return <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />;
    }
  };

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
        <Box>
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
              onKeyDown={handleKeyDown}
              onFocus={() => { if (query.length >= 2) setShowDropdown(true); }}
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
                {loading ? <CircularProgress size={20} color="inherit" /> : <ClearIcon fontSize="small" />}
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

          {/* Autocomplete Dropdown */}
          {showDropdown && (suggestions.length > 0 || loading) && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                zIndex: 10,
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 93, 211, 0.1)",
                backgroundColor: theme.palette.mode === "dark" ? "#1A1A2E" : "#FFFFFF",
                overflow: 'hidden',
                maxHeight: 300,
                overflowY: 'auto'
              }}
            >
              {loading && suggestions.length === 0 ? (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List disablePadding>
                  {suggestions.map((suggestion, index) => (
                    <ListItem disablePadding key={`${suggestion.type}-${suggestion.id || index}`}>
                      <ListItemButton 
                        selected={index === selectedIndex}
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(108, 93, 211, 0.08)",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(108, 93, 211, 0.12)",
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getSuggestionIcon(suggestion.type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={suggestion.text || suggestion.name} 
                          secondary={suggestion.type}
                          secondaryTypographyProps={{ fontSize: 12, textTransform: 'capitalize' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </Box>
      </ClickAwayListener>

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
