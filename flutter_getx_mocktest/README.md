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
