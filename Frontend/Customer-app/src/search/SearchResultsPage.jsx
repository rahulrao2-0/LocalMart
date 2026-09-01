import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  IconButton,
  Drawer,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Skeleton,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import ClearIcon from '@mui/icons-material/Clear';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { searchProducts } from '../services/searchApi';

// Reusable inline product card
const SearchProductCard = ({ product }) => {
  const theme = useTheme();
  const discount = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 6px 25px rgba(108, 93, 211, 0.2)'
            : '0 6px 25px rgba(108, 93, 211, 0.15)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={product.image || 'https://via.placeholder.com/300?text=No+Image'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        {discount > 0 && (
          <Chip
            label={`${discount}% OFF`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#FF7551',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Chip 
          label={product.category} 
          size="small" 
          sx={{ 
            mb: 1, 
            fontSize: '0.7rem', 
            backgroundColor: 'rgba(108, 93, 211, 0.1)',
            color: '#6C5DD3' 
          }} 
        />
        <Typography 
          gutterBottom 
          variant="subtitle1" 
          component="div"
          sx={{ 
            fontWeight: 600, 
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3
          }}
        >
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          {product.brand}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={product.rating || 0} 
            readOnly 
            size="small" 
            precision={0.5}
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
          <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
            ({product.reviewsCount || 0})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6C5DD3' }}>
            ${product.price?.toFixed(2)}
          </Typography>
          {product.originalPrice && (
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled', mb: 0.5 }}>
              ${product.originalPrice?.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          sx={{
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #6C5DD3 0%, #8A7DF0 100%)',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(108, 93, 211, 0.3)',
            '&:hover': {
              background: 'linear-gradient(90deg, #5B4EBE 0%, #766AD1 100%)',
            }
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card sx={{ height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={180} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="30%" height={32} />
    </CardContent>
    <CardActions sx={{ p: 2 }}>
      <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: '12px' }} />
    </CardActions>
  </Card>
);

const SearchResultsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({ categories: [], brands: [], priceRange: { min: 0, max: 1000 } });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Mobile Filter Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Local Filter State (to avoid immediate URL updates on every change before applying)
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState(searchParams.getAll('category') || []);
  const [selectedBrands, setSelectedBrands] = useState(searchParams.getAll('brand') || []);
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 5000
  ]);
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        q: searchParams.get('q') || '',
        category: searchParams.getAll('category').join(','),
        brand: searchParams.getAll('brand').join(','),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        rating: searchParams.get('rating'),
        sortBy: searchParams.get('sortBy') || 'relevance',
        page: searchParams.get('page') || 1,
        limit: 12
      };

      const res = await searchProducts(params);
      
      if (res?.success) {
        setProducts(res.data || []);
        if (res.facets) setFacets(res.facets);
        setPagination({
          page: res.page || 1,
          pages: res.pages || 1,
          total: res.total || 0
        });
      } else {
        // Fallback for demo if backend isn't ready
        setProducts([]);
        setPagination({ page: 1, pages: 1, total: 0 });
        setError(res?.message || 'Failed to fetch search results.');
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localQuery) newParams.set('q', localQuery);
    else newParams.delete('q');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', e.target.value);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (event, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', value.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryToggle = (category) => {
    const currentIndex = selectedCategories.indexOf(category);
    const newSelected = [...selectedCategories];
    if (currentIndex === -1) newSelected.push(category);
    else newSelected.splice(currentIndex, 1);
    setSelectedCategories(newSelected);
  };

  const handleBrandToggle = (brand) => {
    const currentIndex = selectedBrands.indexOf(brand);
    const newSelected = [...selectedBrands];
    if (currentIndex === -1) newSelected.push(brand);
    else newSelected.splice(currentIndex, 1);
    setSelectedBrands(newSelected);
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // Clear existing arrays
    newParams.delete('category');
    newParams.delete('brand');
    
    selectedCategories.forEach(c => newParams.append('category', c));
    selectedBrands.forEach(b => newParams.append('brand', b));
    
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      newParams.set('minPrice', priceRange[0]);
      newParams.set('maxPrice', priceRange[1]);
    } else {
      newParams.delete('minPrice');
      newParams.delete('maxPrice');
    }

    if (minRating > 0) newParams.set('rating', minRating);
    else newParams.delete('rating');
    
    newParams.set('page', '1');
    setSearchParams(newParams);
    if (isMobile) setDrawerOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 5000]);
    setMinRating(0);
    
    const newParams = new URLSearchParams();
    if (searchParams.get('q')) newParams.set('q', searchParams.get('q'));
    setSearchParams(newParams);
    if (isMobile) setDrawerOpen(false);
  };

  const FilterPanel = () => (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          Filters
        </Typography>
        <Button size="small" onClick={clearFilters} color="secondary" sx={{ textTransform: 'none' }}>
          Clear All
        </Button>
      </Box>
      <Divider />

      {/* Categories */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Categories</Typography>
        <FormGroup>
          {(facets.categories?.length ? facets.categories : [
            { key: 'Electronics', count: 0 },
            { key: 'Groceries', count: 0 },
            { key: 'Clothing', count: 0 },
            { key: 'Home & Kitchen', count: 0 }
          ]).map((cat) => (
            <FormControlLabel
              key={cat.key}
              control={
                <Checkbox 
                  checked={selectedCategories.includes(cat.key)}
                  onChange={() => handleCategoryToggle(cat.key)}
                  sx={{ color: '#6C5DD3', '&.Mui-checked': { color: '#6C5DD3' } }}
                />
              }
              label={<Typography variant="body2">{cat.key} {cat.count > 0 && `(${cat.count})`}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
      <Divider />

      {/* Price Range */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={facets.priceRange?.max || 5000}
          sx={{ color: '#FF7551' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">${priceRange[0]}</Typography>
          <Typography variant="body2">${priceRange[1]}</Typography>
        </Box>
      </Box>
      <Divider />

      {/* Brands */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Brands</Typography>
        <FormGroup>
          {(facets.brands?.length ? facets.brands : [
            { key: 'Samsung', count: 0 },
            { key: 'Apple', count: 0 },
            { key: 'Nike', count: 0 }
          ]).map((brand) => (
            <FormControlLabel
              key={brand.key}
              control={
                <Checkbox 
                  checked={selectedBrands.includes(brand.key)}
                  onChange={() => handleBrandToggle(brand.key)}
                  sx={{ color: '#6C5DD3', '&.Mui-checked': { color: '#6C5DD3' } }}
                />
              }
              label={<Typography variant="body2">{brand.key} {brand.count > 0 && `(${brand.count})`}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
      <Divider />

      {/* Minimum Rating */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Minimum Rating</Typography>
        <Rating
          value={minRating}
          onChange={(e, newValue) => setMinRating(newValue)}
          precision={1}
          icon={<StarIcon fontSize="inherit" />}
          emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.55 }} />}
        />
      </Box>

      <Button 
        variant="contained" 
        fullWidth 
        onClick={applyFilters}
        sx={{
          borderRadius: '12px',
          backgroundColor: '#6C5DD3',
          '&:hover': { backgroundColor: '#5B4EBE' }
        }}
      >
        Apply Filters
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for products, categories, or brands..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: localQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setLocalQuery('')} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '16px',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                '& fieldset': { borderColor: theme.palette.divider }
              }
            }}
          />
        </form>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Filters (Desktop) */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: '16px', position: 'sticky', top: 20 }}>
              <FilterPanel />
            </Card>
          </Grid>
        )}

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {loading ? 'Searching...' : `${pagination.total} results found`}
              {searchParams.get('q') && ` for "${searchParams.get('q')}"`}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isMobile && (
                <Button 
                  startIcon={<FilterListIcon />} 
                  variant="outlined"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ borderRadius: '12px', borderColor: '#6C5DD3', color: '#6C5DD3' }}
                >
                  Filters
                </Button>
              )}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={searchParams.get('sortBy') || 'relevance'}
                  label="Sort By"
                  onChange={handleSortChange}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="rating">Customer Rating</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Results Grid */}
          {error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ErrorOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Oops! Something went wrong.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <Button variant="contained" onClick={fetchResults} sx={{ borderRadius: '12px', backgroundColor: '#6C5DD3' }}>
                Try Again
              </Button>
            </Box>
          ) : loading ? (
            <Grid container spacing={3}>
              {Array.from(new Array(8)).map((_, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" 
                alt="No Results" 
                style={{ maxWidth: '300px', opacity: 0.8, marginBottom: '20px' }}
              />
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
                No products found
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Try adjusting your search or filters to find what you're looking for.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                sx={{ borderRadius: '12px', borderColor: '#6C5DD3', color: '#6C5DD3' }}
              >
                Clear All Filters
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product.id || product._id || Math.random()}>
                    <SearchProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination 
                    count={pagination.pages} 
                    page={pagination.page} 
                    onChange={handlePageChange} 
                    color="primary"
                    size={isMobile ? "small" : "large"}
                    sx={{
                      '& .MuiPaginationItem-root': { borderRadius: '8px' },
                      '& .Mui-selected': { backgroundColor: '#6C5DD3', color: 'white' }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 300, p: 0 } }}
      >
        <FilterPanel />
      </Drawer>
    </Container>
  );
};

export default SearchResultsPage;
