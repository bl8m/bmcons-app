import argon2 from 'argon2';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from './tokenService.js';

export const hashPassword = (plainPassword) => argon2.hash(plainPassword);

export const verifyPassword = (hash, plainPassword) => argon2.verify(hash, plainPassword);

export async function login(email, password) {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Credenziali non valide');
  }

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) {
    throw new ApiError(401, 'Credenziali non valide');
  }

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

// Ruota il refresh token: verifica quello ricevuto, controlla che tokenVersion
// combaci ancora (non revocato da un logout/cambio password) e ne emette uno nuovo.
export async function rotateRefreshToken(rawRefreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new ApiError(401, 'Refresh token non valido o scaduto');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, 'Refresh token non valido o scaduto');
  }

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

export async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}
