import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/mock_test_controller.dart';
import '../models/mock_test_models.dart';

class MockTestPage extends GetView<MockTestController> {
  const MockTestPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mock Test')),
      body: Obx(() {
        if (controller.loading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final MockQuestion? q = controller.currentQuestion;
        if (q == null) {
          return const Center(child: Text('No questions found.'));
        }

        final TextEditingController textCtrl = TextEditingController();
        final RxString selectedOption = ''.obs;

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Text(
                    'Question ${controller.questionIndex.value + 1}/${controller.questions.length}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('Time: ${controller.secondsRemaining.value}s'),
                ],
              ),
              const SizedBox(height: 12),
              Text('${q.section.name.toUpperCase()} • ${q.type}'),
              const SizedBox(height: 8),
              Text(q.prompt),
              const SizedBox(height: 16),
              if (q.options.isNotEmpty)
                Obx(
                  () => Column(
                    children: q.options
                        .map(
                          (String option) => RadioListTile<String>(
                            value: option,
                            groupValue: selectedOption.value,
                            onChanged: (String? value) {
                              selectedOption.value = value ?? '';
                            },
                            title: Text(option),
                          ),
                        )
                        .toList(),
                  ),
                )
              else
                TextField(
                  controller: textCtrl,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Write your answer...',
                  ),
                ),
              const Spacer(),
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: controller.togglePause,
                      child: Obx(
                        () => Text(controller.paused.value ? 'Resume' : 'Pause'),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        await controller.saveAndNext(
                          text: textCtrl.text,
                          singleChoice: selectedOption.value.isEmpty
                              ? null
                              : selectedOption.value,
                        );
                      },
                      child: Obx(
                        () => Text(
                          controller.isLastQuestion
                              ? 'Save & Submit'
                              : 'Save & Next',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }
}
