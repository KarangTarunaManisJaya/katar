import { DetailedMember } from '../data/membersData';
import { PenandatanganInfo } from '../types/surat';

/**
 * Mengambil daftar anggota resmi dari database lokal / real-time storage
 */
export function getDatabaseMembers(): DetailedMember[] {
  try {
    const saved = localStorage.getItem('kt_members_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Gagal memuat database anggota:', e);
  }
  return [];
}

/**
 * Mencari data anggota dari database sesuai dengan jabatan / peran
 */
export function findMemberByJabatan(jabatanQuery: string, membersList?: DetailedMember[]): DetailedMember | undefined {
  const list = membersList || getDatabaseMembers();
  if (!list || list.length === 0) return undefined;

  const q = (jabatanQuery || '').toLowerCase().trim();
  if (!q) return undefined;

  // 1. Coba exact match terlebih dahulu
  const exact = list.find((m) => (m.jabatan || '').toLowerCase().trim() === q);
  if (exact) return exact;

  // 2. Ketua Umum / Ketua Karang Taruna
  if (q.includes('ketua') && !q.includes('panitia') && !q.includes('wakil') && !q.includes('seksi')) {
    const ketua = list.find((m) => {
      const j = (m.jabatan || '').toLowerCase();
      return (
        (j.includes('ketua') || j.includes('ketum')) &&
        !j.includes('panitia') &&
        !j.includes('wakil') &&
        !j.includes('seksi')
      );
    });
    if (ketua) return ketua;
  }

  // 3. Wakil Ketua
  if (q.includes('wakil') && q.includes('ketua')) {
    const wakil = list.find((m) => (m.jabatan || '').toLowerCase().includes('wakil'));
    if (wakil) return wakil;
  }

  // 4. Sekretaris Umum / Sekretaris
  if (q.includes('sekretaris') || q.includes('sekum')) {
    const sek = list.find((m) => {
      const j = (m.jabatan || '').toLowerCase();
      return j.includes('sekretaris') || j.includes('sekum');
    });
    if (sek) return sek;
  }

  // 5. Bendahara
  if (q.includes('bendahara') || q.includes('bendum')) {
    const ben = list.find((m) => (m.jabatan || '').toLowerCase().includes('bendahara'));
    if (ben) return ben;
  }

  // 6. Ketua Panitia
  if (q.includes('panitia')) {
    const pan = list.find((m) => (m.jabatan || '').toLowerCase().includes('panitia'));
    if (pan) return pan;
  }

  // 7. Partial match umum
  return list.find((m) => (m.jabatan || '').toLowerCase().includes(q));
}

/**
 * Menghasilkan objek PenandatanganInfo berdasarkan jabatan.
 * Jika pejabat dengan jabatan tersebut ada di database, isi nama & KTA sesuai database.
 * Jika belum ada di database, kosongkan nama & nomor KTA sesuai permintaan pengguna.
 */
export function resolvePenandatanganByJabatan(
  jabatan: string,
  membersList?: DetailedMember[],
  includeStamp: boolean = true
): PenandatanganInfo {
  const member = findMemberByJabatan(jabatan, membersList);
  if (member && member.name && member.name.trim().length > 0) {
    const sigUrl = member.signatureUrl || (member as any).digitalSignatureUrl || '';
    return {
      nama: member.name.trim(),
      jabatan: jabatan || member.jabatan || 'Pengurus',
      ktaNo: (member.noAnggota || member.nik || '').trim(),
      includeStamp,
      digitalSignatureUrl: sigUrl,
      signatureUrl: sigUrl,
    };
  }

  // Kosongkan nama dan KTA jika belum terdaftar di database
  return {
    nama: '',
    jabatan: jabatan || 'Pengurus',
    ktaNo: '',
    includeStamp,
    digitalSignatureUrl: '',
    signatureUrl: '',
  };
}

/**
 * Menghasilkan daftar penandatangan baku surat keluar (Ketua & Sekretaris)
 * Berdasarkan database anggota, atau kosong jika belum terdaftar
 */
export function getDefaultSuratPenandatangan(membersList?: DetailedMember[]): PenandatanganInfo[] {
  const list = membersList || getDatabaseMembers();
  return [
    resolvePenandatanganByJabatan('Ketua Umum', list, true),
    resolvePenandatanganByJabatan('Sekretaris Umum', list, true),
  ];
}

/**
 * Menghasilkan pejabat default untuk struktur proposal kegiatan
 */
export function getDefaultProposalOfficials(membersList?: DetailedMember[]) {
  const list = membersList || getDatabaseMembers();
  const ketua = findMemberByJabatan('Ketua Umum', list);
  const sekretaris = findMemberByJabatan('Sekretaris Umum', list);
  const bendahara = findMemberByJabatan('Bendahara', list);
  const ketuaPanitia = findMemberByJabatan('Ketua Panitia', list);
  const wakilKetua = findMemberByJabatan('Wakil Ketua', list);

  return {
    penanggungJawab: ketua ? `${ketua.name} (Ketua Karang Taruna)` : '',
    penanggungJawabName: ketua ? ketua.name : '',
    ketuaPanitia: ketuaPanitia ? ketuaPanitia.name : '',
    ketuaSignatureUrl: ketua?.signatureUrl || (ketua as any)?.digitalSignatureUrl || '',
    wakilKetua: wakilKetua ? wakilKetua.name : '',
    sekretaris: sekretaris ? sekretaris.name : '',
    sekretarisSignatureUrl: sekretaris?.signatureUrl || (sekretaris as any)?.digitalSignatureUrl || '',
    bendahara: bendahara ? bendahara.name : '',
  };
}

/**
 * Menyimpan atau memperbarui tanda tangan digital anggota ke database kt_members_v3
 */
export function saveMemberSignature(memberIdentifier: string, signatureDataUrl: string): boolean {
  if (!memberIdentifier) return false;
  try {
    const list = getDatabaseMembers();
    const idLower = memberIdentifier.toLowerCase().trim();
    let updated = false;

    const newList = list.map((m) => {
      if (
        m.id === memberIdentifier ||
        (m.name && m.name.toLowerCase().trim() === idLower) ||
        (m.jabatan && m.jabatan.toLowerCase().trim() === idLower)
      ) {
        updated = true;
        return {
          ...m,
          signatureUrl: signatureDataUrl,
          digitalSignatureUrl: signatureDataUrl,
        };
      }
      return m;
    });

    if (updated) {
      localStorage.setItem('kt_members_v3', JSON.stringify(newList));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('kt_members_changed'));
      return true;
    }
  } catch (e) {
    console.error('Gagal menyimpan tanda tangan digital anggota:', e);
  }
  return false;
}

