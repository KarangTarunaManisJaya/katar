import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Konversi warna OKLCH / OKLAB ke sRGB standar
 * untuk mencegah crash html2canvas (yang belum mendukung fungsi warna modern CSS).
 */
function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toGamma = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  return [
    Math.round(toGamma(r) * 255),
    Math.round(toGamma(g) * 255),
    Math.round(toGamma(bl) * 255),
  ];
}

function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  return oklabToRgb(L, a, b);
}

/**
 * Sanitasi string CSS dengan mengganti semua oklch(...) dengan format rgb(...)
 */
export function sanitizeOklchColors(cssText: string): string {
  if (!cssText || !cssText.includes('oklch')) return cssText;
  return cssText.replace(
    /oklch\(\s*([0-9.]+)(%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi,
    (_match, lStr, isLPct, cStr, hStr, aStr) => {
      let L = parseFloat(lStr);
      if (isLPct === '%') L = L / 100;
      const C = parseFloat(cStr);
      const H = parseFloat(hStr);
      let alpha = 1;
      if (aStr) {
        if (aStr.endsWith('%')) {
          alpha = parseFloat(aStr) / 100;
        } else {
          alpha = parseFloat(aStr);
        }
      }
      const [r, g, b] = oklchToRgb(L, C, H);
      if (alpha < 1) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
  );
}

/**
 * Mengubah tag <img> menjadi base64 data URI lokal untuk mencegah Canvas Tainted Error
 */
async function convertImageToDataUri(img: HTMLImageElement): Promise<string | null> {
  if (!img.src || img.src.startsWith('data:')) return img.src;
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 80;
      canvas.height = img.naturalHeight || img.height || 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUri = canvas.toDataURL('image/png');
        return resolve(dataUri);
      }
    } catch {
      // Cross-origin atau security restriction
    }
    resolve(null);
  });
}

export interface GeneratedPdfResult {
  success: boolean;
  filename: string;
  blobUrl?: string;
  serverDownloadUrl?: string;
}

