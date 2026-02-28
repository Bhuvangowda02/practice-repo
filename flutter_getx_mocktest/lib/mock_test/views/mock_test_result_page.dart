import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/mock_test_controller.dart';
import '../models/mock_test_models.dart';

class MockTestResultPage extends GetView<MockTestController> {
  const MockTestResultPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mock Test Result')),
      body: Obx(() {
        final MockResult? result = controller.result.value;
        if (result == null) {
          return const Center(child: Text('Result is processing...'));
        }

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text('Overall: ${result.overall}',
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 16),
              ...MockSection.values.map(
                (MockSection section) => ListTile(
                  title: Text(section.name.toUpperCase()),
                  trailing: Text('${result.categoryScores[section] ?? '--'}'),
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Get.offAllNamed('/mock-test'),
                  child: const Text('Take Again'),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
