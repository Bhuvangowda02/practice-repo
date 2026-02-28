'use client';

import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  Stack,
  TableFooter,
  IconButton,
} from '@mui/material';
import {
  fetchMocktests,
  getLastMocktestQuestionAnswer,
  getUserLastMocktestQuestionAnswer,
} from '../../../services/mocktestAPI';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppState, RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useDialog } from '@/app/context/DialogContext';
import UserMetricDialog from '@/app/components/shared/UserMetricDialog';
import SnackBar, { SnackBarProps } from '../../layout/shared/snackbar/SnackBar';
import Loading from '@/app/(Layout)/layout/shared/Loader/loading';
import { useMockPopupHandler } from '@/app/components/result/mock/useMockPopupHandler';

interface TableListProps {
  category?: string | null;
  title?: string;
}

interface Mocktest {
  _id: string;
  title: string;
  duration: string;
  description: string;
  open: string;
  category: string;
  mocktestCount: number;
}

const TableList: React.FC<TableListProps> = ({ category, title }) => {
  const { showDialog } = useDialog();
  const [rows, setRows] = useState<Mocktest[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const initialRender = useRef(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userMetricDialogOpen, setUserMetricDialogOpen] = useState(false);
  const [selectedQnId, setSelectedQnId] = useState('');

  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '0', 10)
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(searchParams.get('rowsPerPage') || '10', 10)
  );

  const subscription = useSelector((state: RootState) => state.subscription);
  const userType = useSelector((state: RootState) => state.userType);
  const isFreePlan = !subscription || subscription.planName === 'Free';
  const examType = useSelector((state: AppState) => state.customizer.examType);
  const [snackBarData, setSnackBarData] = useState<SnackBarProps>({
    open: false,
    alertType: 'success', // Default type
    alertTitle: '',
    alertMessage: '',
  });
  const { prepareAndDisplayMockPopup } = useMockPopupHandler();
  const handleSnackBarClose = () => {
    setSnackBarData((prev) => ({ ...prev, open: false }));
  };

  const handleNavigation = (_id: string, category?: string) => async () => {
    if (category && category === 'full') {
      router.push(`/mockTest/full?id=${_id}`);
    } else {
      router.push(`/mockTest?id=${_id}`);
    }
  };

  const handleUserMetricsClick = async (id: string) => {
    setSelectedQnId(id);
    setUserMetricDialogOpen(true);
  };

  const handleUserMetricsSubmit = async (email: string) => {
    setLoading(true);
    try {
      const res = await getUserLastMocktestQuestionAnswer(selectedQnId, email);
      let dialog = 'mock';
      if (res.result?.mocktestId?.category === 'full') {
        dialog = 'full-mock';
      }
      showDialog(dialog, {
        title: `Mocktest Report - ${res?.result?.mocktestId?.title} - ${email}`,
        content:
          res.result?.result && res.answers
            ? { mockResult: res.result.result, mockAnswers: res.answers }
            : null,
      });
      setUserMetricDialogOpen(false);
    } catch (error: any) {
      console.error('Error fetching details:', error);
      setSnackBarData({
        open: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage:
          error?.response?.data?.message || 'Error fetching user metrics.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (id: string, title: string) => {
    // console.log('handleViewClick');
    setLoading(true);
    try {
      const res = await getLastMocktestQuestionAnswer(id);
      prepareAndDisplayMockPopup(
        res,
        null,
        'hide',
        '',
        null,
        'show',
        `Mocktest Report - ${title}`
      );
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTableData = async () => {
      setLoading(true);
      try {
        const filter = { category, title, examType };
        const { total, data } = await fetchMocktests(
          undefined,
          page * rowsPerPage,
          rowsPerPage,
          filter
        );
        setRows(data);
        setTotalRows(total);
      } catch (error) {
        console.error('Failed to load table data', error);
      } finally {
        setLoading(false);
      }
    };

    loadTableData();
  }, [page, rowsPerPage, category, title, examType]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set('rowsPerPage', newRowsPerPage.toString());
    params.set('page', '0');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <TableContainer>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 100,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='h6'>Sn No.</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='h6'>Title</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='h6'>Duration</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='h6'>Open</Typography>
                </TableCell>
                {userType === 'admin' && (
                  <TableCell>
                    <Typography variant='h6'>User Metrics</Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant='h6'>Metrics</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const isRestricted = isFreePlan; // Restrict Free users
                const isAdminUser = userType === 'admin';
                return (
                  <TableRow key={row._id}>
                    <TableCell>
                      <Typography variant='subtitle2'>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Typography variant='subtitle2' fontWeight='600'>
                          {row.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Typography variant='subtitle2' fontWeight='600'>
                          {row.duration}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {!isRestricted ? (
                        <Typography
                          component='a'
                          onClick={handleNavigation(row._id, row.category)}
                          variant='subtitle2'
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            cursor: 'pointer',
                          }}
                        >
                          {row.open || 'Start Now'}
                        </Typography>
                      ) : (
                        <Typography
                          variant='subtitle2'
                          sx={{ color: 'gray', cursor: 'default' }}
                        >
                          🔒 Locked (Upgrade Required){' '}
                        </Typography>
                      )}
                    </TableCell>
                    {isAdminUser && (
                      <TableCell>
                        <IconButton
                          onClick={() => handleUserMetricsClick(row._id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    )}
                    <TableCell align='center'>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <IconButton
                          onClick={() => handleViewClick(row._id, row.title)}
                          disabled={row.mocktestCount === 0}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {row.mocktestCount}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 30, 40, 50]}
                  count={totalRows}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </TableContainer>
      <UserMetricDialog
        open={userMetricDialogOpen}
        onClose={() => setUserMetricDialogOpen(false)}
        onSubmit={handleUserMetricsSubmit}
      />
      {loading ? <Loading /> : <></>}
      <SnackBar
        open={snackBarData.open}
        alertType={snackBarData.alertType}
        alertTitle={snackBarData.alertTitle}
        alertMessage={snackBarData.alertMessage}
        onClose={handleSnackBarClose}
      />
    </>
  );
};

export default TableList;
