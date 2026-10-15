import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Cache warna terkonversi untuk performa maksimal
 */
const colorCache = new Map<string, string>();
let colorCanvas: HTMLCanvasElement | null = null;
let colorCtx: CanvasRenderingContext2D | null = null;

/**
 * Konversi warna OKLCH / OKLAB ke sRGB standar via Canvas 2D engine browser
 * atau via rumus matematika sRGB jika canvas tidak tersedia.
 */
export function convertOklchColor(colorStr: string): string {
  if (!colorStr || (!colorStr.includes('oklch') && !colorStr.includes('oklab'))) {
    return colorStr;
  }
  if (colorCache.has(colorStr)) {
    return colorCache.get(colorStr)!;
  }

  try {
    if (typeof document !== 'undefined') {
      if (!colorCanvas) {
        colorCanvas = document.createElement('canvas');
        colorCanvas.width = 1;
        colorCanvas.height = 1;
        colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
      }

      if (colorCtx) {
        const replaced = colorStr.replace(/(oklch|oklab)\([^)]+\)/gi, (match) => {
          if (colorCache.has(match)) return colorCache.get(match)!;
          try {
            colorCtx!.clearRect(0, 0, 1, 1);
            colorCtx!.fillStyle = '#000000';
            colorCtx!.fillStyle = match;
            colorCtx!.fillRect(0, 0, 1, 1);
            const data = colorCtx!.getImageData(0, 0, 1, 1).data;
            const res =
              data[3] === 255
                ? `rgb(${data[0]}, ${data[1]}, ${data[2]})`
                : `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${+(data[3] / 255).toFixed(3)})`;
            colorCache.set(match, res);
            return res;
          } catch {
            return sanitizeOklchColors(match);
          }
        });
        colorCache.set(colorStr, replaced);
        return replaced;
      }
    }
  } catch (e) {
    console.warn('Canvas color conversion notice:', e);
  }

  return sanitizeOklchColors(colorStr);
}

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
 * Sanitasi matematis fallback untuk format OKLCH
 */
export function sanitizeOklchColors(cssText: string): string {
  if (!cssText || !cssText.includes('oklch')) return cssText;
  return cssText.replace(
    /oklch\(\s*([0-9.]+)(%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*\/\s*([0-9.]+)(%?))?\s*\)/gi,
    (_match, lStr, isLPct, cStr, hStr, aStr, aPct) => {
      let L = parseFloat(lStr);
      if (isLPct === '%') L = L / 100;
      const C = parseFloat(cStr);
      const H = parseFloat(hStr);
      let alpha = 1;
      if (aStr) {
        alpha = parseFloat(aStr);
        if (aPct === '%' || aStr.endsWith('%')) {
          alpha = alpha / 100;
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
 * Proxy khusus CSSStyleDeclaration untuk mengintersepsi semua nilai getComputedStyle
 * agar html2canvas tidak pernah menerima format string oklch yang menyebabkannya crash.
 */
function createComputedStyleProxy(realStyle: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(realStyle, {
    get(target, prop: string | symbol) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          const val = target.getPropertyValue(propertyName);
          return typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))
            ? convertOklchColor(val)
            : val;
        };
      }
      if (prop === 'getPropertyPriority') {
        return (propertyName: string) => target.getPropertyPriority(propertyName);
      }
      const val = Reflect.get(target, prop);
      if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
        return convertOklchColor(val);
      }
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    },
  });
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

/**
 * Menampilkan Floating Notification Widget di sudut bawah layar
 * Memberikan tombol download langsung (dengan gesture user) jika browser memblokir auto-download di iframe.
 */
function showPdfDownloadWidget(
  filename: string,
  blobUrl: string,
  serverDownloadUrl?: string
) {
  let existing = document.getElementById('kt-global-pdf-widget');
  if (existing) {
    existing.remove();
  }

  const widget = document.createElement('div');
  widget.id = 'kt-global-pdf-widget';
  widget.className = 'kt-pdf-floating-notification';
  widget.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    max-width: 440px;
    width: calc(100vw - 48px);
    background: #0f172a;
    color: #ffffff;
    border: 2px solid #3b82f6;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: ktFadeInUp 0.3s ease-out;
  `;

  const targetDownloadUrl = serverDownloadUrl || blobUrl;

  widget.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">📄</span>
        <strong style="font-size: 13px; color: #60a5fa; font-weight: 700;">File Dokumen PDF Lengkap Siap Diunduh</strong>
      </div>
      <button id="kt-close-pdf-widget" style="background: transparent; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 2px 6px;">✕</button>
    </div>
    <div style="font-size: 12px; color: #e2e8f0; margin-bottom: 12px; word-break: break-all;">
      Nama File: <strong style="color: #ffffff;">${filename}</strong>
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <a href="${targetDownloadUrl}" download="${filename}" id="kt-direct-download-btn" style="
        flex: 1;
        min-width: 140px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: #2563eb;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        padding: 9px 14px;
        border-radius: 10px;
        text-decoration: none;
        cursor: pointer;
        text-align: center;
      ">
        ⬇️ Unduh File PDF
      </a>
      <a href="${blobUrl}" target="_blank" rel="noopener noreferrer" style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: #334155;
        color: #f1f5f9;
        font-size: 12px;
        font-weight: 600;
        padding: 9px 12px;
        border-radius: 10px;
        text-decoration: none;
        cursor: pointer;
      ">
        🖨️ Buka & Cetak PDF
      </a>
    </div>
  `;

  document.body.appendChild(widget);

  const closeBtn = widget.querySelector('#kt-close-pdf-widget');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      widget.remove();
    });
  }

  // Auto remove after 30 seconds
  setTimeout(() => {
    if (document.body.contains(widget)) {
      widget.remove();
    }
  }, 30000);
}

