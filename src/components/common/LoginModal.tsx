import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
import { UserProfile, ALLOWED_EMAIL_DOMAIN, SCHOOL_NAME } from '../../types/auth';
import { School, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await AuthService.loginWithGoogle();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message || '로그인에 실패했습니다.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* School Crest */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
          <School className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{SCHOOL_NAME}</h2>
        <p className="text-xs sm:text-sm font-semibold text-indigo-600 mt-1">고등 영어I AI 디지털 교과서</p>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          본 플랫폼은 {SCHOOL_NAME} 인가 구성원 전용입니다.<br />
          학교 Google 계정(<span className="font-mono font-bold text-slate-700">@{ALLOWED_EMAIL_DOMAIN}</span>)으로 로그인해주세요.
        </p>

        {errorMsg && (
          <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            aria-label="심인고등학교 Google 계정으로 로그인"
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>학교 Google 계정으로 로그인</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-6">
          * 교사 권한은 행정 승인된 관리자 계정(teachers 컬렉션 등록)에 한해 자동 활성화됩니다.
        </p>
      </div>
    </div>
  );
};
