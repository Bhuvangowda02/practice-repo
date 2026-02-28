'use client';
import * as React from 'react';
// import { useSearchParams } from "next/navigation";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import Breadcrumb from '@/app/(Layout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import BaseCard from '@/app/components/shared/BaseCard';
import TableList from './TableList';
import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import BlankCard from '../../praticeMaterial/component/BlankCard';

const QuestionListInterface = () => {
  const [selectValue, setSelectValue] = React.useState('');
  const [searchTitle, setSearchTitle] = React.useState('');
  const [debouncedTitle, setDebouncedTitle] = React.useState(searchTitle);
  const [category, setCategory] = React.useState('speaking');

  const BCrumb = [
    { to: 'dashboard', title: 'Dashboard' },
    { to: 'mockTest/List', title: 'MocK Test' },
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedTitle(searchTitle), 500);
    return () => clearTimeout(timer);
  }, [searchTitle]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCategory(newValue);
  };

  return (
    <PageContainer
      title={'MocK Test'}
      description={`{"MocK Test"} interface with different views`}
    >
      <Breadcrumb title={'MocK Test'} />

      <Box mb={4}>
        <BlankCard>
          <Box px={3} py={2}>
            <Stack
              direction='row'
              alignItems='center'
              spacing={1}
              sx={{
                width: { xs: '100%', sm: '50%' }, // ✅ Full width on mobile
                overflowX: 'auto', // ✅ Allow horizontal scroll if needed
              }}
            >
              {/* Tabs Section */}
              <Tabs
                value={category}
                onChange={handleTabChange}
                aria-label='Mock Test Tabs'
                variant="scrollable" // ✅ Helps on mobile
              >
                <Tab value='speaking' label='Speaking' />
                <Tab value='writing' label='Writing' />
                <Tab value='reading' label='Reading' />
                <Tab value='listening' label='Listening' />
                <Tab value='full' label='All Categories' />
              </Tabs>
            </Stack>
          </Box>
        </BlankCard>
      </Box>

      <BaseCard title={'MocK Test'}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            mb: '10px',
            gap: 2,
            '@media (max-width: 600px)': {
              '& > *': { width: '100%' },
              '& .MuiFormControl-root': { width: '100%' },
              '& .MuiBox-root': { flexDirection: 'column', gap: 1 },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <FormControl sx={{ minWidth: 300 }} size='small'>
              <Typography sx={{ color: 'black', mb: '8px' }}>Search</Typography>
              <TextField
                variant='outlined'
                placeholder='Search by MockTest Title'
                size='small'
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '100%' }}
              />
            </FormControl>
          </Box>
        </Box>
        <TableList category={category} title={debouncedTitle} />
      </BaseCard>
    </PageContainer>
  );
};

export default QuestionListInterface;
