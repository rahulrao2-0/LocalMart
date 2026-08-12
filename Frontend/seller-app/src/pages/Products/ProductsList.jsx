import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, TextField, Avatar, Chip, InputAdornment,
  Grid, Stack, Snackbar, Alert, Skeleton, Tooltip, useMediaQuery, useTheme, alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import PhotoCameraIcon from '@mui/icons-material/PhotoCameraRounded';
import DocumentScannerIcon from '@mui/icons-material/DocumentScannerRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct, scanBarcodeThunk,
} from '../../features/products/productSlice';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const LOW_STOCK_THRESHOLD = 10;

const EMPTY_FORM = {
  name: '', description: '', brand: '', category: '', price: '', stockAvailable: '',
  discount: '', weight: '', barcode: '', barcodeType: '', manufacturer: '', imagesData: '',
};

const inr = (value) => `₹${Number(value || 0).toFixed(2)}`;

const getStockTone = (stock) => {
  const n = Number(stock);
  if (n === 0) return { color: 'error.main', label: 'Out of stock' };
  if (n < LOW_STOCK_THRESHOLD) return { color: 'warning.main', label: `${n} left` };
  return { color: 'text.primary', label: `${n} units` };
};

/** Row rendered as a card below `md`, where the 6-column table can't fit. */
const ProductCard = ({ product, onEdit, onDelete }) => {
  const theme = useTheme();
  const image = product.images?.[0]?.url;
  const stock = getStockTone(product.stockAvailable);

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 3.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Avatar
          src={image}
          variant="rounded"
          sx={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          {!image && <InventoryIcon />}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
            {product.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {[product.brand || 'No brand', product.weight].filter(Boolean).join(' · ')}
          </Typography>
        </Box>

        <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, flexShrink: 0 }}>
          {inr(product.price)}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Chip
          size="small"
          label={product.category || 'Uncategorized'}
          sx={{ bgcolor: 'background.muted' }}
        />
        <Chip
          size="small"
          variant="outlined"
          label={stock.label}
          sx={{ color: stock.color, borderColor: 'currentColor' }}
        />
        {Number(product.discount) > 0 && (
          <Chip size="small" color="success" variant="outlined" label={`${product.discount}% off`} />
        )}
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<EditIcon fontSize="small" />}
          onClick={() => onEdit(product)}
        >
          Edit
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon fontSize="small" />}
          onClick={() => onDelete(product.id || product._id)}
        >
          Delete
        </Button>
      </Stack>
    </Paper>
  );
};

