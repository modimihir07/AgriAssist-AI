import 'package:flutter/material.dart';

class AppConstants {
  static const Color primaryColor = Color(0xFF2E7D32);
  static const String appName = 'AgriAssist AI';
  
  // API Endpoints - UPDATE THIS TO YOUR VERCEL URL
  static const String baseUrl = 'https://your-vercel-project.vercel.app/api';
  static const String detectEndpoint = '$baseUrl/disease/detect';
  static const String historyEndpoint = '$baseUrl/disease/history';
}