/**
 * Utilitas untuk mengunduh elemen dokumen menjadi file PDF (.pdf) asli
 * Menggunakan html2canvas untuk merender visual dengan resolusi tinggi (2x),
 * lalu memasukkannya ke dalam format kertas A4 standar jsPDF.
 * Kompatibel dengan semua browser dan lingkungan iframe sandbox.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string = 'dokumen.pdf',
  onProgress?: (status: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress('Menyiapkan dokumen & gambar...');

    // Pastikan seluruh gambar selesai dimuat dengan batasan timeout 600ms
    const images = Array.from(element.querySelectorAll('img'));
    const imageUriMap = new Map<HTMLImageElement, string>();

    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(() => resolve(), 600);
            if (img.complete && img.naturalHeight !== 0) {
              clearTimeout(timer);
              convertImageToDataUri(img).then((uri) => {
                if (uri) imageUriMap.set(img, uri);
                resolve();
              });
              return;
            }
            img.onload = () => {
              clearTimeout(timer);
              convertImageToDataUri(img).then((uri) => {
                if (uri) imageUriMap.set(img, uri);
                resolve();
              });
            };
            img.onerror = () => {
              clearTimeout(timer);
              resolve();
            };
          })
      )
    );

    if (onProgress) onProgress('Merender halaman dokumen...');

    // Render ke kanvas beresolusi tajam (scale 2 untuk hasil tajam 300 DPI)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 10000,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        // 1. Sanitasi semua <style> di dokumen klona agar tidak mengandung oklch
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
            styleEl.textContent = sanitizeOklchColors(styleEl.textContent);
          }
        });

        // 2. Terapkan data URI pada gambar klona untuk mencegah Canvas Tainted
        const clonedImages = Array.from(clonedEl.querySelectorAll('img'));
        clonedImages.forEach((clonedImg, idx) => {
          const originalImg = images[idx];
          if (originalImg && imageUriMap.has(originalImg)) {
            clonedImg.src = imageUriMap.get(originalImg)!;
          }
        });

        // 3. Pastikan elemen klona tampil penuh dengan latar belakang putih
        clonedEl.style.backgroundColor = '#ffffff';
        clonedEl.style.color = '#000000';
        clonedEl.style.transform = 'none';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.border = 'none';
      },
    });

    if (onProgress) onProgress('Menyusun lembar A4...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Dimensi kertas standar A4 dalam milimeter: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8; // margin 8mm
    const printableWidth = pageWidth - margin * 2; // 194mm
    const printableHeight = pageHeight - margin * 2; // 281mm

    // Hitung tinggi proporsional dari kanvas terhadap lebar kertas
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    if (imgHeight <= printableHeight) {
      // Pas dalam 1 halaman A4
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, imgHeight);
    } else {
      // Dokumen multi-halaman
      let heightLeft = imgHeight;
      let pageIndex = 0;

      while (heightLeft > 0) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        const position = margin - pageIndex * printableHeight;
        pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
        heightLeft -= printableHeight;
        pageIndex++;
      }
    }

    if (onProgress) onProgress('Menyiapkan file download...');
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // 1. Dapatkan base64 dari PDF
    const base64Data = pdf.output('datauristring').split(',')[1];
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // 2. Jalankan Server-Side Attachment API (Bypass sandbox download blocker di iframe)
    try {
      const resp = await fetch('/api/prepare-download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: pdfFilename, pdfBase64: base64Data }),
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.downloadUrl) {
          let downloadIframe = document.getElementById('kt-pdf-download-iframe') as HTMLIFrameElement;
          if (!downloadIframe) {
            downloadIframe = document.createElement('iframe');
            downloadIframe.id = 'kt-pdf-download-iframe';
            downloadIframe.style.display = 'none';
            document.body.appendChild(downloadIframe);
          }
          downloadIframe.src = json.downloadUrl;
        }
      }
    } catch {
      // Server fallback silent
    }

    // 3. Jalankan Client-Side Anchor Download (Direct Browser)
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = pdfFilename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 5000);
    } catch (e) {
      console.warn('Anchor download failed, using pdf.save', e);
      try {
        pdf.save(pdfFilename);
      } catch {}
    }

    // Dispatch event agar UI dapat menampilkan link direct download jika diperlukan
    window.dispatchEvent(
      new CustomEvent('kt_pdf_download_ready', {
        detail: {
          filename: pdfFilename,
          blobUrl,
        },
      })
    );

    if (onProgress) onProgress('File PDF berhasil dibuat!');
    return true;
  } catch (error) {
    console.error('Gagal membuat PDF via canvas:', error);
    // Fallback darurat: gunakan print helper
    try {
      if (onProgress) onProgress('Membuka dialog cetak dokumen...');
      return printElementDirectly(element);
    } catch {
      return false;
    }
  }
}

/**
 * Utilitas cetak dokumen resmi via Mount Point DOM yang 100% terhubung ke printer fisik / virtual
 * Mengisolasi dokumen ke dalam #print-mount-point dan menyembunyikan sisa antarmuka #root saat print.
 * Dokumen dipertahankan di mount-point tanpa timeout prematur agar koneksi printer tidak terputus.
 */
export function printElementDirectly(element: HTMLElement): boolean {
  try {
    // 1. Ambil atau buat kontainer mount point cetak khusus
    let mountPoint = document.getElementById('print-mount-point');
    if (!mountPoint) {
      mountPoint = document.createElement('div');
      mountPoint.id = 'print-mount-point';
      document.body.appendChild(mountPoint);
    }

    // 2. Gandakan elemen dokumen yang akan dicetak
    mountPoint.innerHTML = '';
    const cloned = element.cloneNode(true) as HTMLElement;
    cloned.classList.add('print-sheet');
    cloned.style.margin = '0 auto';
    cloned.style.boxShadow = 'none';
    cloned.style.border = 'none';
    cloned.style.backgroundColor = '#ffffff';
    cloned.style.color = '#000000';
    mountPoint.appendChild(cloned);

    // 3. Aktifkan mode cetak di body & html
    document.body.classList.add('print-mode-active');
    document.documentElement.classList.add('print-mode-active');

    const cleanup = () => {
      document.body.classList.remove('print-mode-active');
      document.documentElement.classList.remove('print-mode-active');
      // Jangan langsung hapus mountPoint agar printer spooler memiliki waktu mengambil konten
      setTimeout(() => {
        if (mountPoint && !document.body.classList.contains('print-mode-active')) {
          mountPoint.innerHTML = '';
        }
      }, 5000);
    };

    // Bersihkan HANYA setelah printer dialog selesai (afterprint)
    window.addEventListener('afterprint', cleanup, { once: true });
    // Timeout keamanan panjang (10 menit) jika event afterprint tidak dikirim oleh browser
    setTimeout(cleanup, 10 * 60 * 1000);

    // 4. Fokuskan jendela dan panggil dialog printer sistem
    window.focus();
    setTimeout(() => {
      window.print();
    }, 100);

    return true;
  } catch (err) {
    console.error('Gagal memanggil print dialog:', err);
    window.focus();
    window.print();
    return true;
  }
}
