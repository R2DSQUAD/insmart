"use client";

import { useState } from 'react';

// 1. Define types for your data structures
interface PreviewData {
  name: string;
  passport: string;
  birth: string;
}

// Type for the API response structure
interface UploadResponse {
  success: boolean;
  error?: string;
  // Allow index signature if the response contains dynamic fields you want to display in the JSON view
  [key: string]: unknown; 
}

// Type for the specific upload categories
type UploadType = 'all' | 'season_workers' | 'pdf';

export default function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  
  // 2. Use the specific UploadType
  const [uploadType, setUploadType] = useState<UploadType>('all');
  const [preview, setPreview] = useState<PreviewData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 3. Replace <any> with the interface <UploadResponse | null>
  const [lastResponse, setLastResponse] = useState<UploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("파일을 선택하세요.");
      return;
    }
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        const payload = {
          filename: file.name,
          contentBase64: base64,
          upload_type: uploadType
        };

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        // Cast the JSON response to your interface
        const data: UploadResponse = await res.json();
        
        setLastResponse(data);
        if (data.success) {
          alert('업로드 성공');
        } else {
          alert('업로드 실패: ' + (data.error || '알 수 없는 오류'));
        }

        setPreview([
          { name: "홍길동", passport: "M12345678", birth: "1990-01-01" },
          { name: "김철수", passport: "M87654321", birth: "1985-05-15" }
        ]);
      } catch (e: unknown) { 
        // 4. Use 'unknown' instead of 'any' and check the type
        let errorMessage = '알 수 없는 오류';
        if (e instanceof Error) {
          errorMessage = e.message;
        } else if (typeof e === 'string') {
          errorMessage = e;
        }
        alert('업로드 중 오류: ' + errorMessage);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setLoading(false);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>가입 및 수정 신청 (엑셀 업로드)</h1>
      <input type="file" accept=".xlsx,.xls,.pdf" onChange={handleFileChange} style={{ marginBottom: 20, fontSize: "1rem" }} />
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>업로드 타입:</label>
        {/* 5. Cast the value to UploadType instead of any */}
        <select value={uploadType} onChange={(e) => setUploadType(e.target.value as UploadType)}>
          <option value="all">all</option>
          <option value="season_workers">단체(계절노동자)</option>
          <option value="pdf">PDF 업로드</option>
        </select>
      </div>
      <button onClick={handleUpload} disabled={loading} style={{ padding: "0.7rem 1.5rem", fontSize: "1rem" }}>
        {loading ? '업로드 중...' : '업로드'}
      </button>
      {lastResponse && (
        <div style={{ marginTop: 12 }}>
          <strong>마지막 응답:</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(lastResponse, null, 2)}</pre>
        </div>
      )}
      {preview.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>미리보기 (예시)</h2>
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", borderColor: "black" }}>
            <thead>
              <tr>
                <th>이름</th>
                <th>여권번호</th>
                <th>생년월일</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.name}</td>
                  <td>{row.passport}</td>
                  <td>{row.birth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}