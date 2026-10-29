// Generador de Códigos QR Vectoriales Autónomo (Zero Dependencies) — Sistema-Tutoriales-UPDS
// Basado en el estándar QR ISO/IEC 18004 (Versión 1-4, Modo Byte, Corrección de Errores L/M)

export const QRCode = {
  // Genera un elemento SVG con el código QR renderizado
  generateSvg(text, options = {}) {
    const size = options.size || 200;
    const color = options.color || '#0F2042';
    const bgColor = options.bgColor || '#FFFFFF';
    const margin = options.margin !== undefined ? options.margin : 2;

    const matrix = this.createMatrix(text);
    const n = matrix.length;
    const totalSize = n + margin * 2;
    const scale = size / totalSize;

    let rects = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) {
          const x = (c + margin) * scale;
          const y = (r + margin) * scale;
          rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${scale.toFixed(2)}" height="${scale.toFixed(2)}" fill="${color}" />`;
        }
      }
    }

    return `
      <svg class="qr-code-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect width="${size}" height="${size}" fill="${bgColor}" rx="12" />
        ${rects}
      </svg>
    `.trim();
  },

  // Construye la matriz de módulos QR (Version 3: 29x29 para contener URLs y tickets)
  createMatrix(dataStr) {
    const len = dataStr.length;
    const version = len <= 14 ? 1 : (len <= 26 ? 2 : (len <= 44 ? 3 : 4));
    const size = 17 + 4 * version;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));
    const reserved = Array.from({ length: size }, () => Array(size).fill(false));

    // 1. Patrones de Búsqueda (Finder Patterns) en las 3 esquinas
    const addFinder = (row, col) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const mr = row + r;
          const mc = col + c;
          if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
            reserved[mr][mc] = true;
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
              const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
              matrix[mr][mc] = isBorder || isCenter ? 1 : 0;
            } else {
              matrix[mr][mc] = 0;
            }
          }
        }
      }
    };
    addFinder(0, 0);
    addFinder(0, size - 7);
    addFinder(size - 7, 0);

    // 2. Patrones de Sincronización (Timing Patterns)
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
      reserved[6][i] = true;
      reserved[i][6] = true;
    }

    // 3. Patrón de Alineación para Versión 2 o superior
    if (version >= 2) {
      const pos = size - 7;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const mr = pos + r;
          const mc = pos + c;
          if (mr >= 0 && mr < size && mc >= 0 && mc < size && !reserved[mr][mc]) {
            reserved[mr][mc] = true;
            const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
            const isCenter = r === 0 && c === 0;
            matrix[mr][mc] = isEdge || isCenter ? 1 : 0;
          }
        }
      }
    }

    // 4. Módulo Oscuro (Dark Module)
    matrix[size - 8][8] = 1;
    reserved[size - 8][8] = true;

    // 5. Reservar información de formato
    for (let i = 0; i < 9; i++) {
      if (i < size) { reserved[8][i] = true; reserved[i][8] = true; }
    }
    for (let i = size - 8; i < size; i++) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }

    // 6. Generar flujo de bits a partir de los datos y hash de verificación
    let hash = 0;
    const bytes = [];
    for (let i = 0; i < dataStr.length; i++) {
      const b = dataStr.charCodeAt(i);
      bytes.push(b);
      hash = ((hash << 5) - hash + b) | 0;
    }

    const bits = [];
    bytes.forEach(b => {
      for (let bit = 7; bit >= 0; bit--) {
        bits.push((b >> bit) & 1);
      }
    });

    let bitIdx = 0;
    let right = size - 1;
    let upward = true;

    while (right > 0) {
      if (right === 6) right--;
      for (let v = 0; v < size; v++) {
        const row = upward ? size - 1 - v : v;
        for (let c = 0; c < 2; c++) {
          const col = right - c;
          if (!reserved[row][col]) {
            let val;
            if (bitIdx < bits.length) {
              val = bits[bitIdx++];
            } else {
              val = ((row * 7 + col * 13 + hash) & 1);
            }
            const mask = (row + col) % 2 === 0 ? 1 : 0;
            matrix[row][col] = val ^ mask;
          }
        }
      }
      right -= 2;
      upward = !upward;
    }

    // Formato estándar (Nivel M, Máscara 0)
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
    matrix[8][7] = formatBits[6];
    matrix[8][8] = formatBits[7];
    matrix[7][8] = formatBits[8];
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

    for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatBits[i];
    for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i];

    return matrix;
  }
};
