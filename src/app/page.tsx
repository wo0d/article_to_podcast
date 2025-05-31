'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Play, Pause, Volume2, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ConversionResult {
  audio: string;
  cover_url: string;
}

interface TaskResponse {
  taskId: string;
  status: 'processing' | 'completed' | 'failed';
  statusUrl: string;
  message?: string;
  result?: {
    success: boolean;
    audio: string;
    cover_url: string;
    debug_url: string;
    token: number;
  };
  error?: string;
}

export default function Home() {
  const [articleUrl, setArticleUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // 轮询查询任务状态
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (currentTaskId && isLoading) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/convert/status/${currentTaskId}`);
          const data: TaskResponse = await response.json();

          if (!response.ok) {
            throw new Error(data.error || '查询状态失败');
          }

          setStatusMessage(data.message || '');

          if (data.status === 'completed' && data.result) {
            setResult({
              audio: data.result.audio,
              cover_url: data.result.cover_url,
            });
            setIsLoading(false);
            setCurrentTaskId(null);
            setProgress(100);
            setStatusMessage('转换完成！');
          } else if (data.status === 'failed') {
            setError(data.error || '转换失败');
            setIsLoading(false);
            setCurrentTaskId(null);
            setProgress(0);
          } else if (data.status === 'processing') {
            // 模拟进度增长
            setProgress(prev => Math.min(prev + Math.random() * 10, 90));
          }
        } catch (err) {
          console.error('查询状态失败:', err);
          setError(err instanceof Error ? err.message : '查询状态失败');
          setIsLoading(false);
          setCurrentTaskId(null);
        }
      }, 5000); // 每5秒查询一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentTaskId, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleUrl.trim()) {
      setError('请输入有效的文章URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setProgress(10);
    setStatusMessage('正在提交任务...');

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleUrl }),
      });

      const data: TaskResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '提交任务失败');
      }

      setCurrentTaskId(data.taskId);
      setProgress(20);
      setStatusMessage(data.message || '任务已提交，正在处理中...');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交任务失败，请稍后重试');
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handlePlayPause = () => {
    if (!result?.audio) return;

    if (!audioElement) {
      const audio = new Audio(result.audio);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setArticleUrl('');
    setIsLoading(false);
    setResult(null);
    setError('');
    setCurrentTaskId(null);
    setProgress(0);
    setStatusMessage('');
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              文章转播客
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI智能转换
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              只需输入文章链接，AI将自动为您生成专业的播客音频和精美封面图
            </p>
          </div>

          {/* Main Card */}
          <div className="max-w-2xl mx-auto">
            <Card className="apple-shadow border-0 bg-white/80 apple-blur">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  开始转换
                </CardTitle>
                <CardDescription className="text-gray-600">
                  输入在线文章URL，让AI为您创建播客
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder="请输入文章URL (例如: https://mp.weixin.qq.com/s/...)"
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !articleUrl.trim()}
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在转换中...
                      </>
                    ) : (
                      '开始转换'
                    )}
                  </Button>
                </form>

                {/* Loading Progress */}
                {isLoading && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">转换进度</span>
                      <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-600 text-center">
                        {statusMessage || 'AI正在分析文章内容并生成播客，请耐心等待...'}
                      </p>
                    </div>
                    {currentTaskId && (
                      <p className="text-xs text-gray-500 text-center">
                        任务ID: {currentTaskId}
                      </p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      重新开始
                    </Button>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          转换完成！
                        </h3>
                      </div>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        size="sm"
                      >
                        转换新文章
                      </Button>
                    </div>

                    {/* Cover Image */}
                    <div className="flex justify-center">
                      <div className="relative group">
                        <img
                          src={result.cover_url}
                          alt="播客封面"
                          className="w-48 h-48 object-cover rounded-2xl apple-shadow"
                        />
                        <Button
                          onClick={() => handleDownload(result.cover_url, 'podcast-cover.png')}
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          onClick={handlePlayPause}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6 ml-1" />
                          )}
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-600">播客音频</span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={() => handleDownload(result.audio, 'podcast-audio.mp3')}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>下载音频</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择我们？
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              先进的AI技术，为您提供专业的播客制作体验
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Volume2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                高质量音频
              </h3>
              <p className="text-gray-600">
                AI生成的播客音频清晰自然，媲美专业主播
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                快速转换
              </h3>
              <p className="text-gray-600">
                只需几分钟，即可将长篇文章转换为播客音频
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                一键下载
              </h3>
              <p className="text-gray-600">
                支持音频和封面图下载，方便您在各平台使用
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 文章转播客. 由扣子驱动.
          </p>
        </div>
      </footer>
    </div>
  );
}
