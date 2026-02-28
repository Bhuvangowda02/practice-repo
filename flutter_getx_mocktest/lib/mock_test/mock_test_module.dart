import 'package:get/get.dart';

import 'controllers/mock_test_controller.dart';
import 'services/mock_test_service.dart';
import 'views/mock_test_page.dart';
import 'views/mock_test_result_page.dart';

class MockTestBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MockTestService>(() => InMemoryMockTestService());
    Get.put<MockTestController>(
      MockTestController(service: Get.find<MockTestService>())
        ..initTest('demo-mock-test-1'),
      permanent: true,
    );
  }
}

class MockTestRoutes {
  static List<GetPage<dynamic>> pages = <GetPage<dynamic>>[
    GetPage<dynamic>(
      name: '/mock-test',
      page: () => const MockTestPage(),
      binding: MockTestBinding(),
    ),
    GetPage<dynamic>(
      name: '/mock-test-result',
      page: () => const MockTestResultPage(),
    ),
  ];
}
