'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/common/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Calendar, Trash2, Eye, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface MidiFile {
  midiId: number;
  fileName: string;
  uploadedAt: string;
  status: string;
}

interface LyricsItem {
  lyricsId: number;
  generatedAt: string;
  midiId: number;
}

function ProjectsPageContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'midi' | 'lyrics'>('midi');
  const [midiFiles, setMidiFiles] = useState<MidiFile[]>([]);
  const [lyrics, setLyrics] = useState<LyricsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');

  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, [activeTab, page]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'midi') {
        const response = await apiClient.midi.list({
          page,
          size: pageSize,
          sort: 'DESC',
          status: 'ALL',
        });
        setMidiFiles(response.content as unknown as MidiFile[]);
        setTotalPages(response.totalPages);
      } else {
        // 가사 목록은 midiId가 필요하므로, 전체 목록을 보려면 백엔드 API 수정이 필요
        // 임시로 midiId=0으로 요청 (백엔드에서 전체 목록 반환하도록 수정 필요)
        const response = await apiClient.lyrics.list({
          page,
          size: pageSize,
          sort: 'DESC',
          midiId: 0,
        });
        setLyrics(response.content as unknown as LyricsItem[]);
        setTotalPages(response.totalPages);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMidi = async (midiId: number) => {
    if (!confirm('이 MIDI 파일을 삭제하시겠습니까?')) return;

    try {
      await apiClient.midi.delete(midiId);
      loadData();
    } catch (err) {
      console.error('Failed to delete midi:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteLyrics = async (lyricsId: number) => {
    if (!confirm('이 가사를 삭제하시겠습니까?')) return;

    try {
      await apiClient.lyrics.delete(lyricsId);
      loadData();
    } catch (err) {
      console.error('Failed to delete lyrics:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleViewMidi = (midiId: number) => {
    router.push(`/editor/${midiId}`);
  };

  const handleViewLyrics = (lyricsId: number) => {
    router.push(`/editor/${lyricsId}`);
  };

  const handleNewProject = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">내 프로젝트</h1>
            <p className="text-muted-foreground">
              업로드한 MIDI 파일과 생성된 가사를 관리하세요.
            </p>
          </div>
          <Button onClick={handleNewProject}>
            <Plus className="w-4 h-4 mr-2" />
            새 프로젝트
          </Button>
        </div>

        {/* 탭 */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeTab === 'midi' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('midi');
              setPage(0);
            }}
          >
            <Music className="w-4 h-4 mr-2" />
            MIDI 파일
          </Button>
          <Button
            variant={activeTab === 'lyrics' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('lyrics');
              setPage(0);
            }}
          >
            <Music className="w-4 h-4 mr-2" />
            가사
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 mb-6">
            {error}
          </div>
        )}

        {/* 콘텐츠 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === 'midi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {midiFiles.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>아직 업로드한 MIDI 파일이 없습니다.</p>
                    <Button onClick={handleNewProject} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      첫 프로젝트 시작하기
                    </Button>
                  </div>
                ) : (
                  midiFiles.map((midi) => (
                    <Card key={midi.midiId} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <Music className="w-5 h-5 text-primary flex-shrink-0" />
                            <h3 className="font-semibold truncate">
                              {midi.fileName || `MIDI #${midi.midiId}`}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(midi.uploadedAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewMidi(midi.midiId)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            보기
                          </Button>
                          <Button
                            onClick={() => handleDeleteMidi(midi.midiId)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'lyrics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lyrics.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>아직 생성된 가사가 없습니다.</p>
                    <Button onClick={handleNewProject} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      가사 생성하기
                    </Button>
                  </div>
                ) : (
                  lyrics.map((item) => (
                    <Card key={item.lyricsId} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <Music className="w-5 h-5 text-primary flex-shrink-0" />
                            <h3 className="font-semibold truncate">
                              가사 #{item.lyricsId}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(item.generatedAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewLyrics(item.lyricsId)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            보기
                          </Button>
                          <Button
                            onClick={() => handleDeleteLyrics(item.lyricsId)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsPageContent />
    </AuthGuard>
  );
}
