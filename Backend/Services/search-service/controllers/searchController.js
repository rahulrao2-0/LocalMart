import client from '../config/elasticsearch.js';

export const searchProducts = async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;

    const must = [];
    const filter = [];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['name^3', 'description', 'brand', 'category'],
          fuzziness: 'AUTO'
        }
      });
    } else {
      must.push({ match_all: {} });
    }

    if (category) {
      filter.push({ term: { category } });
    }

    if (brand) {
      filter.push({ term: { 'brand.keyword': brand } });
    }

    if (minPrice || maxPrice) {
      const priceFilter = { range: { price: {} } };
      if (minPrice) priceFilter.range.price.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.range.price.lte = parseFloat(maxPrice);
      filter.push(priceFilter);
    }

    const result = await client.search({
      index: 'products',
      from,
      size: limit,
      body: {
        query: {
          bool: {
            must,
            filter
          }
        }
      }
    });

    const hits = result.hits.hits.map(hit => {
      const source = hit._source;
      return {
        id: source.productId || hit._id,
        name: source.name,
        brand: source.brand,
        category: source.category,
        image: Array.isArray(source.images) && source.images.length > 0 ? source.images[0].url : (source.images?.url || null),
        price: source.effectivePrice || source.price,
        originalPrice: source.effectivePrice && source.effectivePrice < source.price ? source.price : null,
        rating: source.rating || 0,
        reviewsCount: source.numReviews || 0,
        description: source.description
      };
    });

    res.status(200).json({
      success: true,
      total: result.hits.total.value,
      page: parseInt(page),
      pages: Math.ceil(result.hits.total.value / limit),
      limit: parseInt(limit),
      facets: {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 5000 }
      },
      data: hits
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

export const autocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, data: [] });

    const result = await client.search({
      index: 'products',
      body: {
        query: {
          match: {
            'name.autocomplete': q
          }
        },
        _source: ['name', 'productId', 'images', 'price', 'category']
      },
      size: 5
    });

    const hits = result.hits.hits.map(hit => {
      const source = hit._source;
      return {
        id: source.productId || hit._id,
        name: source.name,
        type: 'product',
        price: source.effectivePrice || source.price,
        image: Array.isArray(source.images) && source.images.length > 0 ? source.images[0].url : (source.images?.url || null)
      };
    });
    
    // In a real app we might also query categories or brands here for autocomplete suggestions
    
    res.status(200).json({ success: true, suggestions: hits });
  } catch (error) {
    console.error('Error in autocomplete:', error);
    res.status(500).json({ success: false, message: 'Autocomplete failed', error: error.message });
  }
};
