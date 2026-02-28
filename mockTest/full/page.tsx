'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import { FaClock, FaPause } from 'react-icons/fa';

import PageContainer from '@/app/components/container/PageContainer';
import MaterialCard from '../../praticeMaterial/component/MaterialCard';
import ButtonGroupPage from '../button/button';
import SnackBar, { SnackBarProps } from '../../layout/shared/snackbar/SnackBar';
import Loading from '../../layout/shared/Loader/loading';
import {
  getMockTestDetails,
  initiateAnswer,
  startMockTest,
} from '../../../services/mocktestAPI';
// import { getQuestionDetails } from '../../../services/practiceAPI';
import { saveAnswer } from '../../../services/mocktestAPI';
import { uploadAudioFile } from '../../../services/uploadAPI';

// Speaking
import ReadAloud from '../../question/speaking/components/read-aloud';
import RepeatSentence from '../../question/speaking/components/repeat-sentence';
import DescribeImage from '../../question/speaking/components/desc-image';
import ReTellLecture from '../../question/speaking/components/retell-lecture';
import AnswerShortQuestion from '../../question/speaking/components/ans-short-qn';
import SummariseGroupDiscussion from '../../question/speaking/components/summarise-group-discussion';

// Reading
import ReadFillBlankMultiple from '../../question/reading/components/read-fill-blank-multiple';
import ReadFillBlank from '../../question/reading/components/read-fill-blank';
import ReorderPara from '../../question/reading/components/reorder-para';
import MultiTypeSingleAnswer from '../../question/reading/components/multiple-type-single-answer';
import MultiTypeMultipleAnswer from '../../question/reading/components/multiple-type-multiple-answer';

// Writing
import Summarize from '../../question/writing/components/summarise';
import Essay from '../../question/writing/components/essay';
import Email from '../../question/writing/components/email';

// Listening
import SummarizeSpokenText from '../../question/listening/components/summarise-spoken-text';
import McqSingleAnswer from '../../question/listening/components/mcq-single-answer';
import McqMultipleAnswer from '../../question/listening/components/mcq-multiple-answer';
import ListenFillBlanks from '../../question/listening/components/listen-fill-blank';
import HighlightCorrecrSummary from '../../question/listening/components/highlight-correct.summary';
import SelectMissingWord from '../../question/listening/components/select-missing-word';
import HighlightincorrectWord from '../../question/listening/components/highlight-incorrect-word';
import WriteFromDictation from '../../question/listening/components/write-from-dictation';
import RespondSituation from '../../question/speaking/components/resp-situation';

import { useDialog } from '@/app/context/DialogContext';
import { useMockTest } from '@/app/context/MockTestContext';
import { preloadAudios, clearAudioCache } from '@/app/services/downloadAPI';

type ExamType = 'academic' | 'core';
type Section = 'speaking' | 'reading' | 'listening' | 'writing';
type CategoryStatus = 'not_started' | 'in_progress' | 'completed';

const initialStatus: Record<Section, CategoryStatus> = {
  speaking: 'not_started',
  reading: 'not_started',
  listening: 'not_started',
  writing: 'not_started',
};
const SECTION_TIMINGS: Record<ExamType, Record<Section, number>> = {
  academic: {
    speaking: 35 * 60,
    reading: 30 * 60,
    listening: 27 * 60,
    writing: 40 * 60,
  },
  core: {
    speaking: 25 * 60,
    reading: 30 * 60,
    listening: 27 * 60,
    writing: 29 * 60,
  },
};

