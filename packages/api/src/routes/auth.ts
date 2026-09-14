// ===========================================
// PureSkin Store — Auth Routes
// ===========================================

import { Router, Request, Response } from 'express';
import { config } from '../config';
import { generateToken } from '../middleware/auth';
import { createLog } from '../services/logService';
import * as authService from '../services/authService';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * GET /api/auth/discord
 * Redirect to Discord OAuth2 authorization
 */
router.get('/discord', authLimiter, (_req: Request, res: Response) => {
  const url = authService.getOAuth2Url();
  res.redirect(url);
});

/**
 * GET /api/auth/callback
 * Handle Discord OAuth2 callback
 */
router.get('/callback', authLimiter, async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      res.redirect(`${config.webUrl}/login?error=no_code`);
      return;
    }

    // Exchange code for token
    const tokenData = await authService.exchangeCode(code);
    
    // Get Discord user info
    const discordUser = await authService.getDiscordUser(tokenData.access_token);
    
    // Get guild member to check roles
    const member = await authService.getGuildMember(tokenData.access_token);
    
    if (!member) {
      res.redirect(`${config.webUrl}/login?error=not_in_guild`);
      return;
    }

    // Determine role based on Discord roles
    const role = authService.determineRole(member.roles);
    
    // Only allow STAFF and OWNER
    if (role === 'USER') {
      res.redirect(`${config.webUrl}/login?error=insufficient_permissions`);
      return;
    }

    // Create/update user in database
    const user = await authService.findOrCreateUser(discordUser, role);

    // Generate JWT
    const jwt = generateToken({
      userId: user.id,
      discordId: user.discordId,
      role: user.role,
    });

    // Log the login
    await createLog({
      action: 'PANEL_LOGIN',
      userId: user.id,
      details: { username: user.username },
      ipAddress: req.ip,
    });

    // Set secure cookie
    res.cookie('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: config.cookieDomain === 'localhost' ? undefined : config.cookieDomain,
    });

    res.redirect(`${config.webUrl}/`);
  } catch (error) {
    console.error('❌ OAuth2 callback error:', error);
    res.redirect(`${config.webUrl}/login?error=auth_failed`);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  
  if (!token) {
    res.status(401).json({ success: false, error: 'Non authentifié' });
    return;
  }

  try {
    const jwt = await import('jsonwebtoken');
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    
    const { prisma } = await import('@pureskin/database');
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        discordId: true,
        username: true,
        discriminator: true,
        avatar: true,
        role: true,
        canRestock: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.clearCookie('token');
      res.status(401).json({ success: false, error: 'Utilisateur introuvable' });
      return;
    }

    res.json({ success: true, data: user });
  } catch {
    res.clearCookie('token');
    res.status(401).json({ success: false, error: 'Token invalide' });
  }
});

/**
 * POST /api/auth/logout
 * Clear session cookie
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Déconnecté' });
});

export default router;