const ProductsList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  const { items, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [toast, setToast] = useState(null); // { message, severity }

  useEffect(() => {
    let scanner;
    let timer;
    if (showScanner) {
      // Delay initialization so MUI Dialog has time to render the DOM element
      timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner(
            "barcode-reader",
            {
              fps: 15,
              qrbox: { width: 280, height: 140 },
              formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.QR_CODE
              ],
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
              }
            },
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
                    weight: p.weight || prev.weight,
                    imagesData: p.images ? JSON.stringify(p.images) : prev.imagesData
                  }));
                  setToast({
                    severity: 'success',
                    message: 'Product details fetched. Please fill in the remaining fields.',
                  });
                  setOpenDialog(true); // Open the dialog if it was closed
                }
              } catch (err) {
                setToast({ severity: 'error', message: err || 'Failed to fetch product details.' });
              } finally {
                setScanLoading(false);
              }
            },
            () => {} // ignore ongoing scan errors
          );
        } catch (e) {
          console.error("Failed to initialize scanner", e);
        }
      }, 150);
    }
    return () => {
      clearTimeout(timer);
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
        weight: product.weight || '',
        imagesData: ''
      });
    } else {
      setEditingProduct(null);
      setFormData(EMPTY_FORM);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setImageFiles(Array.from(e.target.files));

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
    if (formData.weight) data.append('weight', formData.weight);
    if (formData.barcode) data.append('barcode', formData.barcode);
    if (formData.barcodeType) data.append('barcodeType', formData.barcodeType);
    if (formData.manufacturer) data.append('manufacturer', formData.manufacturer);
    if (formData.imagesData) data.append('images', formData.imagesData);

    imageFiles.forEach(file => {
      data.append('images', file);
    });

    if (editingProduct) {
      dispatch(updateProduct({ id: editingProduct.id || editingProduct._id, productData: data }));
      setToast({ severity: 'success', message: 'Product updated.' });
    } else {
      dispatch(createProduct(data));
      setToast({ severity: 'success', message: 'Product created.' });
    }
    handleCloseDialog();
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      dispatch(deleteProduct(pendingDeleteId));
      setToast({ severity: 'success', message: 'Product deleted.' });
    }
    setPendingDeleteId(null);
  };

  // Client-side filter. The search field was previously rendered with no state
  // wired up, so typing in it did nothing.
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((p) =>
      [p.name, p.brand, p.category, p.barcode, p.manufacturer]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }, [items, searchQuery]);

  const isInitialLoading = loading && items.length === 0;
  const isFormValid =
    formData.name && formData.price && formData.stockAvailable && formData.category;

  const scannerBox = (
    <Box id="barcode-reader" sx={{ width: '100%', maxWidth: 500, mx: 'auto' }} />
  );

  return (
    <Box>
      <PageHeader
        title="Product Catalog"
        subtitle="Manage your inventory, pricing, and product details."
        actions={
          <>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DocumentScannerIcon />}
              onClick={() => setShowScanner(true)}
            >
              Scan Barcode
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Add New Product
            </Button>
          </>
        }
      />

      <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ mb: 2.5, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, brand, category…"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {filteredItems.length} of {items.length} products
          </Typography>
        </Box>

        {isInitialLoading ? (
          <Stack spacing={1.5}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={isCompact ? 150 : 68} />
            ))}
          </Stack>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<InventoryIcon />}
            title={searchQuery ? 'No matching products' : 'No products yet'}
            description={
              searchQuery
                ? 'Try a different name, brand, or category.'
                : 'Add your first product to start selling on LocalMart.'
            }
            action={
              searchQuery ? (
                <Button variant="outlined" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              ) : (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                  Add New Product
                </Button>
              )
            }
          />
        ) : isCompact ? (
          <Stack spacing={1.5}>
            {filteredItems.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onEdit={handleOpenDialog}
                onDelete={setPendingDeleteId}
              />
            ))}
          </Stack>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((product) => {
                  const image = product.images?.[0]?.url;
                  const stock = getStockTone(product.stockAvailable);
                  return (
                    <TableRow key={product.id || product._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={image}
                            variant="rounded"
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: 2.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          >
                            {!image && <InventoryIcon />}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {product.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: 'block', maxWidth: 240 }}
                            >
                              {[product.brand || 'No brand', product.weight, product.barcode]
                                .filter(Boolean)
                                .join(' · ')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={product.category || 'Uncategorized'}
                          sx={{ bgcolor: 'background.muted' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800 }}>
                          {inr(product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: stock.color }}>
                          {stock.label}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: Number(product.discount) > 0 ? 'success.main' : 'text.secondary',
                          }}
                        >
                          {product.discount ? `${product.discount}%` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit product">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog(product)}
                              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete product">
                            <IconButton
                              color="error"
                              onClick={() => setPendingDeleteId(product.id || product._id)}
                              sx={{ bgcolor: alpha(theme.palette.error.main, 0.08) }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Standalone scanner */}
      <Dialog
        open={showScanner && !openDialog}
        onClose={() => setShowScanner(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isPhone}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>Scan Barcode</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Point your camera at the product barcode.
          </Typography>
          {scannerBox}
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="outlined" color="error" onClick={() => setShowScanner(false)}>
            Cancel Scan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / edit product */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isPhone}
        scroll="paper"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <span>{editingProduct ? 'Edit Product Details' : 'Create New Product'}</span>
          {!editingProduct && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<DocumentScannerIcon />}
              onClick={() => setShowScanner(!showScanner)}
              disabled={scanLoading}
              sx={{ flexShrink: 0 }}
            >
              {scanLoading ? 'Scanning…' : showScanner ? 'Close Scanner' : 'Smart Scan'}
            </Button>
          )}
        </DialogTitle>

        <DialogContent dividers>
          {showScanner && openDialog && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                Point your camera at the product barcode
              </Typography>
              {scannerBox}
            </Box>
          )}

          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField name="name" label="Product Name" value={formData.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField name="brand" label="Brand" value={formData.brand} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField name="category" label="Category" value={formData.category} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <TextField name="price" label="Price (₹)" type="number" value={formData.price} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <TextField name="stockAvailable" label="Stock" type="number" value={formData.stockAvailable} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <TextField
                name="discount"
                label="Disc. (%)"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                fullWidth
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField name="description" label="Description" value={formData.description} onChange={handleChange} fullWidth multiline required rows={4} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                name="barcode"
                label="Barcode"
                value={formData.barcode}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: !!formData.barcode || undefined } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                name="barcodeType"
                label="Barcode Type"
                value={formData.barcodeType}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: !!formData.barcodeType || undefined } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                name="manufacturer"
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: !!formData.manufacturer || undefined } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                name="weight"
                label="Weight / Size"
                placeholder="500g, 1kg…"
                value={formData.weight}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: !!formData.weight || undefined } }}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCameraIcon />}
                sx={{ py: 2, borderStyle: 'dashed', borderWidth: 2, '&:hover': { borderStyle: 'dashed', borderWidth: 2 } }}
              >
                {imageFiles.length > 0
                  ? `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected`
                  : 'Upload Product Images'}
                <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid} sx={{ px: 3 }}>
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation — replaces window.confirm */}
      <Dialog open={Boolean(pendingDeleteId)} onClose={() => setPendingDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This product will be removed from your catalog. This action can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDeleteId(null)} sx={{ fontWeight: 700 }}>
            Keep it
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
};

export default ProductsList;
