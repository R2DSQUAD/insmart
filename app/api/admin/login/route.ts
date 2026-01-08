import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Admin } from '@/lib/entity/Admin';

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: 관리자 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 성공
 *       401:
 *         description: 인증 실패
 */
export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  const dataSource = await initializeDataSource();
  const repo = dataSource.getRepository(Admin);
  const user = await repo.findOne({ where: { admin_id: id } });
  if (!user || user.password !== password) {
    return NextResponse.json({ success: false, error: '인증 실패' }, { status: 401 });
  }
  const { password: _, ...userInfo } = user;
  return NextResponse.json({ success: true, user: userInfo });
}
