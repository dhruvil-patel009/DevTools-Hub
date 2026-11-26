import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { isDatabaseConfigured } from '@/config/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiError, apiSuccess, handleUnexpectedError } from '@/server/http/response';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email: z.string().trim().email('Invalid email address.').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const rl = await checkRateLimit(`register:${ip}`, { limit: 10, windowSeconds: 300 });
    if (!rl.allowed) {
      return apiError('RATE_LIMITED', 'Too many registration attempts. Please try again later.', 429);
    }

    if (!isDatabaseConfigured()) {
      return apiError('SERVICE_UNAVAILABLE', 'Database is not configured.', 503);
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid input.', 400);
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return apiError('EMAIL_EXISTS', 'An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        // Public registration is strictly USER role; never allow admin self-registration
        role: UserRole.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return apiSuccess(created, 201);
  } catch (err) {
    return handleUnexpectedError(err, 'POST /api/v1/auth/register');
  }
}