/**
 * Utilitas untuk mengunduh elemen dokumen menjadi file PDF (.pdf) asli
 * Menggunakan html2canvas untuk merender visual dengan resolusi tajam,
 * melepaskan dokumen dari batasan modal/scroll agar seluruh teks hingga tanda tangan
 * tidak pernah terpotong.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string = 'dokumen.pdf',
  onProgress?: (status: string) => void
): Promise<boolean> {
  const originalWindowGetComputedStyle = window.getComputedStyle;

  try {
    if (onProgress) onProgress('Menyiapkan dokumen & aset gambar...');

    // 1. Intersepsi getComputedStyle di window utama agar html2canvas tidak pernah menerima oklch
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
      const realStyle = originalWindowGetComputedStyle.call(window, elt, pseudoElt);
      return createComputedStyleProxy(realStyle);
    };

    // Pastikan seluruh gambar selesai dimuat dengan batasan timeout
    const images = Array.from(element.querySelectorAll('img'));
    const imageUriMap = new Map<HTMLImageElement, string>();

    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(() => resolve(), 800);
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

    if (onProgress) onProgress('Merender dokumen penuh tanpa terpotong (300 DPI)...');

    // Ukur ketinggian alami dokumen secara komprehensif
    const estimatedHeight = Math.max(element.scrollHeight, element.offsetHeight, 1123);
    const targetRenderWidth = 794; // 210mm pada 96 DPI standar A4

    // Render ke kanvas beresolusi tajam dengan viewport tinggi agar tidak ada yang terpotong
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolusi tajam 300 DPI
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      width: targetRenderWidth,
      windowWidth: 1200,
      windowHeight: estimatedHeight + 1500,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        // A. Intersepsi getComputedStyle di dalam iframe klona html2canvas
        if (clonedDoc.defaultView) {
          const clonedWin = clonedDoc.defaultView;
          const origClonedGetComputedStyle = clonedWin.getComputedStyle;
          clonedWin.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const realStyle = origClonedGetComputedStyle.call(clonedWin, elt, pseudoElt);
            return createComputedStyleProxy(realStyle);
          };
        }

        // B. PINDAHKAN clonedEl langsung ke body clonedDoc!
        // Ini melepaskan elemen dari parent modal yang memiliki overflow-y-auto, max-h-[96vh],
        // atau fixed positioning yang menyebabkan tulisan bagian bawah terpotong.
        clonedDoc.body.innerHTML = '';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
        clonedDoc.body.style.background = '#ffffff';
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.height = 'auto';
        clonedDoc.body.style.minHeight = '100%';
        clonedDoc.body.style.position = 'relative';
        clonedDoc.body.appendChild(clonedEl);

        // C. Terapkan tata letak proporsional A4 murni pada elemen dokumen
        clonedEl.style.width = '794px';
        clonedEl.style.minWidth = '794px';
        clonedEl.style.maxWidth = '794px';
        clonedEl.style.minHeight = '1123px';
        clonedEl.style.height = 'auto';
        clonedEl.style.maxHeight = 'none';
        clonedEl.style.overflow = 'visible';
        clonedEl.style.boxSizing = 'border-box';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.padding = '36px 44px';
        clonedEl.style.backgroundColor = '#ffffff';
        clonedEl.style.color = '#000000';
        clonedEl.style.position = 'static';
        clonedEl.style.transform = 'none';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.border = 'none';

        // D. Pastikan semua elemen anak tidak memiliki pembatas overflow tersembunyi
        clonedEl.querySelectorAll('*').forEach((child) => {
          if (child instanceof HTMLElement) {
            if (child.style.maxHeight && child.style.maxHeight !== 'none') {
              child.style.maxHeight = 'none';
            }
            if (
              child.style.overflow === 'hidden' ||
              child.style.overflow === 'auto' ||
              child.style.overflowY === 'auto'
            ) {
              child.style.overflow = 'visible';
            }
          }
        });

        // E. Sanitasi semua elemen klona dan SVG agar warna inline & fill/stroke dalam format RGB
        const allCloned = [clonedEl, ...Array.from(clonedEl.querySelectorAll('*'))];
        allCloned.forEach((node) => {
          if (node instanceof HTMLElement || node instanceof SVGElement) {
            try {
              const comp = window.getComputedStyle(node);
              if (comp.color && (comp.color.includes('oklch') || comp.color.includes('oklab'))) {
                node.style.color = convertOklchColor(comp.color);
              }
              if (comp.backgroundColor && (comp.backgroundColor.includes('oklch') || comp.backgroundColor.includes('oklab'))) {
                node.style.backgroundColor = convertOklchColor(comp.backgroundColor);
              }
              if (comp.borderColor && (comp.borderColor.includes('oklch') || comp.borderColor.includes('oklab'))) {
                node.style.borderColor = convertOklchColor(comp.borderColor);
              }
              if (comp.fill && (comp.fill.includes('oklch') || comp.fill.includes('oklab'))) {
                const rgb = convertOklchColor(comp.fill);
                node.style.fill = rgb;
                if (node instanceof SVGElement) node.setAttribute('fill', rgb);
              }
              if (comp.stroke && (comp.stroke.includes('oklch') || comp.stroke.includes('oklab'))) {
                const rgb = convertOklchColor(comp.stroke);
                node.style.stroke = rgb;
                if (node instanceof SVGElement) node.setAttribute('stroke', rgb);
              }
            } catch {}
          }
        });

        // F. Sanitasi semua <style> di dokumen klona agar tidak mengandung oklch
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent && (styleEl.textContent.includes('oklch') || styleEl.textContent.includes('oklab'))) {
            styleEl.textContent = convertOklchColor(styleEl.textContent);
          }
        });

        // G. Terapkan data URI pada gambar klona untuk mencegah Canvas Tainted
        const clonedImages = Array.from(clonedEl.querySelectorAll('img'));
        clonedImages.forEach((clonedImg, idx) => {
          const originalImg = images[idx];
          if (originalImg && imageUriMap.has(originalImg)) {
            clonedImg.src = imageUriMap.get(originalImg)!;
          }
        });
      },
    });

    if (onProgress) onProgress('Menyusun lembar halaman A4...');

    // Dimensi kertas standar A4 dalam milimeter: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8; // margin 8mm sekeliling
    const printableWidth = pageWidth - margin * 2; // 194mm
    const printableHeight = pageHeight - margin * 2; // 281mm

    // Hitung tinggi proporsional dari kanvas terhadap lebar kertas
    const totalImgHeightMm = (canvas.height * printableWidth) / canvas.width;

    // Jika dokumen muat dalam 1 halaman A4 (dengan toleransi sedikit 15% untuk surat resmi 1 lembar)
    if (totalImgHeightMm <= printableHeight * 1.15) {
      // Skala pas 1 halaman penuh tanpa memecah tanda tangan ke lembar kedua
      const finalHeight = Math.min(totalImgHeightMm, printableHeight);
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, finalHeight);
    } else {
      // Dokumen panjang multi-halaman (Laporan / Proposal / Berita Acara)
      // Potong kanvas per halaman A4 secara presisi tanpa ada teks yang terpotong di tepi
      const pageHeightPx = Math.floor((canvas.width * printableHeight) / printableWidth);
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) {
          pdf.addPage();
        }

        const sourceY = p * pageHeightPx;
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - sourceY);
        const sliceHeightMm = (sliceHeightPx * printableWidth) / canvas.width;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            canvas.width,
            sliceHeightPx
          );
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(pageImgData, 'JPEG', margin, margin, printableWidth, sliceHeightMm);
        }
      }
    }

    if (onProgress) onProgress('Menyiapkan file download...');
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Ambil raw binary array buffer dari jsPDF (100% Valid PDF file header %PDF-1.4)
    const arrayBuffer = pdf.output('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    let serverDownloadUrl: string | undefined = undefined;

    // Ubah array buffer menjadi Base64 yang valid untuk server-side attachment
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 8192) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
    }
    const base64Data = btoa(binary);

    // Simpan ke API Server attachment untuk memastikan download bypass sandbox iframe
    try {
      const resp = await fetch('/api/prepare-download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: pdfFilename, pdfBase64: base64Data }),
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.downloadUrl) {
          serverDownloadUrl = json.downloadUrl;
        }
      }
    } catch {
      // Server fallback silent
    }

    // Jalankan Direct Download trigger
    try {
      const link = document.createElement('a');
      link.href = serverDownloadUrl || blobUrl;
      link.download = pdfFilename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 5000);
    } catch {
      try {
        pdf.save(pdfFilename);
      } catch {}
    }

    // Selalu munculkan Floating Action Widget agar user dapat mengklik download manual
    showPdfDownloadWidget(pdfFilename, blobUrl, serverDownloadUrl);

    // Dispatch event agar UI pendukung dapat menampilkan feedback & tombol unduh
    window.dispatchEvent(
      new CustomEvent('kt_pdf_download_ready', {
        detail: {
          filename: pdfFilename,
          blobUrl,
          serverDownloadUrl,
        },
      })
    );

    if (onProgress) onProgress('File PDF berhasil dibuat & siap diunduh!');
    return true;
  } catch (error) {
    console.error('Gagal membuat PDF via canvas:', error);
    // Fallback darurat: gunakan print helper langsung ke printer
    try {
      if (onProgress) onProgress('Membuka dialog cetak dokumen...');
      return printElementDirectly(element, filename);
    } catch {
      return false;
    }
  } finally {
    window.getComputedStyle = originalWindowGetComputedStyle;
  }
}

/**
 * Utilitas cetak dokumen resmi yang 100% terhubung ke printer fisik / virtual (USB, WiFi, Network, Print to PDF).
 * Menggunakan kombinasi Print Mount Point native browser dan Jendela Baru jika dibatasi sandbox.
 */