const MockTestPage = () => {
  const { showDialog } = useDialog();
  const { mockTestStarted, setMockTestStarted } = useMockTest();
  const [color, setColor] = useState<string>('default');
  const [seconds, setSeconds] = useState<number>(60);
  const [overallSeconds, setOverallSeconds] = useState<number>(0);
  const [paused, setPaused] = useState(false);
  const [categorySubmitted, setCategorySubmitted] = useState(false);
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [isFinalSubmit, setIsFinalSubmit] = useState<boolean>(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackBarData, setSnackBarData] = useState<SnackBarProps>({
    open: false,
    alertType: 'success', // Default type
    alertTitle: '',
    alertMessage: '',
  });
  const handleSnackBarClose = () => {
    setSnackBarData((prev) => ({ ...prev, open: false }));
  };

  const [questionNo, setQuestionNo] = useState<number>(0);
  const questionNoRef = useRef(questionNo);
  const [questionAnswer, setQuestionAnswer] = useState<any>([]);
  const [questionData, setQuestionData] = useState<any>(null);
  const [mocktestData, setMocktestData] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  // const [currentCategoryStatus, setCurrentCategoryStatus] = useState<string>('');
  const [categoryStatus, setCategoryStatus] = useState(initialStatus);
  const categoryStatusRef = useRef(categoryStatus);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [textFieldValue, setTextFieldValue] = useState<string>('');
  const [reset, setReset] = useState(false);
  const [restartKey, setRestartKey] = useState(0); // Unique key to remount the page
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const router = useRouter();

  const [payload, setPayload] = useState({
    userId: '',
    mocktestResultId: '',
    mocktestId: '',
    questionId: '',
    subCategory: '',
    answer: { content: '', singleChoice: [], multipleChoice: [] },
    audioFilePath: '',
    imageFilePath: '',
  });

  useEffect(() => {
    categoryStatusRef.current = categoryStatus;
  }, [categoryStatus]);

  useEffect(() => {
    questionNoRef.current = questionNo;
  }, [questionNo]);

  useEffect(() => {
    if (!finalSubmitted && !paused) {
      const timer = setInterval(() => {
        setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setOverallSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [finalSubmitted, paused]);

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  useEffect(() => {
    //seconds - category level seconds like speaking, reading, writing, listening
    //overallSeconds - full mock test seconds
    if (seconds === 0 && !finalSubmitted && !categorySubmitted) {
      setCategorySubmitted(true);
      const timesUp = async () => {
        setCategoryStatus((prev) => ({
          ...prev,
          [currentCategory]: 'completed',
        }));
        if (overallSeconds > 0) {
          if (questionNoRef.current + 1 === mocktestData?.Questions?.length) {
            handleFinalSubmit();
          } else {
            saveAnswer(payload);
            fetchNextQuestion();
          }
        } else {
          handleFinalSubmit();
        }
      };
      timesUp();
    }
  }, [seconds, finalSubmitted, overallSeconds, payload]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const fetchMocktestDetails = async () => {
      if (id) {
        try {
          setLoading(true);
          const mockTestResult = await startMockTest(id);
          setMockTestStarted(true);
          const responseData = await getMockTestDetails(id);
          setMocktestData(responseData);
          preloadAudios(responseData.questionAudios || []);
          // const response = await getQuestionDetails(responseData?.Questions[0]);
          const response = await initiateAnswer({
            mocktestId: responseData._id,
            mocktestResultId: mockTestResult.id,
            questionId: responseData?.Questions[0],
          });
          setCurrentCategory(response.category);
          if (responseData.category !== 'full') {
            setSeconds(responseData.duration * 60);
          } else {
            setOverallSeconds(responseData.duration * 60);
            setSeconds(
              SECTION_TIMINGS[responseData.examType as ExamType][
                response.category as Section
              ]
            );
            setCategoryStatus((prev) => ({
              ...prev,
              [response.category as Section]: 'in_progress',
            }));
            // setCurrentCategoryStatus('in_progress');
          }
          setQuestionData(response);
          setQuestionNo(0);
          setPayload((prev) => ({
            ...prev,
            mocktestResultId: mockTestResult.id,
            mocktestId: responseData._id,
            questionId: response._id,
            subCategory: response.subCategory || '',
          }));
          handleSaveButton(response);
        } catch (error: any) {
          setSnackBarData({
            open: true,
            alertType: 'error',
            alertTitle: 'Error',
            alertMessage: error.message || 'Error fetching question details.',
          });
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/mockTest/List');
      }
    };
    fetchMocktestDetails();
  }, [id]);

  const handleSaveButton = (response: any) => {
    if (response?.category === 'writing' || response?.category === 'reading') {
      setDisableSubmit(false);
    } else {
      setDisableSubmit(true);
    }
  };

  const fetchQuestion = async (id: string) => {
    try {
      // console.log(` fetchQuestion mock category ${mocktestData.category} for id ${id}`);
      setLoading(true);
      // const response = await getQuestionDetails(id);
      const response = await initiateAnswer({
        mocktestId: payload.mocktestId,
        mocktestResultId: payload.mocktestResultId,
        questionId: id,
      });
      setQuestionData(response);
      if (
        mocktestData.category === 'full' &&
        currentCategory !== response.category
      ) {
        setCurrentCategory(response.category);
        setSeconds(
          SECTION_TIMINGS[mocktestData.examType as ExamType][
            response.category as Section
          ]
        );
        setCategoryStatus((prev) => ({
          ...prev,
          [response.category as Section]: 'in_progress',
        }));
      } else if (
        mocktestData.category === 'full' &&
        currentCategory === response.category &&
        categoryStatusRef.current[currentCategory as Section] === 'completed'
      ) {
        fetchNextQuestion();
        return;
      }
      setCurrentCategory(response.category);
      setTextFieldValue('');
      setPayload((prev) => ({
        ...prev,
        questionId: response._id,
        subCategory: response.subCategory || '',
        audioFilePath: '',
      }));
      
      setRestartKey((prevKey) => prevKey + 1); // Increment key to remount the component
      handleSaveButton(response);
      setCategorySubmitted(false);
      setLoading(false);
    } catch (error: any) {
      setSnackBarData({
        open: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: error.message || 'Failed to fetch question.',
      });
    } finally {
      // setLoading(false);
    }
  };

  const fetchNextQuestion = async () => {
    // console.log(` fetchNextQuestion currentquestionNo ${questionNoRef.current}`);
    if (questionNoRef.current + 1 < mocktestData?.Questions?.length) {
      const newquestionNo = questionNoRef.current + 1;
      setQuestionNo(newquestionNo);
      if (questionAnswer[newquestionNo]) {
        setQuestionData(questionAnswer[newquestionNo]?.question);
        setPayload(questionAnswer[newquestionNo]?.answer);
        return;
      } else {
        await fetchQuestion(mocktestData?.Questions[newquestionNo]);
      }
    } else {
      setSnackBarData({
        open: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: 'No next Question',
      });
      return;
    }
  };

  const fetchPreviousQuestion = async () => {
    if (questionNoRef.current - 1 >= 0) {
      const newquestionNo = questionNoRef.current - 1;
      setQuestionNo(newquestionNo);
      if (questionAnswer[newquestionNo]) {
        setQuestionData(questionAnswer[newquestionNo]?.question);
        setPayload(questionAnswer[newquestionNo]?.answer);
        return;
      } else {
        await fetchQuestion(mocktestData?.Questions[newquestionNo]);
      }
    } else {
      setSnackBarData({
        open: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: 'No Previous Question',
      });
      return;
    }
  };

  const handleListenAudioComplete = async () => {
    setDisableSubmit(false);
  };

  const handleAudioComplete = async (audioBlob: Blob, extension?: string) => {
    try {
      setIsUploading(true);
      if (audioBlob) {
        const result = await uploadAudioFile(
          audioBlob,
          questionData?.subCategory || '',
          extension || 'webm'
        );
        setPayload((prev) => ({
          ...prev,
          audioFilePath: result.data,
        }));
        setDisableSubmit(false);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (updatedValues: any) => {
    setPayload((prev) => ({
      ...prev,
      answer: { content: '', singleChoice: updatedValues, multipleChoice: [] },
    }));
  };

  const handleMultiInputChange = (updatedValues: string[]) => {
    // Clone to avoid mutation
    const remainingValues = [...updatedValues];

    const finalAnswer = questionData?.choices.map(
      (choice: { multipleChoice: string[]; orderKey: any }) => {
        const selectedValueIndex = remainingValues.findIndex((value) =>
          choice.multipleChoice.includes(value)
        );

        let selectedValue = '';
        if (selectedValueIndex !== -1) {
          selectedValue = remainingValues[selectedValueIndex];
          // Remove the used value so it doesn't get reused
          remainingValues.splice(selectedValueIndex, 1);
        }

        return { orderKey: choice.orderKey, value: selectedValue };
      }
    );

    setPayload((prev) => ({
      ...prev,
      answer: {
        content: '',
        singleChoice: [],
        multipleChoice: finalAnswer,
      },
    }));
  };

  const handleBox2Change = (items: any) => {
    let answer: any = [];
    for (let item of items) {
      answer.push(item.id);
    }
    setPayload((prev) => ({
      ...prev,
      answer: { content: '', singleChoice: answer, multipleChoice: [] },
    }));
  };

  const handleTextChange = (value: string) => {
    setTextFieldValue(value);
    setPayload((prev) => ({
      ...prev,
      answer: { content: value, singleChoice: [], multipleChoice: [] },
    }));
  };

  const handleChoiceChange = (selectedValue: string) => {
    let answer: any = [];
    answer.push(selectedValue);
    setPayload((prev) => ({
      ...prev,
      answer: { content: '', singleChoice: answer, multipleChoice: [] },
    }));
  };

  const handleSelectionChange = (selectedValue: any) => {
    setPayload((prev) => ({
      ...prev,
      answer: { content: '', singleChoice: selectedValue, multipleChoice: [] },
    }));
  };

  const handleHighlightChange = (words: any) => {
    setPayload((prev: any) => ({
      ...prev,
      answer: { content: '', singleChoice: words },
    }));
  };
  // End of Handle Input changes

  const handleRestart = () => {
    setTextFieldValue('');
  };

  // Save and Next
  const handleSave = async () => {
    if (!questionData) {
      setSnackBarData({
        open: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: 'Question data is not available',
      });
      return;
    }
    if (questionNoRef.current + 1 === mocktestData?.Questions?.length) {
      // Submit on last question
      handleFinalSubmit();
    } else {
      saveAnswer(payload);
      questionAnswer[questionNoRef.current] = {
        question: questionData,
        answer: payload,
      };
      fetchNextQuestion();
    }
  };

  const handleShowDialog = async (data: any) => {
    const confirmed = await showDialog('full-mock', {
      title: 'Result',
      content: data,
    });

    if (confirmed) {
      setMockTestStarted(false);
      router.push('/mockTest/List');
    }
  };

  const handleFinalSubmit = async () => {
    try {
      clearAudioCache();
      setLoading(true);
      setPaused(true);
      // await saveAnswer(payload);
      saveAnswer({
        ...payload,
        mocktestResultId: payload.mocktestResultId,
        category: mocktestData.category,
        lastQuestion: true,
      });
      // handleSubmit();
      handleNavigation(mocktestData.title);
    } catch (error: any) {
      setSnackBarData({
        open: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: error.message || 'Failed to submit the answer.',
      });
    }
  };

  const handleNavigation = (title: string) => {
    setMockTestStarted(false);
    router.push(`/mockTest/result?title=${title}`);
  };

  const renderSubCategoryComponent = useMemo(() => {
    switch (questionData?.subCategory) {
      //Speaaking
      case 'read-aloud':
        return (
          <ReadAloud
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      case 'repeat-sentence':
        return (
          <RepeatSentence
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      case 'desc-image':
        return (
          <DescribeImage
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      case 'retell-lecture':
        return (
          <ReTellLecture
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      case 'ans-short-qn':
        return (
          <AnswerShortQuestion
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      case 'resp-situation':
        return (
          <RespondSituation
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      case 'summarise-group-discussion':
        return (
          <SummariseGroupDiscussion
            data={questionData}
            onAudioComplete={handleAudioComplete}
            resetTrigger={handleRestart}
            recordedAudioFilePath={
              questionAnswer[questionNoRef.current]?.answer?.audioFilePath
            }
            paused={paused}
          />
        );
      //Reading
      case 'read-fill-blank':
        return (
          <ReadFillBlank
            data={questionData}
            onInputChange={handleInputChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
          />
        );
      case 'read-fill-blank-multiple':
        return (
          <ReadFillBlankMultiple
            data={questionData}
            onInputChange={handleMultiInputChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
          />
        );
      case 'reorder-para':
        return (
          <ReorderPara
            data={questionData}
            onBox2Change={handleBox2Change}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
          />
        );
      case 'multiple-type-single-answer':
        return (
          <>
            <MultiTypeSingleAnswer
              data={questionData}
              onChoiceChange={handleChoiceChange}
              storedAnswer={
                questionAnswer[questionNoRef.current]?.answer?.answer
              }
            />
          </>
        );
      case 'multiple-type-multiple-answer':
        return (
          <MultiTypeMultipleAnswer
            data={questionData}
            onSelectionChange={handleSelectionChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
          />
        );

      //Writing
      case 'summarise':
        return (
          <Summarize
            data={questionData}
            onTextChange={handleTextChange}
            textFieldValue={textFieldValue}
            onAutoSubmit={handleSave}
            paused={paused}
          />
        );
      case 'essay':
        return (
          <Essay
            data={questionData}
            onTextChange={handleTextChange}
            textFieldValue={textFieldValue}
            onAutoSubmit={handleSave}
            paused={paused}
          />
        );
      case 'email':
        return (
          <Email
            data={questionData}
            onTextChange={handleTextChange}
            textFieldValue={textFieldValue}
            onAutoSubmit={handleSave}
            paused={paused}
          />
        );

      // listening
      case 'summarise-spoken-text':
        return (
          <SummarizeSpokenText
            data={questionData}
            onTextChange={handleTextChange}
            textFieldValue={textFieldValue}
            onSpeakComplete={handleListenAudioComplete}
            onAutoSubmit={handleSave}
            paused={paused}
          />
        );
      case 'mcq-single-answer':
        return (
          <McqSingleAnswer
            data={questionData}
            onChoiceChange={handleChoiceChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );
      case 'mcq-multiple-answer':
        return (
          <McqMultipleAnswer
            data={questionData}
            onSelectionChange={handleSelectionChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );
      case 'listen-fill-blank':
        return (
          <ListenFillBlanks
            data={questionData}
            onInputChange={handleInputChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );
      case 'highlight-correct-summary':
        return (
          <HighlightCorrecrSummary
            data={questionData}
            onChoiceChange={handleChoiceChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );
      case 'select-missing-word':
        return (
          <SelectMissingWord
            data={questionData}
            onChoiceChange={handleChoiceChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );
      case 'highlight-incorrect-word':
        return (
          <HighlightincorrectWord
            data={questionData}
            onHighlightChange={handleHighlightChange}
            storedAnswer={questionAnswer[questionNoRef.current]?.answer?.answer}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );
      case 'write-from-dictation':
        return (
          <WriteFromDictation
            data={questionData}
            onTextChange={handleTextChange}
            textFieldValue={textFieldValue}
            onSpeakComplete={handleListenAudioComplete}
            paused={paused}
          />
        );

      default:
        return <></>;
    }
  }, [questionData, reset, textFieldValue, paused]);

  return (
    <PageContainer key={restartKey}>
      {/* Blur effect when loading */}
      {loading ? (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Adjust opacity as needed
            zIndex: 10,
          }}
        />
      ) : (
        <></>
      )}
      <MaterialCard>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            padding: 2,
            [theme.breakpoints.down('sm')]: {
              padding: 1,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              borderBottom: 'solid 1px',
              borderRadius: 0,
              marginBottom: '10px',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{
                fontSize: isSmallScreen ? '1rem' : '1.5rem',
                fontWeight: 'bold',
                color: '#433838',
              }}
            >
              {mocktestData?.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: isSmallScreen ? 'column' : 'row',
              }}
            >
              <Typography variant='subtitle2'>
                Question: {questionNoRef.current + 1} /{' '}
                {mocktestData?.Questions?.length}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isSmallScreen ? 'column' : 'row',
              alignItems: isSmallScreen ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: 1,
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{
                  fontSize: isSmallScreen ? '1rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: '#433838',
                }}
              >
                {questionData?.title}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexDirection: isSmallScreen ? 'column' : 'row',
              }}
            >
              {!paused ? (
                <FaClock style={{ fontSize: '1rem' }} />
              ) : (
                <FaPause style={{ fontSize: '1rem' }} />
              )}
              {mocktestData?.category === 'full' ? (
                <Typography variant='subtitle2'>
                  {capitalizeFirst(questionData?.category)} Remaining:{' '}
                  {formatTime(seconds)}
                </Typography>
              ) : (
                <Typography variant='subtitle2'>
                  Remaining: {formatTime(seconds)}
                </Typography>
              )}
            </Box>
          </Box>

          <Chip
            color='success'
            sx={{
              borderRadius: '6px',
              mt: 2,
              width: 'auto',
              maxWidth: '80px',
              textAlign: 'left',
            }}
            size='small'
            label={questionData?.complexity}
          />

          {/* Render the child component based on subCategory */}
          {renderSubCategoryComponent}
        </Box>
      </MaterialCard>

      <MaterialCard>
        <>
          {!isFinalSubmit && (
            <ButtonGroupPage
              onSubmit={handleFinalSubmit}
              onRestart={handleSave}
              onNext={fetchNextQuestion}
              onPrevious={fetchPreviousQuestion}
              onPause={togglePause}
              questionNo={questionNoRef.current}
              totalQuestion={mocktestData?.Questions?.length}
              isAudioUploading={isUploading}
              remainingSeconds={seconds}
              disableSubmit={disableSubmit}
              paused={paused}
            />
          )}
        </>
      </MaterialCard>
      {loading ? <Loading /> : <></>}
      <SnackBar
        open={snackBarData.open}
        alertType={snackBarData.alertType}
        alertTitle={snackBarData.alertTitle}
        alertMessage={snackBarData.alertMessage}
        onClose={handleSnackBarClose}
      />
    </PageContainer>
  );
};

function capitalizeFirst(text?: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

export default MockTestPage;
