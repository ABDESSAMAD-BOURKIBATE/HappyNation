import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SurveyController extends GetxController {
  var isLoading = false.obs;
  var currentQuestionIndex = 0.obs;
  var answers = <Map<String, dynamic>>[].obs;
  var analysisResult = {}.obs;

  final questions = [
    {"id": 1, "text": "How often do you feel overwhelmed by your workload?"},
    {"id": 2, "text": "Do you feel your work is recognized and appreciated?"},
    {"id": 3, "text": "How would you rate your work-life balance?"},
    {"id": 4, "text": "Do you have clear goals and objectives for your work?"},
    {"id": 5, "text": "How often do you feel physical fatigue at the end of the day?"},
  ];

  void answerQuestion(int questionId, int score) {
    answers.add({"question_id": questionId, "score": score});
    if (currentQuestionIndex.value < questions.length - 1) {
      currentQuestionIndex.value++;
    } else {
      submitSurvey();
    }
  }

  Future<void> submitSurvey() async {
    isLoading.value = true;
    
    // Simulate API Call delay
    await Future.delayed(const Duration(seconds: 2));

    try {
      // In real app: 
      // var response = await http.post(Uri.parse('http://localhost:8000/api/v1/submit'), body: json.encode({'answers': answers}));
      
      // Mock Response Logic (mirroring backend for demo)
      double total = 0;
      for (var a in answers) {
        total += a['score'];
      }
      double avg = total / answers.length;
      
      analysisResult.value = {
        'score': avg.toStringAsFixed(1),
        'risk': avg < 2.5 ? 'High' : (avg < 4 ? 'Medium' : 'Low'),
        'summary': avg < 2.5 
            ? 'Start showing signs of burnout.' 
            : 'You are maintaining a good balance.',
      };

      Get.offNamed('/result');

    } catch (e) {
      Get.snackbar('Error', 'Failed to submit survey');
    } finally {
      isLoading.value = false;
    }
  }
}
