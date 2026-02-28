enum MockSection { speaking, writing, reading, listening }

class MockQuestion {
  MockQuestion({
    required this.id,
    required this.section,
    required this.type,
    required this.prompt,
    this.seconds = 45,
    this.options = const [],
  });

  final String id;
  final MockSection section;
  final String type;
  final String prompt;
  final int seconds;
  final List<String> options;
}

class MockAnswer {
  MockAnswer({
    required this.questionId,
    this.text = '',
    this.singleChoice,
    this.multipleChoice = const [],
    this.audioFilePath,
  });

  final String questionId;
  final String text;
  final String? singleChoice;
  final List<String> multipleChoice;
  final String? audioFilePath;

  MockAnswer copyWith({
    String? text,
    String? singleChoice,
    List<String>? multipleChoice,
    String? audioFilePath,
  }) {
    return MockAnswer(
      questionId: questionId,
      text: text ?? this.text,
      singleChoice: singleChoice ?? this.singleChoice,
      multipleChoice: multipleChoice ?? this.multipleChoice,
      audioFilePath: audioFilePath ?? this.audioFilePath,
    );
  }
}

class MockResult {
  MockResult({
    required this.overall,
    required this.categoryScores,
  });

  final int overall;
  final Map<MockSection, int> categoryScores;
}
