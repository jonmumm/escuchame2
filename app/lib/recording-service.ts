export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private onDataAvailable: (chunk: string) => void = () => {};
  private onRecordingComplete: () => void = () => {};

  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  private base64EncodeChunk(float32Array: Float32Array): string {
    const arrayBuffer = this.floatTo16BitPCM(float32Array);
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000; // 32KB chunks
    let binary = '';
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  async startRecording(
    onDataAvailable: (chunk: string) => void,
    onRecordingComplete: () => void
  ) {
    this.onDataAvailable = onDataAvailable;
    this.onRecordingComplete = onRecordingComplete;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context and nodes
      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      
      // Create processor node for raw audio data
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const base64Chunk = this.base64EncodeChunk(inputData);
        this.onDataAvailable(base64Chunk);
      };

      // Connect the nodes
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  stopRecording() {
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.onRecordingComplete();
  }
} 