import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/diagnosis.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<List<Diagnosis>> getHistory(String userId) {
    return _db
        .collection('diagnoses')
        .where('userId', '==', userId)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Diagnosis.fromJson({...doc.data(), 'id': doc.id}))
            .toList());
  }
}
