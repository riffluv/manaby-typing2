// Firebase初期化＆Firestoreエクスポート
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ここは前回プロジェクトの値に差し替えてください
const firebaseConfig = {
  apiKey: 'AIzaSyCpbolcn8N-VY0jyw-HJnTpzRuM-r7bieM',
  authDomain: 'manaby-neo.firebaseapp.com',
  projectId: 'manaby-neo',
  storageBucket: 'manaby-neo.appspot.com',
  messagingSenderId: '399686616274',
  appId: '1:399686616274:web:63d3630196b578ee54190b',
  measurementId: 'G-YCBVTD3668',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
