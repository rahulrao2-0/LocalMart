import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color = '#FF5722', subtitle, trend, trendValue }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 4, 
        boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        border: '1px solid',
        borderColor: 'grey.100',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.06)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              p: 1.5,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box 
              sx={{ 
                bgcolor: trend === 'up' ? 'success.50' : 'error.50',
                color: trend === 'up' ? 'success.main' : 'error.main',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </Box>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
