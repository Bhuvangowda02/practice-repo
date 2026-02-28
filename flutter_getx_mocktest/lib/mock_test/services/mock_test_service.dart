import '../models/mock_test_models.dart';

abstract class MockTestService {
  Future<List<MockQuestion>> fetchMockQuestions(String mockTestId);
  Future<void> startMockTest(String mockTestId);
  Future<void> saveAnswer(MockAnswer answer);
  Future<MockResult> submitMockTest(Map<String, MockAnswer> answers);
}

class InMemoryMockTestService implements MockTestService {
  @override
  Future<List<MockQuestion>> fetchMockQuestions(String mockTestId) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));

    return <MockQuestion>[
      MockQuestion(
        id: 'q1',
        section: MockSection.speaking,
        type: 'Read Aloud',
        prompt: 'Read the sentence clearly: "Technology is changing education."',
        seconds: 40,
      ),
      MockQuestion(
        id: 'q2',
        section: MockSection.reading,
        type: 'Single Choice',
        prompt: 'Which word is closest to "rapid"?',
        options: <String>['Slow', 'Quick', 'Heavy', 'Dull'],
        seconds: 30,
      ),
      MockQuestion(
        id: 'q3',
        section: MockSection.writing,
        type: 'Summarize Written Text',
        prompt: 'Write 1 sentence summary for the provided paragraph.',
        seconds: 60,
      ),
    ];
  }

  @override
  Future<void> startMockTest(String mockTestId) async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
  }

  @override
  Future<void> saveAnswer(MockAnswer answer) async {
    await Future<void>.delayed(const Duration(milliseconds: 120));
  }

  @override
  Future<MockResult> submitMockTest(Map<String, MockAnswer> answers) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return MockResult(
      overall: 72,
      categoryScores: <MockSection, int>{
        MockSection.speaking: 70,
        MockSection.reading: 75,
        MockSection.writing: 69,
        MockSection.listening: 74,
      },
    );
  }
}
