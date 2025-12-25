<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SurveyController extends Controller
{
    private $questions = [
        ["id" => 1, "text" => "How often do you feel overwhelmed by your workload?"],
        ["id" => 2, "text" => "Do you feel your work is recognized and appreciated?"],
        ["id" => 3, "text" => "How would you rate your work-life balance?"],
        ["id" => 4, "text" => "Do you have clear goals and objectives for your work?"],
        ["id" => 5, "text" => "How often do you feel physical fatigue at the end of the day?"],
    ];

    public function getQuestions()
    {
        return response()->json($this->questions);
    }

    public function submitResponse(Request $request)
    {
        $answers = $request->input('answers');
        $analysis = $this->mockAiAnalysis($answers);

        return response()->json([
            'status' => 'success',
            'data' => $analysis
        ]);
    }

    private function mockAiAnalysis($answers)
    {
        $totalScore = 0;
        foreach ($answers as $a) {
            $totalScore += $a['score'];
        }
        
        $avg = count($answers) > 0 ? $totalScore / count($answers) : 0;

        if ($avg < 2.5) {
            return [
                'score' => $avg,
                'risk' => 'High',
                'summary' => 'Signs of burnout detected.',
                'recommendations' => ['Take a break.', 'Talk to HR.']
            ];
        } elseif ($avg < 4.0) {
             return [
                'score' => $avg,
                'risk' => 'Medium',
                'summary' => 'Moderate stress levels.',
                'recommendations' => ['Balance workload.', 'Exercise.']
            ];
        } else {
             return [
                'score' => $avg,
                'risk' => 'Low',
                'summary' => 'Good well-being state.',
                'recommendations' => ['Keep it up!']
            ];
        }
    }
}
