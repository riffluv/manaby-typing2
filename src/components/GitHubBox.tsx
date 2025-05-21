import { useState, useEffect } from 'react';
import { useMCP } from '@/hooks/useMCP';

interface GitHubBoxProps {
  title: string;
}

export default function GitHubBox({ title }: GitHubBoxProps) {
  const { fetchGithubRepoInfo, fetchGithubCommits } = useMCP();
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadGitHubData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("GitHubBoxコンポーネント: リポジトリ情報を取得します");
        // リポジトリ情報を取得
        const repoData = await fetchGithubRepoInfo();
        console.log("取得したリポジトリ情報:", repoData);
        
        if (!repoData || Object.keys(repoData).length === 0) {
          console.warn("リポジトリ情報が空です");
          setError('リポジトリ情報を取得できませんでした');
          setLoading(false);
          return;
        }
        
        setRepoInfo(repoData);
        
        // コミット履歴を取得（エラーが発生しても続行）
        try {
          console.log("GitHubBoxコンポーネント: コミット履歴を取得します");
          const commitsData = await fetchGithubCommits();
          console.log("取得したコミット履歴:", commitsData);
          setCommits(commitsData);
        } catch (err) {
          console.warn('コミット履歴の取得に失敗しましたが、処理を続行します:', err);
        }
      } catch (err) {
        setError('GitHub情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadGitHubData();
  }, [fetchGithubRepoInfo, fetchGithubCommits]);

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-slate-100 shadow">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 shadow">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-slate-100 shadow">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      
      {repoInfo && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg">{repoInfo.name}</h3>
          <p className="text-gray-600 mb-2">{repoInfo.description || 'リポジトリの説明はありません'}</p>
          <div className="flex space-x-4 text-sm">
            <div>⭐ スター: {repoInfo.stars}</div>
            <div>🍴 フォーク: {repoInfo.forks}</div>
            <div>⚠️ 課題: {repoInfo.openIssues}</div>
          </div>
          <div className="mt-2">
            <a 
              href={repoInfo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHubで表示 →
            </a>
          </div>
        </div>
      )}
      
      {commits.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">最近のコミット</h3>
          <ul className="space-y-2 text-sm">
            {commits.slice(0, 3).map((commit) => (
              <li key={commit.sha} className="border-l-2 border-gray-300 pl-3">
                <a 
                  href={commit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:text-blue-600"
                >
                  {commit.message.split('\n')[0]}
                </a>
                <div className="text-gray-500 text-xs">
                  {commit.author} - {new Date(commit.date).toLocaleDateString('ja-JP')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
