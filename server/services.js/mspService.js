  const { SerialPort } = require('serialport');

  // ── MSP Constants ──────────────────────────────────────────
  const MSP_ATTITUDE  = 108;
  const MSP_ALTITUDE  = 109;
  const MSP_RAW_GPS   = 106;
  const MSP_ANALOG    = 110;
  const MSP_STATUS    = 101;

  // ── Build MSP request packet ────────────────────────────────
  function buildMSPRequest(code) {
    // Format: $M< + size(0) + code + checksum
    const buf = Buffer.alloc(6);
    buf[0] = 0x24; // '$'
    buf[1] = 0x4D; // 'M'
    buf[2] = 0x3C; // '<'
    buf[3] = 0x00; // data size = 0
    buf[4] = code;
    buf[5] = code; // checksum = size XOR code = 0 XOR code
    return buf;
  }

  // ── Parse MSP response ──────────────────────────────────────
  function parseMSPResponse(buffer) {
    // Minimum valid packet: $ M > size code [data] checksum
    if (buffer.length < 6) return null;
    if (buffer[0] !== 0x24 || buffer[1] !== 0x4D || buffer[2] !== 0x3E) return null;

    const dataSize = buffer[3];
    const code     = buffer[4];
    const data     = buffer.slice(5, 5 + dataSize);

    let parsed = { code };

    switch (code) {
      case MSP_ATTITUDE:
        parsed.roll    = data.readInt16LE(0) / 10;
        parsed.pitch   = data.readInt16LE(2) / 10;
        parsed.yaw     = data.readInt16LE(4);
        break;

      case MSP_ALTITUDE:
        parsed.altitude = data.readInt32LE(0) / 100; // cm → meters
        parsed.vario    = data.readInt16LE(4) / 100;
        break;

      case MSP_RAW_GPS:
        parsed.fixType   = data[0];
        parsed.satellites = data[1];
        parsed.lat       = data.readInt32LE(2) / 10000000;
        parsed.lon       = data.readInt32LE(6) / 10000000;
        parsed.altitude  = data.readInt16LE(10);
        parsed.speed     = data.readInt16LE(12) / 100; // cm/s → m/s
        break;

      case MSP_ANALOG:
        parsed.voltage  = data[0] / 10;
        parsed.current  = data.readInt16LE(2) / 100;
        parsed.rssi     = data.readInt16LE(4);
        break;

      case MSP_STATUS:
        parsed.cycleTime  = data.readInt16LE(0);
        parsed.i2cError   = data.readInt16LE(2);
        parsed.activeSensors = data.readInt16LE(4);
        parsed.mode       = data.readInt32LE(6);
        parsed.armed      = (parsed.mode & 1) === 1;
        break;
    }

    return parsed;
  }

  // ── Main MSP Service ────────────────────────────────────────
  class MSPService {
    constructor(portPath, baudRate = 115200) {
      this.portPath  = portPath;
      this.baudRate  = baudRate;
      this.port      = null;
      this.buffer    = Buffer.alloc(0);
      this.callbacks = {};
      this.droneData = {};
    }

    connect() {
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: this.baudRate,
      });

      this.port.on('open', () => {
        console.log(`✅ MSP Serial connected on ${this.portPath}`);
        this._startPolling();
      });

      this.port.on('data', (data) => {
        this.buffer = Buffer.concat([this.buffer, data]);
        this._processBuffer();
      });

      this.port.on('error', (err) => {
        console.error('❌ Serial error:', err.message);
      });

      this.port.on('close', () => {
        console.log('🔌 Serial port closed');
      });
    }

    _processBuffer() {
      while (this.buffer.length >= 6) {
        const start = this.buffer.indexOf(0x24); // find '$'
        if (start === -1) { this.buffer = Buffer.alloc(0); break; }
        if (start > 0)    { this.buffer = this.buffer.slice(start); }

        if (this.buffer.length < 6) break;

        const dataSize   = this.buffer[3];
        const packetSize = 6 + dataSize;
        if (this.buffer.length < packetSize) break;

        const packet = this.buffer.slice(0, packetSize);
        this.buffer  = this.buffer.slice(packetSize);

        const parsed = parseMSPResponse(packet);
        if (parsed && this.callbacks[parsed.code]) {
          this.callbacks[parsed.code](parsed);
        }
      }
    }

    _sendRequest(code) {
      if (this.port && this.port.isOpen) {
        this.port.write(buildMSPRequest(code));
      }
    }

    onData(code, cb) {
      this.callbacks[code] = cb;
    }

    _startPolling() {
      // Poll all telemetry at 10Hz
      setInterval(() => {
        this._sendRequest(MSP_ATTITUDE);
        this._sendRequest(MSP_ALTITUDE);
        this._sendRequest(MSP_ANALOG);
        this._sendRequest(MSP_STATUS);
      }, 100);

      // GPS at 2Hz (slower, heavier packet)
      setInterval(() => {
        this._sendRequest(MSP_RAW_GPS);
      }, 500);
    }

    disconnect() {
      if (this.port && this.port.isOpen) this.port.close();
    }
  }

  module.exports = { MSPService, MSP_ATTITUDE, MSP_ALTITUDE, MSP_RAW_GPS, MSP_ANALOG, MSP_STATUS };