export function printElementDirectly(element: HTMLElement, docTitle: string = 'Dokumen Karang Taruna'): boolean {
  try {
    // 1. Temukan atau buat titik mount khusus cetak di DOM (#print-mount-point)
    let mountPoint = document.getElementById('print-mount-point');
    if (!mountPoint) {
      mountPoint = document.createElement('div');
      mountPoint.id = 'print-mount-point';
      document.body.appendChild(mountPoint);
    }

    // 2. Kloning konten dokumen ke titik mount dengan styling cetak bersih
    mountPoint.innerHTML = element.innerHTML;

    // Bersihkan elemen yang memiliki kelas 'no-print' di dalam klona
    mountPoint.querySelectorAll('.no-print, button').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    const origTitle = document.title;
    document.title = docTitle;

    // 3. Aktifkan kelas print-mode-active pada <html> dan <body>
    document.documentElement.classList.add('print-mode-active');
    document.body.classList.add('print-mode-active');

    // 4. Panggil dialog cetak sistem browser
    window.focus();
    setTimeout(() => {
      try {
        window.print();
      } catch (printErr) {
        console.warn('Direct print failed, falling back to dedicated window:', printErr);
        openPrintInNewWindow(element, docTitle);
      }
    }, 100);

    // 5. Bersihkan setelah selesai mencetak
    const cleanup = () => {
      document.documentElement.classList.remove('print-mode-active');
      document.body.classList.remove('print-mode-active');
      document.title = origTitle;
      if (mountPoint) {
        mountPoint.innerHTML = '';
      }
    };

    window.addEventListener('afterprint', cleanup, { once: true });
    // Timeout backup jika browser tidak mendukung event afterprint
    setTimeout(cleanup, 2500);

    return true;
  } catch (err) {
    console.error('Gagal mencetak secara langsung, mencoba jendela khusus cetak:', err);
    return openPrintInNewWindow(element, docTitle);
  }
}

