import React from 'react';

export default function ApiDocLayout({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
			<main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
				{children}
			</main>
		</div>
	);
}
