import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/survey_controller.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate-50 equivalent
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          onPressed: () {}, // No-op for demo or Get.back()
          color: Colors.grey[400],
        ),
        title: Text("Back", style: TextStyle(color: Colors.grey[400], fontSize: 16, fontWeight: FontWeight.bold)),
        titleSpacing: 0,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            const Text(
              "Welcome",
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 8),
            Text(
              "Please enter your credentials to continue.",
              style: TextStyle(fontSize: 16, color: Colors.grey[500]),
            ),
            const SizedBox(height: 40),

            // Email Field
            Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    Text("EMAIL ADDRESS", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500])),
                    const SizedBox(height: 8),
                    TextField(
                        decoration: InputDecoration(
                            hintText: "name@company.com",
                            hintStyle: TextStyle(color: Colors.grey[400]),
                            filled: true,
                            fillColor: const Color(0xFFF1F5F9), // Slate-100
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        ),
                    ),
                ]
            ),
            const SizedBox(height: 24),

            // Unique Employee Code Field (Requested)
            Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    Text("UNIQUE EMPLOYEE CODE", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500])),
                    const SizedBox(height: 8),
                    TextField(
                        decoration: InputDecoration(
                            hintText: "e.g. EMP-2024-X99",
                            hintStyle: TextStyle(color: Colors.grey[400]),
                            filled: true,
                            fillColor: const Color(0xFFF1F5F9),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                            suffixIcon: const Icon(Icons.badge_outlined, color: Colors.grey),
                        ),
                    ),
                ]
            ),
            const SizedBox(height: 24),

            // Password Field
             Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    Text("PASSWORD", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500])),
                    const SizedBox(height: 8),
                    TextField(
                        obscureText: true,
                        decoration: InputDecoration(
                            hintText: "••••••••",
                            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 24, letterSpacing: 2),
                            filled: true,
                            fillColor: const Color(0xFFF1F5F9),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        ),
                    ),
                ]
            ),

            const SizedBox(height: 40),
            
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Get.toNamed('/survey'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1), // Indigo-500
                  elevation: 4,
                  shadowColor: const Color(0xFF6366F1).withOpacity(0.4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                        Text("Sign In", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white)
                    ]
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class SurveyScreen extends GetView<SurveyController> {
  const SurveyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Well-Being Assessment")),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        var question = controller.questions[controller.currentQuestionIndex.value];

        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Question ${controller.currentQuestionIndex.value + 1}/${controller.questions.length}",
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 20),
              Text(
                question["text"] as String,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              _buildOption(context, 1, "Never"),
              _buildOption(context, 2, "Rarely"),
              _buildOption(context, 3, "Sometimes"),
              _buildOption(context, 4, "Often"),
              _buildOption(context, 5, "Always"),
              const Spacer(),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildOption(BuildContext context, int score, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: OutlinedButton(
          onPressed: () => controller.answerQuestion(controller.questions[controller.currentQuestionIndex.value]['id'] as int, score),
          style: OutlinedButton.styleFrom(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text(label),
        ),
      ),
    );
  }
}

class ResultScreen extends GetView<SurveyController> {
  const ResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    var result = controller.analysisResult;
    Color color = result['risk'] == 'High' ? Colors.red : (result['risk'] == 'Medium' ? Colors.orange : Colors.green);

    return Scaffold(
      appBar: AppBar(title: const Text("Your Diagnosis")),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
             Card(
               elevation: 4,
               shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
               child: Padding(
                 padding: const EdgeInsets.all(24.0),
                 child: Column(
                   children: [
                     Text("Well-Being Score", style: TextStyle(fontSize: 18, color: Colors.grey[600])),
                     Text(
                       result['score'], 
                       style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: color)
                     ),
                     const SizedBox(height: 10),
                     Container(
                       padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                       decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                       child: Text("Risk Level: ${result['risk']}", style: TextStyle(color: color, fontWeight: FontWeight.bold)),
                     )
                   ],
                 ),
               ),
             ),
             const SizedBox(height: 30),
             const Text("AI Analysis & Recommendations", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
             const SizedBox(height: 10),
             Text(result['summary'], style: const TextStyle(fontSize: 16)),
             const SizedBox(height: 20),
             SizedBox(
               width: double.infinity,
               child: ElevatedButton(
                 onPressed: () => Get.offAllNamed('/'),
                 child: const Text("Done"),
               ),
             )
          ],
        ),
      ),
    );
  }
}
