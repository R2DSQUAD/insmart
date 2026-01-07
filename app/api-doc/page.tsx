import { getApiDocs } from '../../lib/swagger';
import ReactSwagger from './react-swagger';

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API 문서</h1>
      <ReactSwagger spec={spec} />
    </div>
  );
}
