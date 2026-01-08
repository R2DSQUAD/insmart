import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

/**
 * @swagger
 * tags:
 *   - name: ManagerGeneral
 *     description: 일반형 관리자 인증 및 관리
 * /api/manager/general:
 *   get:
 *     tags:
 *       - ManagerGeneral
 *     summary: 일반형 관리자 목록 조회 또는 특정 관리자 조회
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *   post:
 *     tags:
 *       - ManagerGeneral
 *     summary: 일반형 관리자 생성
 *   put:
 *     tags:
 *       - ManagerGeneral
 *     summary: 일반형 관리자 정보 수정
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *   delete:
 *     tags:
 *       - ManagerGeneral
 *     summary: 일반형 관리자 삭제
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 */

// GET - 목록 조회 또는 특정 관리자 조회
export async function GET(request: NextRequest) {
  // ...구현 필요...
}

// POST - 관리자 생성
export async function POST(request: NextRequest) {
  // ...구현 필요...
}

// PUT - 관리자 정보 수정
export async function PUT(request: NextRequest) {
  // ...구현 필요...
}

// DELETE - 관리자 삭제
export async function DELETE(request: NextRequest) {
  // ...구현 필요...
}