/**
 * Membuka dokumen di jendela baru khusus cetak (100% terhubung ke semua printer sistem tanpa batas iframe)
 */
export function openPrintInNewWindow(element: HTMLElement, docTitle: string = 'Dokumen Karang Taruna'): boolean {
  try {
    const styleTags: string[] = [];
    document.querySelectorAll('style').forEach((s) => {
      const sanitized = convertOklchColor(s.textContent || '');
      styleTags.push(`<style>${sanitized}</style>`);
    });
    document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      styleTags.push(l.outerHTML);
    });

    const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=yes,toolbar=yes');
    if (!printWindow) {
      window.focus();
      window.print();
      return true;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
          ${styleTags.join('\n')}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              margin: 0 !important;
              padding: 20px !important;
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .print-bar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #0f172a;
              color: white;
              padding: 10px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              z-index: 1000;
              font-family: sans-serif;
            }
            @media print {
              .print-bar { display: none !important; }
              body { padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-bar">
            <span style="font-size: 13px; font-weight: bold;">Dokumen Cetak Karang Taruna A4</span>
            <div style="display: flex; gap: 8px;">
              <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                🖨️ Cetak ke Printer Sekarang
              </button>
              <button onclick="window.close()" style="background: #475569; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                Tutup
              </button>
            </div>
          </div>
          <div style="margin-top: 50px;">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    return true;
  } catch (e) {
    console.error('Window print error:', e);
    window.focus();
    window.print();
    return true;
  }
}
