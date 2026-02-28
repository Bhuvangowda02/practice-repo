'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getMocktestResultById } from '../../../../services/mocktestResultAPI';
import {
  Alert,
  Box,
  IconButton,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';//loader



const MockTestResultPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [title, setTitle] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [answers, setAnswers] = useState<any>([]);
  const [displayRefreshButton, setDisplayRefreshButton] =
    useState<boolean>(false);


  
  const CATEGORY_ORDER = ['speaking', 'writing', 'reading', 'listening'];

  const getCategoryColor = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'speaking':
        return '#ff5955'; // green
      case 'writing':
        return '#4caf50'; // blue
      case 'reading':
        return '#ff9800'; // orange
      case 'listening':
        return '#9e9e9e'; // pink
      default:
        return '#e91e63'; // grey
    }
  };

  

  const onRefresh = async () => {
    try {
      if (id) {
        const data = await getMocktestResultById(id);
        setTitle(data?.result?.mocktestId?.title || '');
        setAnswers(data?.answers || []);
        if (
          data?.result?.result?.score !== undefined &&
          data.result.result.score !== null
        ) {
          setResult(data.result.result);
          setDisplayRefreshButton(false);
        }
      }
    } catch (error) {
      console.error('Error fetching mock test result:', error);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0 }}>Mock Test Result - {title}</h1>
        {displayRefreshButton && (
          <IconButton color='primary' onClick={onRefresh} aria-label='refresh'>
            <RefreshIcon />
          </IconButton>
        )}
      </div>

      <List>
        <ListItem>
          {result?.score ? (
            <Box display='flex' gap={6}>
              {CATEGORY_ORDER.map((category) => (
                <Box
                  display='flex'
                  alignItems='center'
                  gap={2}
                  flexDirection='column'
                  key={category}
                >
                  {/* Circular Score Badge */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: getCategoryColor(category), // Dynamic border color
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: 'text.primary',
                    }}
                  >
                    {result?.[category]?.score ?? '--'}
                  </Box>
                  {/* Score Label */}
                  <Typography variant='body2'>
                    <strong>
                      {category.charAt(0).toUpperCase() + category.slice(1)}{' '}
                    </strong>
                  </Typography>
                </Box>
              ))}
              <Box
                display='flex'
                alignItems='center'
                gap={2}
                flexDirection='column'
              >
                {/* Circular Score Badge */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: getCategoryColor(''), // Dynamic border color
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: 'text.primary',
                  }}
                >
                  {result?.score ?? '--'}
                </Box>
                {/* Score Label */}
                <Typography variant='body2'>
                  <strong>{'Overall'}</strong>
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <Alert
                severity='info'
                variant='outlined'
                sx={{ fontWeight: 'bold' }}
              >
                We are processing your result. <br />
                Please allow us a maximum of 30 minutes. <br />
                Kindly close this page. You can view the result in the metrics
                next to mock test number.
              </Alert>
            </>
          )}
        </ListItem>
        
      </List>
    </main>
  );
};

export default MockTestResultPage;
