import 'package:flutter/material.dart';
import '../models/diagnosis.dart';

class DiagnosisCard extends StatelessWidget {
  final Diagnosis diagnosis;
  final VoidCallback onTap;

  const DiagnosisCard({
    super.key,
    required this.diagnosis,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: diagnosis.disease == 'Healthy' ? Colors.green : Colors.red,
          child: Icon(
            diagnosis.disease == 'Healthy' ? Icons.check : Icons.warning,
            color: Colors.white,
          ),
        ),
        title: Text(diagnosis.plantType),
        subtitle: Text(diagnosis.disease),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}
