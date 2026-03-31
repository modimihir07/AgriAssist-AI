import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import '../models/diagnosis.dart';
import '../utils/constants.dart';

class ApiService {
  static const String baseUrl = AppConstants.baseUrl;

  Future<Diagnosis> detectDisease(File image) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw Exception('User not logged in');

    final idToken = await user.getIdToken();
    final bytes = await image.readAsBytes();
    final base64Image = base64Encode(bytes);

    final response = await http.post(
      Uri.parse('$baseUrl/disease/detect'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode({
        'imageBase64': base64Image,
        'location': {'lat': 0, 'lng': 0}, // Mock location
      }),
    );

    if (response.statusCode == 200) {
      return Diagnosis.fromJson(jsonDecode(response.body));
    } else {
      final error = jsonDecode(response.body)['error'] ?? 'Failed to detect disease';
      throw Exception(error);
    }
  }
}
