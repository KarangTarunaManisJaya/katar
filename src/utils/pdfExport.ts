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

    // Pastikan gambar sudah selesai dimuat
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
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
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
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

    // Hitung tinggi proporsional dari kanvas terhadap lebar kertas
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      // Pas dalam 1 halaman A4
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, imgHeight);
    } else {
      // Dokumen multi-halaman (misal proposal panjang atau laporan banyak item)
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }
    }

    if (onProgress) onProgress('Mengunduh file...');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Gagal membuat PDF:', error);
    return false;
  }
}

/**
 * Utilitas cetak dokumen resmi via hidden iframe yang tahan blokir iframe
 * Menyalin seluruh stylesheet tailwind agar hasil cetak persis dengan layar.
 */
export function printElementDirectly(element: HTMLElement): boolean {
  try {
    // Buat iframe tersembunyi
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
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
          <title>Cetak Dokumen Resmi</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 14mm 12mm 14mm;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: "Times New Roman", Times, serif;
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
            }
            * {
              box-sizing: border-box !important;
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
        }, 1000);
      }
    }, 400);

    return true;
  } catch (err) {
    console.error('Print helper error:', err);
    window.print();
    return true;
  }
}
