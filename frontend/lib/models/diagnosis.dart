class Diagnosis {
  final String id;
  final String plantType;
  final String disease;
  final double confidence;
  final List<String> remedies;
  final List<String> prevention;
  final DateTime timestamp;

  Diagnosis({
    required this.id,
    required this.plantType,
    required this.disease,
    required this.confidence,
    required this.remedies,
    required this.prevention,
    required this.timestamp,
  });

  factory Diagnosis.fromJson(Map<String, dynamic> json) {
    return Diagnosis(
      id: json['id'] ?? '',
      plantType: json['plantType'] ?? 'Unknown',
      disease: json['disease'] ?? 'Healthy',
      confidence: (json['confidence'] ?? 0.0).toDouble(),
      remedies: List<String>.from(json['remedies'] ?? []),
      prevention: List<String>.from(json['prevention'] ?? []),
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'plantType': plantType,
      'disease': disease,
      'confidence': confidence,
      'remedies': remedies,
      'prevention': prevention,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
