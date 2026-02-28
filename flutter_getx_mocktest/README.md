# Mock Test (Flutter + GetX) conversion starter

This folder contains a **drop-in starter** to convert your web `mockTest` flow to Flutter with GetX.

## What is included

- `models/mock_test_models.dart`
  - Question, Answer, Result models
- `services/mock_test_service.dart`
  - API contract + in-memory sample implementation
- `controllers/mock_test_controller.dart`
  - Timer, pause/resume, save-next, final submit logic
- `views/mock_test_page.dart`
  - Question screen (`Save & Next`, `Pause`, timer)
- `views/mock_test_result_page.dart`
  - Result screen with overall + section scores
- `mock_test_module.dart`
  - GetX binding + routes

## Quick integration

1. Copy `flutter_getx_mocktest/lib/mock_test` into your Flutter app's `lib/` folder.
2. Add dependency:

```yaml
dependencies:
  get: ^4.6.6
```

3. Register routes in your `GetMaterialApp`:

```dart
GetMaterialApp(
  initialRoute: '/mock-test',
  getPages: <GetPage<dynamic>>[
    ...MockTestRoutes.pages,
  ],
)
```

4. Replace `InMemoryMockTestService` with your real API service.


## Integrate into an existing `AppPages` / `app_routes.dart` setup

If your app already uses a central routing file (like your `AppPages` example), add Mock Test in **three places**.

### 1) Add imports in `app_pages.dart`

```dart
import '../modules/mock_test/bindings/mock_test_binding.dart';
import '../modules/mock_test/views/mock_test_list_view.dart';
```

> Use your actual file names. If you only have one screen, point it to that view.

### 2) Add route constants in `app_routes.dart`

```dart
abstract class Routes {
  // ...existing routes
  static const mockTestList = _Paths.mockTestList;
}

abstract class _Paths {
  // ...existing paths
  static const mockTestList = '/mock-test-list';
}
```

### 3) Register `GetPage` in `AppPages.routes`

```dart
GetPage(
  name: _Paths.mockTestList,
  page: () => const MockTestListView(),
  binding: MockTestBinding(),
),
```

After this, your dashboard call will work:

```dart
Get.toNamed(Routes.mockTestList);
```

### Optional: include the full flow (test + result)

If you want both pages from this starter module, you can also merge these routes:

- `/mock-test` -> `MockTestPage`
- `/mock-test/result` -> `MockTestResultPage`

You can either:
- manually add them in your existing `AppPages.routes`, or
- spread `MockTestRoutes.pages` directly into `getPages`.

## Mapping from your website flow

- Website `Save & Next` / `Save & Submit` -> `controller.saveAndNext(...)`
- Website Pause button -> `controller.togglePause()`
- Website auto-submit on timer end -> `submitFinal()` triggered when seconds reach 0
- Website result cards -> `MockTestResultPage` list tiles

## Next steps for production

- Wire backend DTO parsing (`fromJson/toJson`)
- Add per-question widgets for speaking/reading/writing/listening types
- Add local persistence for in-progress test
- Add audio recording/upload handling in `saveCurrentAnswer`
