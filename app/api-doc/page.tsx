// Swagger 스펙을 /api/swagger에서 직접 fetch
import ReactSwagger from './react-swagger';

export default async function ApiDocPage() {
  const res = await fetch('http://localhost:3000/api/swagger');
  const spec = await res.json();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API 문서</h1>
      <ReactSwagger spec={spec} />
    </div>
  );
}
