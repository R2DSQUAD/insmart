## Swagger API 문서

API 라우트에 JSDoc 주석을 추가하면 Swagger 문서가 자동 생성됩니다.
자동화 라이브러리: [next-swagger-doc](https://www.npmjs.com/package/next-swagger-doc)

Swagger 문서는 `/api/swagger` 엔드포인트에서 자동 생성된 스펙을 사용합니다.

Swagger UI는 [http://localhost:3000/api-doc](http://localhost:3000/api-doc) 또는 배포 환경의 `/api-doc`에서 접근할 수 있습니다.

모든 API는 JSDoc 주석 기반으로 자동 문서화되며, tags를 활용해 그룹별로 분리되어 Swagger UI에서 확인할 수 있습니다.

예시:
```typescript
/**
 * @swagger
 * /api/admin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: 관리자 목록 조회
 *     ...
 */
```
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
