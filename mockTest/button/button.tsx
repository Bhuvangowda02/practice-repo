import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { buttonstyle1, buttonstyle2 } from '../../praticeMaterial/constant';
import theme from '@/utils/theme';

interface ButtonGroupPageProps {
  onSubmit: () => void;
  onRestart: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPause: () => void;
  questionNo: number;
  totalQuestion: number;
  isAudioUploading: boolean;
  remainingSeconds: number;
  disableSubmit?: boolean;
  paused?: boolean;
}

const ButtonGroupPage: React.FC<ButtonGroupPageProps> = ({
  onSubmit,
  onRestart,
  onNext,
  onPrevious,
  onPause,
  questionNo,
  totalQuestion,
  isAudioUploading,
  remainingSeconds,
  disableSubmit = false,
  paused = false,
}) => {
  const [selectValue5, setSelectValue5] = useState('');

  return (
    <Box
      sx={{
        display: remainingSeconds === 0 ? 'none' : 'flex',
        flexDirection: 'column',
        gap: 2,
        marginTop: 2,
        marginBottom: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* {!(questionNo + 1 === totalQuestion) && (
            <Button
              variant='contained'
              color='primary'
              sx={buttonstyle2}
              onClick={onSubmit}
            >
              Final Submit
            </Button>
          )} */}
          {!isAudioUploading && (
            <>
              <Button
                variant='contained'
                color='success'
                sx={buttonstyle2}
                onClick={onRestart}
                disabled={disableSubmit || paused}
              >
                {questionNo + 1 === totalQuestion
                  ? 'Save & Submit'
                  : 'Save & Next'}
              </Button>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* {!(questionNo === 0) && (
            <Button variant='contained' sx={buttonstyle1} onClick={onPrevious}>
              Previous
            </Button>
          )}
          {!(questionNo + 1 === totalQuestion) && (
            <Button variant='contained' sx={buttonstyle1} onClick={onNext}>
              Next
            </Button>
          )} */}
          {!isAudioUploading && (
            <>
              <Button
                variant='contained'
                color='success'
                sx={buttonstyle2}
                onClick={onPause}
                disabled={disableSubmit}
              >
                {paused ? 'Resume'
                  : 'Pause'}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ButtonGroupPage;
