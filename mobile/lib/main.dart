import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'controllers/survey_controller.dart';
import 'controllers/survey_controller.dart';
import 'screens/screens.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Happynation',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Roboto',
        useMaterial3: true,
      ),
      initialRoute: '/',
      getPages: [
        GetPage(name: '/', page: () => const LoginScreen()),
        GetPage(name: '/survey', page: () => const SurveyScreen(), binding: SurveyBinding()),
        GetPage(name: '/result', page: () => const ResultScreen()),
      ],
    );
  }
}

class SurveyBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => SurveyController());
  }
}
