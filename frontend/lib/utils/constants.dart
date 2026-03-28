import 'package:flutter/material.dart';

class AppConstants {
  static const Color primaryColor = Color(0xFF2E7D32);
  static const String appName = 'AgriAssist AI';
  
  // API Endpoints
  static const String baseUrl = 'https://your-backend.run.app/api';
  static const String detectEndpoint = '$baseUrl/disease/detect';
  static const String historyEndpoint = '$baseUrl/disease/history';
}
