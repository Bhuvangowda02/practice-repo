'use client';

import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';


const flipAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;


const AnimatedIcon = styled(HourglassTopIcon)(({ theme }) => ({

  fontSize: 64, 
  color: theme.palette.primary.main,
  animation: `${flipAnimation} 4s infinite steps(2, end)`,
}));

const FadingTypography = styled(Typography)(({ theme }) => ({
  animation: `${fadeInAnimation} 0.8s ease-out forwards`,
}));

const ResultsDisplay = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        
          p: 6, 
          backgroundColor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0px 10px B1px solid',
          borderColor: 'divider',
         
          maxWidth: '550px',
          width: '100%',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
          
          <CircularProgress
            variant="determinate"
            value={100}
            size={100}
            thickness={2}
            sx={{
              color: 'action.hover'
            }}
          />
        
          <CircularProgress
            variant="indeterminate"
            size={100}
            thickness={2.5}
            sx={{
              color: 'primary.main',
              position: 'absolute',
              left: 0,
            }}
          />
         
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AnimatedIcon />
          </Box>
        </Box>

        <FadingTypography variant="h4" sx={{ fontWeight: 600, mb: 1.5 }}>
          We are processing your result.
        </FadingTypography>
        
        <FadingTypography 
          variant="body1" 
          color="text.secondary" 
          sx={{ animationDelay: '0.2s', lineHeight: 1.7 }}
        >
          Please allow us a maximum of 30 minutes.
          <br />
          TO VIEW THE RESULT : You may click on metrics found in the mock test page next to the mock number
        </FadingTypography>
      </Box>
    </Box>
  );
};

export default ResultsDisplay;
