import { db } from '../config/firebase.js';

export const getProfile = async (req, res) => {
  const userId = req.user.uid;
  try {
    if (!db) {
      return res.json({ name: 'Mock User', email: 'test@example.com', role: 'Farmer' });
    }
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.uid;
  const updates = req.body;
  try {
    if (!db) {
      return res.json({ message: 'Profile updated successfully (Mock)' });
    }
    await db.collection('users').doc(userId).set(updates, { merge: true });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
