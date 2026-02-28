import 'dart:async';

import 'package:get/get.dart';

import '../models/mock_test_models.dart';
import '../services/mock_test_service.dart';

class MockTestController extends GetxController {
  MockTestController({required this.service});

  final MockTestService service;

  final RxBool loading = true.obs;
  final RxBool finalSubmitted = false.obs;
  final RxBool paused = false.obs;

  final RxInt questionIndex = 0.obs;
  final RxInt secondsRemaining = 0.obs;

  final RxList<MockQuestion> questions = <MockQuestion>[].obs;
  final RxMap<String, MockAnswer> answers = <String, MockAnswer>{}.obs;
  final Rxn<MockResult> result = Rxn<MockResult>();

  Timer? _timer;

  MockQuestion? get currentQuestion =>
      questions.isEmpty ? null : questions[questionIndex.value];

  bool get isLastQuestion => questionIndex.value == questions.length - 1;

  Future<void> initTest(String mockTestId) async {
    loading.value = true;
    await service.startMockTest(mockTestId);
    questions.assignAll(await service.fetchMockQuestions(mockTestId));
    if (questions.isNotEmpty) {
      secondsRemaining.value = questions.first.seconds;
      _startTimer();
    }
    loading.value = false;
  }

  void togglePause() {
    paused.toggle();
  }

  Future<void> saveCurrentAnswer({
    String text = '',
    String? singleChoice,
    List<String> multipleChoice = const <String>[],
    String? audioFilePath,
  }) async {
    final MockQuestion? q = currentQuestion;
    if (q == null) return;

    final MockAnswer answer = MockAnswer(
      questionId: q.id,
      text: text,
      singleChoice: singleChoice,
      multipleChoice: multipleChoice,
      audioFilePath: audioFilePath,
    );

    answers[q.id] = answer;
    await service.saveAnswer(answer);
  }

  Future<void> saveAndNext({
    String text = '',
    String? singleChoice,
    List<String> multipleChoice = const <String>[],
    String? audioFilePath,
  }) async {
    await saveCurrentAnswer(
      text: text,
      singleChoice: singleChoice,
      multipleChoice: multipleChoice,
      audioFilePath: audioFilePath,
    );

    if (isLastQuestion) {
      await submitFinal();
      return;
    }

    questionIndex.value += 1;
    secondsRemaining.value = currentQuestion!.seconds;
  }

  Future<void> submitFinal() async {
    if (finalSubmitted.value) return;
    finalSubmitted.value = true;
    _timer?.cancel();
    result.value = await service.submitMockTest(answers);
    Get.offNamed('/mock-test-result');
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer timer) async {
      if (paused.value || finalSubmitted.value) return;

      if (secondsRemaining.value > 0) {
        secondsRemaining.value -= 1;
      } else {
        await submitFinal();
      }
    });
  }

  @override
  void onClose() {
    _timer?.cancel();
    super.onClose();
  }
}
