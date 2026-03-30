import { auth } from '../config/firebase.js';

export const login = async (req, res) => {
  // Login is typically handled on the frontend with Firebase SDK.
  // This endpoint can be used for custom session management if needed.
  res.json({ message: 'Auth handled via Firebase ID tokens in middleware' });
};

export const logout = async (req, res) => {
  res.json({ message: 'Logout handled on client side' });
};
