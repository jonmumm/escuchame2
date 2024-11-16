export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioData: Blob[] = [];
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private waveformData: number[] = [];
  private lastCaptureTime: number = 0;
  
  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
  }

  async startRecording(): Promise<void> {
    try {
      await this.initAudioContext();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Set up audio analysis
      if (this.audioContext) {
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 1024; // Increased for better resolution
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.4; // Reduced for more responsive visualization
        
        source.connect(this.analyser);
        
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.lastCaptureTime = Date.now();
        this.startWaveformCapture();
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      this.audioData = [];
      this.waveformData = [];

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioData.push(event.data);
        }
      });

      this.mediaRecorder.start(100);

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private startWaveformCapture() {
    const captureWaveform = () => {
      if (this.analyser && this.dataArray && this.mediaRecorder?.state === 'recording') {
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Focus on voice frequencies (roughly 85-255 Hz)
        let sum = 0;
        const start = 2; // Skip the lowest frequencies
        const end = 6;   // Focus on voice range
        
        for (let i = start; i < end; i++) {
          sum += this.dataArray[i];
        }
        
        const value = sum / ((end - start) * 255); // Normalize to 0-1
        this.waveformData.push(Math.min(1, value * 2)); // Amplify but cap at 1
        
        requestAnimationFrame(captureWaveform);
      }
    };

    requestAnimationFrame(captureWaveform);
  }

  private processWaveformData(): number[] {
    const targetLength = 32;
    
    if (this.waveformData.length === 0) {
      return Array(targetLength).fill(0.5);
    }
    
    const result: number[] = [];
    const chunkSize = Math.max(1, Math.floor(this.waveformData.length / targetLength));
    
    for (let i = 0; i < targetLength; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      
      let sum = 0;
      let count = 0;
      for (let j = start; j < end && j < this.waveformData.length; j++) {
        sum += this.waveformData[j];
        count++;
      }
      
      // Average the values and ensure minimum height
      const average = count > 0 ? sum / count : 0.5;
      result.push(0.4 + (average * 0.6)); // Keep values between 0.4 and 1.0
    }
    
    return result;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async stopRecording(): Promise<{ url: string, base64: string, waveform: number[] }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.addEventListener('stop', async () => {
        try {
          const audioBlob = new Blob(this.audioData, { 
            type: 'audio/webm' 
          });
          
          const url = URL.createObjectURL(audioBlob);
          const base64 = await this.blobToBase64(audioBlob);
          const waveform = this.processWaveformData();
          
          const tracks = this.mediaRecorder?.stream.getTracks();
          tracks?.forEach(track => track.stop());
          
          this.audioData = [];
          this.waveformData = [];
          this.mediaRecorder = null;

          resolve({ url, base64, waveform });
        } catch (error) {
          reject(error);
        }
      });

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  dispose(): void {
    if (this.mediaRecorder) {
      const tracks = this.mediaRecorder.stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    this.audioData = [];
    this.waveformData = [];
    this.mediaRecorder = null;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
} 