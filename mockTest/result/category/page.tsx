'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getMocktestResultById } from '../../../../services/mocktestResultAPI';
import {
  Alert,
  IconButton,
  List,
  ListItem,
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
            
          
        </ListItem>
        
      </List>
    </main>
  );
};

export default MockTestResultPage;
