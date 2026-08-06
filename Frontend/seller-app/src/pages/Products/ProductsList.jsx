import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Avatar, Chip, InputAdornment,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { fetchProducts, createProduct, updateProduct, deleteProduct, scanBarcodeThunk } from '../../features/products/productSlice';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ProductsList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', description: '', brand: '', category: '', price: '', stockAvailable: '', discount: '',
    barcode: '', barcodeType: '', manufacturer: '', imagesData: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    let scanner;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "barcode-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setShowScanner(false);
          setScanLoading(true);
          try {
            const res = await dispatch(scanBarcodeThunk(decodedText)).unwrap();
            if (res && res.success) {
              const p = res.product;
              setFormData(prev => ({
                ...prev,
                name: p.name || prev.name,
                brand: p.brand || prev.brand,
                category: p.category || prev.category,
                description: p.description || prev.description,
                barcode: p.barcode || decodedText,
                barcodeType: p.barcodeType || prev.barcodeType,
                manufacturer: p.manufacturer || prev.manufacturer,
                imagesData: p.images ? JSON.stringify(p.images) : prev.imagesData
              }));
              alert("Product details fetched successfully! Please fill remaining fields.");
            }
          } catch (err) {
            alert(err || "Failed to fetch product details.");
          } finally {
            setScanLoading(false);
          }
        },
        (error) => {} // ignore ongoing scan errors
      );
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Scanner clear error", e));
      }
    };
  }, [showScanner, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchProducts(user.id || user._id));
    }
  }, [dispatch, user]);

  const handleOpenDialog = (product = null) => {
    setImageFiles([]); // Reset images
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        category: product.category || '',
        price: product.price || '',
        stockAvailable: product.stockAvailable || '',
        discount: product.discount || '',
        barcode: product.barcode || '',
        barcodeType: product.barcodeType || '',
        manufacturer: product.manufacturer || '',
        imagesData: ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', brand: '', category: '', price: '', stockAvailable: '', discount: '', barcode: '', barcodeType: '', manufacturer: '', imagesData: '' });
    }
    setOpenDialog(true);
    setShowScanner(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = () => {
    // We must use FormData if we are uploading images
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('brand', formData.brand);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('stockAvailable', formData.stockAvailable);
    if (formData.discount) data.append('discount', formData.discount);
    if (formData.barcode) data.append('barcode', formData.barcode);
    if (formData.barcodeType) data.append('barcodeType', formData.barcodeType);
    if (formData.manufacturer) data.append('manufacturer', formData.manufacturer);
    if (formData.imagesData) data.append('images', formData.imagesData);
    
    imageFiles.forEach(file => {
      data.append('images', file);
    });
    
    if (editingProduct) {
      dispatch(updateProduct({ id: editingProduct.id || editingProduct._id, productData: data }));
    } else {
      dispatch(createProduct(data));
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  if (loading && items.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={40} thickness={4} /></Box>;
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Product Catalog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your inventory, pricing, and product details.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 'bold' }}
        >
          Add New Product
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'grey.100' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            size="small"
            variant="outlined"
            sx={{ flexGrow: 1, maxWidth: '400px', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Stock</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id || product._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: '0.2s', '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                        variant="rounded" 
                        sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 48, height: 48, borderRadius: 2 }}
                      >
                        {!product.images || product.images.length === 0 ? <InventoryIcon /> : null}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 200 }}>
                          {product.brand || 'No Brand'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category || 'Uncategorized'} size="small" sx={{ bgcolor: 'grey.100', fontWeight: 600, borderRadius: 1.5 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800 }}>
                      ${parseFloat(product.price).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" color={product.stockAvailable < 10 ? 'error.main' : 'text.primary'} sx={{ fontWeight: 'bold' }}>
                      {product.stockAvailable} units
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDialog(product)} sx={{ bgcolor: 'primary.50', mr: 1, '&:hover': { bgcolor: 'primary.100' } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product.id || product._id)} sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary">No products found.</Typography>
                    <Typography variant="body2" color="text.disabled">Click "Add New Product" to get started.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modernized Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 800, fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingProduct ? 'Edit Product Details' : 'Create New Product'}
          {!editingProduct && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DocumentScannerIcon />}
              onClick={() => setShowScanner(!showScanner)}
              disabled={scanLoading}
            >
              {scanLoading ? 'Scanning...' : showScanner ? 'Close Scanner' : 'Smart Scan Barcode'}
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%' }}>
            {showScanner && (
              <Box sx={{ mb: 2, p: 2, border: '2px dashed #1976d2', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                  Point your camera at the product barcode
                </Typography>
                <Box id="barcode-reader" sx={{ width: '100%', maxWidth: '500px', mx: 'auto' }}></Box>
              </Box>
            )}
          </Box>
          <Box component="form" sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Product Name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="brand"
                  label="Brand"
                  value={formData.brand}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="category"
                  label="Category"
                  value={formData.category}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  name="price"
                  label="Price ($)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  name="stockAvailable"
                  label="Stock Quantity"
                  type="number"
                  value={formData.stockAvailable}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  name="discount"
                  label="Discount (%)"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  required
                  rows={4}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="barcode"
                  label="Barcode (ISBN, UPC, EAN)"
                  value={formData.barcode}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: !!formData.barcode || undefined }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="barcodeType"
                  label="Barcode Type"
                  value={formData.barcodeType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: !!formData.barcodeType || undefined }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="manufacturer"
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: !!formData.manufacturer || undefined }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<PhotoCameraIcon />}
                  sx={{ py: 2, borderStyle: 'dashed', borderWidth: 2 }}
                >
                  {imageFiles.length > 0 ? `${imageFiles.length} Images Selected` : 'Upload Product Images'}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.name || !formData.price || !formData.stockAvailable || !formData.category}
            sx={{ px: 4, borderRadius: 2, fontWeight: 'bold' }}
          >
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsList;
