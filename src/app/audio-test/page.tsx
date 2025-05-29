'use client';

import React from 'react';
import AudioLatencyTestComponent from '../../components/AudioLatencyTestComponent';

export default function AudioTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>音響遅延最適化テスト</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        現在の複雑な音響システムと軽量版システムの遅延比較を行います。
      </p>
      <AudioLatencyTestComponent />
    </div>
  );
}
