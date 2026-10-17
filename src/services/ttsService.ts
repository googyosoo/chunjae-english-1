/**
 * Web Speech API 기반 문장 단위/배속 제어 TTS 엔진
 * 출판사 mp3 음원 없이 브라우저 고유 네이티브 음성 합성 엔진을 활용하여 무제한 무료 재생
 */

export interface TTSOptions {
  rate?: number; // 0.75 ~ 1.25배속
  pitch?: number; // 1.0
  lang?: string; // 'en-US'
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onBoundary?: (charIndex: number) => void;
}

export class TTSService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static defaultRate: number = 1.0;

  /**
   * 브라우저에서 사용 가능한 영어 음성 목록 조회
   */
  static getEnglishVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const voices = this.synth.getVoices();
    return voices.filter(v => v.lang.startsWith('en'));
  }

  /**
   * 최적의 미국식 영어 음성 선택
   */
  private static getBestVoice(): SpeechSynthesisVoice | null {
    const enVoices = this.getEnglishVoices();
    if (enVoices.length === 0) return null;

    // Google US English 또는 Samantha, Natural 음성 우선
    const preferred = enVoices.find(
      v => v.name.includes('Natural') || v.name.includes('Google US English') || v.name.includes('Samantha') || (v.lang === 'en-US' && !v.localService)
    );
    return preferred || enVoices.find(v => v.lang === 'en-US') || enVoices[0];
  }

  /**
   * 문장 재생
   */
  static speak(text: string, options: TTSOptions = {}): void {
    if (!this.synth) {
      options.onError?.(new Error('Speech Synthesis is not supported in this browser.'));
      return;
    }

    // 기존 재생 중단
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate !== undefined ? options.rate : this.defaultRate;
    utterance.pitch = options.pitch || 1.0;

    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
    };

    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onBoundary?.(event.charIndex);
        }
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * 재생 일시정지 / 중지
   */
  static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * 기본 재생 배속 설정
   */
  static setDefaultRate(rate: number): void {
    this.defaultRate = Math.max(0.75, Math.min(1.5, rate));
  }

  /**
   * 현재 재생 중인지 여부
   */
  static isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}
