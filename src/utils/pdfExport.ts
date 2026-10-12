import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Utilitas untuk mengunduh elemen dokumen menjadi file PDF (.pdf) asli
 * Menggunakan html2canvas untuk merender visual dengan resolusi tinggi (2x),
 * lalu memasukkannya ke dalam format kertas A4 standar jsPDF.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string = 'dokumen.pdf',
  onProgress?: (status: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress('Menyiapkan dokumen...');

    // Pastikan seluruh gambar selesai dimuat dan atur crossOrigin
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalHeight !== 0) return resolve();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    if (onProgress) onProgress('Merender halaman PDF...');

    // Render ke kanvas beresolusi tajam (scale 2 untuk hasil cetak tajam 300 DPI)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      windowWidth: element.scrollWidth || 800,
      windowHeight: element.scrollHeight || 1130,
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
    const margin = 8; // margin aman 8mm
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
        const position = margin - (pageIndex * printableHeight);
        pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
        heightLeft -= printableHeight;
        pageIndex++;
      }
    }

    if (onProgress) onProgress('Mengunduh file PDF...');
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    try {
      pdf.save(pdfFilename);
    } catch {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = pdfFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 10000);
    }
    return true;
  } catch (error) {
    console.error('Gagal membuat PDF via canvas:', error);
    // Fallback darurat: gunakan print helper agar user tetap bisa Save as PDF
    try {
      if (onProgress) onProgress('Membuka dialog cetak PDF...');
      return printElementDirectly(element);
    } catch {
      return false;
    }
  }
}

/**
 * Utilitas cetak dokumen resmi via offscreen iframe yang kompatibel dengan semua browser
 * Menyalin seluruh stylesheet tailwind agar hasil cetak persis dengan layar tanpa merusak tampilan.
 */
export function printElementDirectly(element: HTMLElement): boolean {
  try {
    // Buat iframe off-screen dengan ukuran fisik nyata (agar browser tidak memblokir print)
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '1024px';
    printFrame.style.height = '1024px';
    printFrame.style.border = 'none';
    printFrame.style.opacity = '0';
    printFrame.style.pointerEvents = 'none';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return true;
    }

    // Kumpulkan semua link stylesheet dan style tags
    let stylesHtml = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Cetak Dokumen Resmi Karang Taruna</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-sheet {
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
            }
            * {
              box-sizing: border-box !important;
            }
            .no-print, button {
              display: none !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            tr, th, td {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Tunggu konten dan gambar selesai dimuat sebelum trigger print
    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print error, fallback to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1500);
      }
    }, 500);

    return true;
  } catch (err) {
    console.error('Print helper error:', err);
    window.print();
    return true;
  }
}
