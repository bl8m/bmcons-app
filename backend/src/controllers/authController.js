import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/authService.js';
import { parseDurationToMs } from '../services/tokenService.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES),
  path: '/api/auth',
};

const sendAuthResponse = (res, { user, accessToken, refreshToken }) => {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.json({ user, accessToken });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendAuthResponse(res, result);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, 'Refresh token mancante');
  }

  const result = await authService.rotateRefreshToken(token);
  sendAuthResponse(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }
  res.clearCookie(env.REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'Utente non trovato');
  }
  res.json({ user });
});
