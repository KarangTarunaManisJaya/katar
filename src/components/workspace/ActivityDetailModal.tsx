import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Image as ImageIcon,
  Share2,
  Trash2,
  Printer,
  ExternalLink,
  MessageCircle,
  FileText,
  DollarSign,
  Users,
  Award,
  Download,
  Sparkles,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Eye,
  Check,
  Archive,
  ArchiveRestore,
  Video,
  Play,
  Plus,
  Upload,
  Volume2,
  VolumeX,
  Link2,
  FileVideo,
  Star,
  ThumbsUp,
  MessageSquare,
  PenLine,
  Heart,
  Send,
  CornerDownRight,
  HelpCircle,
  Lightbulb,
  Reply,
} from 'lucide-react';
import {
  ActivityItem,
  ACTIVITIES_DATA,
  ActivityRating,
  ActivityComment,
  ActivityCommentReply,
  CommentType,
} from '../../data/workspaceData';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfExport';
import {
  getVideoBlobFromIndexedDb,
  extractVideoMetaAndThumbnail,
  uploadVideoToServerVault,
  saveVideoBlobToIndexedDb,
  resolvePlayableVideoUrl,
  saveVideoToPrimaryStorage,
  extractYouTubeVideoId,
} from '../../utils/videoManager';
import { updatePageSeo, resetDefaultSeo } from '../../utils/seoHelper';
import { isOwnerAdminAccount } from '../../types/auth';

export const OFFICIAL_PRESET_VIDEOS = [
  {
    title: 'Bakti Sosial & Santunan RW 05',
    url: '/filebase_vault/video/video_baksos_manisjaya.mp4',
    duration: 15,
    tag: 'Sosial',
    description: 'Dokumentasi penyerahan santunan anak yatim & aksi peduli sesama.',
  },
  {
    title: 'Kerja Bakti Massal & Penghijauan RW 01 - RW 05',
    url: '/filebase_vault/video/video_kerjabakti_manisjaya.mp4',
    duration: 15,
    tag: 'Lingkungan',
    description: 'Aksi pemuda & warga gotong royong membersihkan lingkungan & tanam pohon.',
  },
  {
    title: 'Turnamen Futsal & Olahraga Pemuda',
    url: '/filebase_vault/video/video_futsal_manisjaya.mp4',
    duration: 15,
    tag: 'Olahraga',
    description: 'Cuplikan pertandingan futsal persahabatan generasi muda antar RW.',
  },
];

interface ActivityDetailModalProps {
  activity: ActivityItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  onDelete?: (id: string) => void;
  onToggleArchive?: (activity: ActivityItem) => void;
  onUpdateActivity?: (updated: ActivityItem, customToast?: string) => void;
  currentMember?: any;
  canManageNews?: boolean;
  isLoggedIn?: boolean;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onToast,
  onDelete,
  onToggleArchive,
  onUpdateActivity,
  currentMember,
  canManageNews,
  isLoggedIn,
}) => {
  const isUserLoggedIn = Boolean(
    isLoggedIn ??
      (currentMember &&
        currentMember.id !== 'guest' &&
        typeof localStorage !== 'undefined' &&
        Boolean(localStorage.getItem('kt_auth_user_v3')))
  );
  const isOwnerAdmin = isUserLoggedIn && isOwnerAdminAccount(currentMember);
  const canManageActivity = Boolean(
    canManageNews ??
      (isUserLoggedIn &&
        (isOwnerAdmin ||
          (Array.isArray(currentMember?.allowedMenus) &&
            (currentMember.allowedMenus.includes('berita') || currentMember.allowedMenus.includes('tambah_berita')))))
  );
  const canDeleteComment = (commentItem: ActivityComment): boolean => {
    if (isOwnerAdmin || canManageActivity) return true;
    return Boolean(isUserLoggedIn && commentItem.userId && currentMember?.id && commentItem.userId === currentMember.id);
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const defaultMatch = ACTIVITIES_DATA.find((d) => d.id === activity?.id);
  const initialVideo = activity?.videoUrl || defaultMatch?.videoUrl || '';

  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>(initialVideo);
  const [mediaViewMode, setMediaViewMode] = useState<'both' | 'video' | 'photo'>(
    initialVideo ? 'both' : 'photo'
  );
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputVideoUrl, setInputVideoUrl] = useState<string>(initialVideo);
  const [isMuted, setIsMuted] = useState(true);

  // Rating & Evaluasi Kegiatan State (1 - 5 Bintang)
  const [ratings, setRatings] = useState<ActivityRating[]>(() => {
    if (activity?.ratings && activity.ratings.length > 0) return activity.ratings;
    const def = ACTIVITIES_DATA.find((d) => d.id === activity?.id);
    if (def?.ratings && def.ratings.length > 0) return def.ratings;
    try {
      const local = localStorage.getItem(`kt_ratings_${activity?.id}`);
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  });

  React.useEffect(() => {
    if (activity?.ratings && activity.ratings.length > 0) {
      setRatings(activity.ratings);
    } else {
      const def = ACTIVITIES_DATA.find((d) => d.id === activity?.id);
      if (def?.ratings && def.ratings.length > 0) {
        setRatings(def.ratings);
      } else {
        try {
          const local = localStorage.getItem(`kt_ratings_${activity?.id}`);
          if (local) setRatings(JSON.parse(local));
          else setRatings([]);
        } catch {}
      }
    }
  }, [activity?.id, activity?.ratings]);

  // Form states for submitting rating
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [memberNameInput, setMemberNameInput] = useState<string>(
    currentMember?.name && currentMember?.id !== 'guest' ? currentMember.name : ''
  );
  const [memberRwInput, setMemberRwInput] = useState<string>(
    currentMember?.rw || 'RW 05'
  );
  const [memberRoleInput, setMemberRoleInput] = useState<string>(
    currentMember?.role || 'Anggota Karang Taruna'
  );
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [aspectOrg, setAspectOrg] = useState<number>(5);
  const [aspectImpact, setAspectImpact] = useState<number>(5);
  const [aspectEnthusiasm, setAspectEnthusiasm] = useState<number>(5);
  const [showAspects, setShowAspects] = useState<boolean>(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [helpfulLikes, setHelpfulLikes] = useState<Record<string, number>>({});

  const totalRatingsCount = ratings.length;
  const avgRating = totalRatingsCount > 0
    ? Number((ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatingsCount).toFixed(1))
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.filter((r) => r.rating === star).length;
    const percentage = totalRatingsCount > 0 ? Math.round((count / totalRatingsCount) * 100) : 0;
    return { star, count, percentage };
  });

  const STAR_DESCRIPTIONS: Record<number, { title: string; badge: string; color: string; desc: string }> = {
    1: {
      title: 'Kurang / Perlu Evaluasi',
      badge: 'Evaluasi',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      desc: 'Pelaksanaan membutuhkan banyak pembenahan teknis dan komunikasi panitia.',
    },
    2: {
      title: 'Cukup / Kurang Maksimal',
      badge: 'Cukup',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      desc: 'Kegiatan berjalan namun masih ada kekurangan dalam keterlibatan warga.',
    },
    3: {
      title: 'Baik & Cukup Tertib',
      badge: 'Baik',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      desc: 'Agenda terlaksana lancar, tertib, dan membawa dampak positif bagi lingkungan.',
    },
    4: {
      title: 'Sangat Baik & Bermanfaat',
      badge: 'Sangat Baik',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      desc: 'Koordinasi panitia rapi, antusiasme warga tinggi, dan sukses terencana.',
    },
    5: {
      title: 'Luar Biasa / Sempurna',
      badge: 'Prestasi Pemuda',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      desc: 'Sukses besar, kekompakan pemuda luar biasa, sangat menginspirasi Kelurahan Manis Jaya!',
    },
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    if (starRating < 1 || starRating > 5) {
      onToast('Silakan pilih rating bintang 1 sampai 5.');
      return;
    }

    setIsSubmittingRating(true);
    const authorName = memberNameInput.trim() || (currentMember?.name && currentMember?.id !== 'guest' ? currentMember.name : 'Anggota Karang Taruna');
    const roleStr = memberRoleInput.trim() || currentMember?.role || 'Anggota Pemuda';
    const rwStr = memberRwInput.trim() || currentMember?.rw || 'Kelurahan Manis Jaya';

    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newRatingItem: ActivityRating = {
      id: `rate-${Date.now()}`,
      userId: currentMember?.id,
      memberName: authorName,
      role: roleStr,
      rw: rwStr,
      rating: starRating,
      feedback: feedbackInput.trim() || undefined,
      aspects: {
        organization: aspectOrg,
        impact: aspectImpact,
        enthusiasm: aspectEnthusiasm,
      },
      createdAt: nowStr,
    };

    const newRatingsList = [newRatingItem, ...ratings];
    setRatings(newRatingsList);

    const newAvg = Number(
      (newRatingsList.reduce((acc, r) => acc + r.rating, 0) / newRatingsList.length).toFixed(1)
    );

    try {
      localStorage.setItem(`kt_ratings_${activity.id}`, JSON.stringify(newRatingsList));
    } catch {}

    const updatedActivity: ActivityItem = {
      ...activity,
      ratings: newRatingsList,
      averageRating: newAvg,
      totalRatings: newRatingsList.length,
    };

    if (onUpdateActivity) {
      onUpdateActivity(updatedActivity, `⭐ Penilaian ${starRating} bintang berhasil dicatat!`);
    }

    setIsSubmittingRating(false);
    setFeedbackInput('');
    onToast(`⭐ Terima kasih ${authorName}! Penilaian ${starRating} bintang berhasil dikirim.`);
  };

  const handleToggleHelpful = (ratingId: string) => {
    setHelpfulLikes((prev) => {
      const current = prev[ratingId] || 0;
      const next = current > 0 ? 0 : 1;
      onToast(next > 0 ? 'Apresiasi penilaian dikirim 👍' : 'Batal apresiasi');
      return { ...prev, [ratingId]: next };
    });
  };

  // Komentar & Diskusi Kegiatan State
  const [comments, setComments] = useState<ActivityComment[]>(() => {
    if (activity?.comments && activity.comments.length > 0) return activity.comments;
    const def = ACTIVITIES_DATA.find((d) => d.id === activity?.id);
    if (def?.comments && def.comments.length > 0) return def.comments;
    try {
      const local = localStorage.getItem(`kt_comments_${activity?.id}`);
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  });

  React.useEffect(() => {
    if (activity?.comments && activity.comments.length > 0) {
      setComments(activity.comments);
    } else {
      const def = ACTIVITIES_DATA.find((d) => d.id === activity?.id);
      if (def?.comments && def.comments.length > 0) {
        setComments(def.comments);
      } else {
        try {
          const local = localStorage.getItem(`kt_comments_${activity?.id}`);
          if (local) setComments(JSON.parse(local));
          else setComments([]);
        } catch {}
      }
    }
  }, [activity?.id, activity?.comments]);

  // Comment filters & Form inputs
  const [commentFilter, setCommentFilter] = useState<'semua' | CommentType>('semua');
  const [commentCategory, setCommentCategory] = useState<CommentType>('diskusi');
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentAuthorName, setCommentAuthorName] = useState<string>(
    currentMember?.name && currentMember?.id !== 'guest' ? currentMember.name : ''
  );
  const [commentAuthorRw, setCommentAuthorRw] = useState<string>(
    currentMember?.rw && ['RW 01', 'RW 02', 'RW 03', 'RW 04', 'RW 05'].includes(currentMember.rw)
      ? currentMember.rw
      : 'RW 01'
  );
  const [commentAuthorRole, setCommentAuthorRole] = useState<string>(
    currentMember?.role || 'Anggota Karang Taruna'
  );
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Threaded reply states
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<string>('');
  const [replyAuthorName, setReplyAuthorName] = useState<string>(
    currentMember?.name && currentMember?.id !== 'guest' ? currentMember.name : ''
  );
  const [replyAuthorRw, setReplyAuthorRw] = useState<string>(
    currentMember?.rw && ['RW 01', 'RW 02', 'RW 03', 'RW 04', 'RW 05'].includes(currentMember.rw)
      ? currentMember.rw
      : 'RW 01'
  );
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});

  const filteredComments = comments.filter((c) => {
    if (commentFilter === 'semua') return true;
    return c.type === commentFilter;
  });

  const getCommentCategoryBadge = (type?: CommentType) => {
    switch (type) {
      case 'pertanyaan':
        return {
          label: 'Pertanyaan',
          icon: HelpCircle,
          color: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'masukan':
        return {
          label: 'Masukan / Saran',
          icon: Lightbulb,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'apresiasi':
        return {
          label: 'Apresiasi',
          icon: Heart,
          color: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'diskusi':
      default:
        return {
          label: 'Diskusi',
          icon: MessageSquare,
          color: 'bg-blue-100 text-blue-800 border-blue-300',
        };
    }
  };

  const handleApplySuggestion = (text: string, type: CommentType) => {
    setCommentCategory(type);
    setCommentInput(text);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    if (!commentInput.trim()) {
      onToast('Silakan tuliskan komentar, pertanyaan, atau masukan Anda.');
      return;
    }

    setIsSubmittingComment(true);
    const authorName =
      commentAuthorName.trim() ||
      (currentMember?.name && currentMember?.id !== 'guest'
        ? currentMember.name
        : 'Anggota Karang Taruna');
    const roleStr = commentAuthorRole.trim() || currentMember?.role || 'Anggota Pemuda';
    const rwStr = commentAuthorRw || currentMember?.rw || 'RW 01';

    const nowStr =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB';

    const newCommentItem: ActivityComment = {
      id: `comm-${Date.now()}`,
      activityId: activity.id,
      userId: currentMember?.id,
      authorName,
      authorRole: roleStr,
      authorRw: rwStr,
      comment: commentInput.trim(),
      type: commentCategory,
      createdAt: nowStr,
      likesCount: 0,
      replies: [],
    };

    const newCommentsList = [newCommentItem, ...comments];
    setComments(newCommentsList);
    setCommentInput('');

    try {
      localStorage.setItem(`kt_comments_${activity.id}`, JSON.stringify(newCommentsList));
    } catch {}

    if (onUpdateActivity) {
      const updatedActivity: ActivityItem = {
        ...activity,
        comments: newCommentsList,
      };
      onUpdateActivity(updatedActivity, 'Komentar Anda berhasil dikirim!');
    } else {
      onToast('Komentar Anda berhasil ditambahkan!');
    }

    setIsSubmittingComment(false);
  };

  const handleToggleCommentLike = (commentId: string) => {
    setCommentLikes((prev) => {
      const current = prev[commentId] || 0;
      const next = current === 0 ? 1 : 0;
      return { ...prev, [commentId]: next };
    });
    onToast('Terima kasih atas apresiasinya!');
  };

  const handleSubmitReply = (commentId: string) => {
    if (!replyInput.trim()) {
      onToast('Silakan tulis balasan komentar terlebih dahulu.');
      return;
    }

    const authorName =
      replyAuthorName.trim() ||
      (currentMember?.name && currentMember?.id !== 'guest'
        ? currentMember.name
        : 'Pengurus Karang Taruna');
    const roleStr = currentMember?.role || 'Pengurus/Anggota';
    const rwStr = replyAuthorRw || currentMember?.rw || 'RW 01';

    const nowStr =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB';

    const newReplyItem: ActivityCommentReply = {
      id: `rep-${Date.now()}`,
      commentId,
      userId: currentMember?.id,
      authorName,
      authorRole: roleStr,
      authorRw: rwStr,
      replyText: replyInput.trim(),
      createdAt: nowStr,
    };

    const newCommentsList = comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReplyItem],
        };
      }
      return c;
    });

    setComments(newCommentsList);
    setReplyInput('');
    setReplyingToCommentId(null);

    try {
      localStorage.setItem(`kt_comments_${activity?.id}`, JSON.stringify(newCommentsList));
    } catch {}

    if (activity && onUpdateActivity) {
      onUpdateActivity(
        { ...activity, comments: newCommentsList },
        'Balasan komentar berhasil dikirim!'
      );
    } else {
      onToast('Balasan komentar berhasil dikirim!');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const targetComment = comments.find((c) => c.id === commentId);
    if (!targetComment || !canDeleteComment(targetComment)) {
      onToast('Anda tidak memiliki izin untuk menghapus komentar ini.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
    const newCommentsList = comments.filter((c) => c.id !== commentId);
    setComments(newCommentsList);
    try {
      localStorage.setItem(`kt_comments_${activity?.id}`, JSON.stringify(newCommentsList));
    } catch {}
    if (activity && onUpdateActivity) {
      onUpdateActivity({ ...activity, comments: newCommentsList }, 'Komentar telah dihapus.');
    } else {
      onToast('Komentar telah dihapus.');
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const def = ACTIVITIES_DATA.find((d) => d.id === activity?.id);
    const candidate = activity?.videoUrl || def?.videoUrl || '';

    if (candidate) {
      resolvePlayableVideoUrl(candidate, activity?.id).then((playable) => {
        if (isMounted) {
          setResolvedVideoUrl(playable || candidate);
          setInputVideoUrl(candidate);
        }
      });
    } else if (activity?.id) {
      resolvePlayableVideoUrl('', activity.id).then((playable) => {
        if (isMounted) {
          setResolvedVideoUrl(playable || '');
          setInputVideoUrl(playable || '');
        }
      });
    } else {
      setResolvedVideoUrl('');
      setInputVideoUrl('');
    }
    return () => {
      isMounted = false;
    };
  }, [activity?.id, activity?.videoUrl]);

  // Video Autoplay Muted Sync: ensures browser autoplay policies succeed without blocking
  React.useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.muted = isMuted;
      if (resolvedVideoUrl) {
        const playPromise = videoPlayerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log('Autoplay muted handled:', err);
          });
        }
      }
    }
  }, [resolvedVideoUrl, isMuted]);

  // Dynamic SEO Synchronization untuk artikel/kegiatan yang sedang dibuka
  React.useEffect(() => {
    if (activity) {
      const canonicalArticleUrl = `https://karangtarunamanisjaya.my.id/#berita-${activity.id}`;
      const articleImg =
        activity.image ||
        (activity.photos && activity.photos.length > 0
          ? activity.photos[0]
          : 'https://karangtarunamanisjaya.my.id/logo.png?v=2');
      const articleSnippet =
        activity.metaDescription ||
        activity.description ||
        activity.subtitle ||
        `Dokumentasi dan informasi warta kegiatan ${activity.title} Karang Taruna Kelurahan Manis Jaya, Tangerang.`;

      updatePageSeo({
        title: activity.title,
        description: articleSnippet.slice(0, 160),
        canonicalUrl: canonicalArticleUrl,
        imageUrl: articleImg.startsWith('/') ? `https://karangtarunamanisjaya.my.id${articleImg}` : articleImg,
        type: 'article',
        articleData: {
          headline: activity.title,
          datePublished: activity.date,
          authorName: activity.author || 'Karang Taruna Manis Jaya',
          category: activity.category || activity.badge || 'Warta Pemuda',
          description: articleSnippet,
          location: activity.location,
        },
      });
    }

    return () => {
      resetDefaultSeo();
    };
  }, [activity]);

  const handleAttachPresetVideo = (preset: typeof OFFICIAL_PRESET_VIDEOS[0]) => {
    if (!canManageActivity) {
      onToast('Hanya pengurus yang berhak mengubah video liputan berita.');
      return;
    }
    setResolvedVideoUrl(preset.url);
    setInputVideoUrl(preset.url);
    setMediaViewMode('both');
    setShowPresetPicker(false);
    setShowUrlInput(false);
    if (activity && onUpdateActivity) {
      const updated: ActivityItem = {
        ...activity,
        videoUrl: preset.url,
        videoDuration: preset.duration,
      };
      onUpdateActivity(updated);
    }
    onToast(`Video "${preset.title}" (${preset.duration}s) berhasil disematkan ke berita!`);
  };

  const handleApplyVideoUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canManageActivity) {
      onToast('Hanya pengurus yang berhak mengubah video liputan berita.');
      return;
    }
    const cleanUrl = inputVideoUrl.trim();
    if (!cleanUrl) {
      onToast('Silakan masukkan link URL video yang valid.');
      return;
    }
    setResolvedVideoUrl(cleanUrl);
    setMediaViewMode('both');
    setShowUrlInput(false);
    if (activity && onUpdateActivity) {
      const updated: ActivityItem = {
        ...activity,
        videoUrl: cleanUrl,
        videoDuration: activity.videoDuration || 15,
      };
      onUpdateActivity(updated);
    }
    onToast('Link URL video berhasil diterapkan ke berita!');
  };

  const handleRemoveVideo = () => {
    if (!canManageActivity) {
      onToast('Hanya pengurus yang berhak menghapus video liputan berita.');
      return;
    }
    if (window.confirm('Hapus video dari berita ini? Berita akan kembali menampilkan mode foto & teks saja.')) {
      setResolvedVideoUrl('');
      setInputVideoUrl('');
      setMediaViewMode('photo');
      setShowUrlInput(false);
      setShowPresetPicker(false);
      if (activity && onUpdateActivity) {
        const updated: ActivityItem = {
          ...activity,
          videoUrl: undefined,
          videoDuration: undefined,
          hasLocalVideo: false,
        };
        onUpdateActivity(updated);
      }
      onToast('Video berhasil dihapus dari berita ini.');
    }
  };

  const handleModalVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canManageActivity) {
      onToast('Hanya pengurus yang berhak mengunggah video liputan berita.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !activity) return;

    setIsUploadingVideo(true);
    onToast('Memeriksa durasi video (maksimal 60 detik)...');

    try {
      const { duration, thumbnail, objectUrl } = await extractVideoMetaAndThumbnail(file);

      if (isNaN(duration) || duration <= 0) {
        setIsUploadingVideo(false);
        onToast('Format video tidak didukung atau durasi tidak terbaca.');
        return;
      }

      const durationSec = Math.round(duration);
      if (duration > 60.5) {
        setIsUploadingVideo(false);
        onToast(`⚠️ Durasi video ${durationSec} detik melebihi batas maksimal 60 detik!`);
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }

      onToast('Menyimpan video ke Media Vault & menyinkronkan ke Turso...');

      try {
        const primaryVideoUrl = await saveVideoToPrimaryStorage(file, activity.id);
        setResolvedVideoUrl(objectUrl);
        setInputVideoUrl(primaryVideoUrl);
        setMediaViewMode('both');

        const updated: ActivityItem = {
          ...activity,
          videoUrl: primaryVideoUrl,
          videoDuration: durationSec,
          image: activity.image || thumbnail,
        };

        if (onUpdateActivity) {
          onUpdateActivity(updated);
        }

        setIsUploadingVideo(false);
        onToast(`Video dokumentasi (${durationSec} detik) berhasil tersimpan di Media Vault & Turso!`);
      } catch (uploadErr) {
        console.warn('Primary video upload fallback:', uploadErr);
        try {
          const vaultRes = await uploadVideoToServerVault(file);
          const finalUrl = vaultRes.fileUrl;
          setResolvedVideoUrl(finalUrl);
          setInputVideoUrl(finalUrl);
          setMediaViewMode('both');

          await saveVideoBlobToIndexedDb(activity.id, file);

          const updated: ActivityItem = {
            ...activity,
            videoUrl: finalUrl,
            videoDuration: durationSec,
            image: activity.image || thumbnail,
          };

          if (onUpdateActivity) {
            onUpdateActivity(updated);
          }

          setIsUploadingVideo(false);
          onToast(`Video dokumentasi (${durationSec}s) berhasil ditambahkan!`);
        } catch {
          await saveVideoBlobToIndexedDb(activity.id, file);
          setResolvedVideoUrl(objectUrl);
          setInputVideoUrl(objectUrl);
          setMediaViewMode('both');

          const updated: ActivityItem = {
            ...activity,
            videoUrl: objectUrl,
            videoDuration: durationSec,
            hasLocalVideo: true,
            image: activity.image || thumbnail,
          };

          if (onUpdateActivity) {
            onUpdateActivity(updated);
          }

          setIsUploadingVideo(false);
          onToast(`Video (${durationSec}s) tersimpan di memori perangkat.`);
        }
      }
    } catch (err: any) {
      setIsUploadingVideo(false);
      onToast(err.message || 'Gagal memproses berkas video.');
    }
  };

  if (!activity) return null;

  const currentMainPhoto = selectedImage || activity.image || (activity.photos && activity.photos[0]) || '';
  const allPhotos = activity.photos && activity.photos.length > 0
    ? activity.photos
    : activity.image
    ? [activity.image]
    : [];

  const handleShare = () => {
    const text = `Warta Resmi Karang Taruna Kelurahan Manis Jaya:
"${activity.title}"
🗓 ${activity.date}${activity.time ? ` · ${activity.time} WIB` : ''}
📍 ${activity.location}
Penanggung Jawab: ${activity.author}

${activity.subtitle ? `${activity.subtitle}\n\n` : ''}${activity.description}`;
    navigator.clipboard?.writeText(text);
    onToast('Rangkuman warta dan rilis pers berhasil disalin ke clipboard!');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*DOKUMENTASI KEGIATAN KARANG TARUNA MANIS JAYA*\n\n*${activity.title}*\n🗓 Tanggal: ${activity.date}${activity.time ? ` (${activity.time} WIB)` : ''}\n📍 Lokasi: ${activity.location}\n👤 Penanggung Jawab: ${activity.author}\n\n${activity.description}`
    );
    const url = `https://api.whatsapp.com/send?text=${text}`;
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      navigator.clipboard?.writeText(decodeURIComponent(text));
      onToast('Teks warta telah disalin ke clipboard!');
    }
  };

  const handlePrint = () => {
    if (printableRef.current) {
      printElementDirectly(printableRef.current);
      onToast('Membuka dialog cetak dokumen warta resmi...');
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsExportingPdf(true);
    onToast('Menyusun lembar PDF dokumen dokumentasi berita...');

    const cleanTitle = activity.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `Warta_${cleanTitle}_${activity.date.replace(/\s+/g, '_')}.pdf`;

    const success = await downloadElementAsPdf(printableRef.current, filename, (status) => {
      onToast(status);
    });

    setIsExportingPdf(false);
    if (success) {
      onToast(`Dokumen PDF "${filename}" berhasil diunduh!`);
    } else {
      onToast('Gagal membuat PDF. Coba gunakan tombol Cetak.');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus berita / kegiatan "${activity.title}"?`)) {
      onDelete?.(activity.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] text-slate-800">
          {/* Top Sticky Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
            <div className="space-y-1.5 max-w-[80%]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activity.category || activity.badge}
                </span>
                {activity.priority && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activity.priority === 'Mendesak'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : activity.priority === 'Penting'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.priority}
                  </span>
                )}
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {activity.date}
                </span>
                {activity.time && (
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {activity.time} WIB
                  </span>
                )}
                {avgRating > 0 && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>{avgRating} ({totalRatingsCount})</span>
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {activity.title}
              </h1>

              {activity.subtitle && (
                <p className="text-xs sm:text-sm font-medium text-slate-500 italic">
                  {activity.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                title="Unduh Berkas PDF Resmi"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                title="Cetak Lembar Warta / PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                title="Salin Rangkuman Berita"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {canManageActivity && onToggleArchive && (
                <button
                  type="button"
                  onClick={() => onToggleArchive(activity)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    activity.isArchived
                      ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                      : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                  title={
                    activity.isArchived
                      ? 'Pulihkan dari Arsip ke Dashboard Utama'
                      : 'Pindahkan ke Arsip Kegiatan'
                  }
                >
                  {activity.isArchived ? (
                    <ArchiveRestore className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                </button>
              )}
              {canManageActivity && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Berita"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
            {activity.isArchived && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold block text-slate-900">
                      Kegiatan Berada di Kategori Arsip
                    </span>
                    <span className="text-amber-800">
                      Kegiatan ini telah selesai dilaksanakan{' '}
                      {activity.archivedAt ? `(${activity.archivedAt})` : ''} dan tidak memenuhi dashboard utama.
                    </span>
                  </div>
                </div>
                {canManageActivity && onToggleArchive && (
                  <button
                    type="button"
                    onClick={() => onToggleArchive(activity)}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Pulihkan ke Dashboard</span>
                  </button>
                )}
              </div>
            )}

            {/* Hidden Video Input */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleModalVideoUpload}
              className="hidden"
            />

            {/* Media Mode Switcher (Video & Foto) + Quick Video Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                {resolvedVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaViewMode('both')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mediaViewMode === 'both'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Video & Foto</span>
                  </button>
                )}
                {resolvedVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaViewMode('video')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mediaViewMode === 'video'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Hanya Video</span>
                  </button>
                )}
                {currentMainPhoto && (
                  <button
                    type="button"
                    onClick={() => setMediaViewMode('photo')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mediaViewMode === 'photo'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Hanya Foto ({allPhotos.length})</span>
                  </button>
                )}
              </div>

              {/* Action buttons: Video URL, Upload File, Preset, & Remove Video (Hanya Pengurus) */}
              {canManageActivity && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      showUrlInput
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
                    }`}
                    title="Masukkan link video (URL MP4, WebM, atau YouTube)"
                  >
                    <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{resolvedVideoUrl ? 'Ganti URL' : '+ URL Video'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUploadingVideo}
                    onClick={() => videoInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-[11px] font-bold border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                    title="Pilih berkas video dari perangkat (Maks. 60 Detik)"
                  >
                    {isUploadingVideo ? (
                      <>
                        <span className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-rose-600" />
                        <span>{resolvedVideoUrl ? 'Ganti Berkas' : '+ Berkas Video'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(!showPresetPicker)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      showPresetPicker
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                    }`}
                    title="Pilih contoh video liputan resmi Karang Taruna"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preset Video</span>
                  </button>

                  {resolvedVideoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 text-[11px] font-bold border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                      title="Hapus video dari berita ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Input Video URL Panel */}
            {showUrlInput && (
              <form
                onSubmit={handleApplyVideoUrl}
                className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200 rounded-2xl space-y-2.5 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-indigo-600" />
                    <span>Masukkan Link URL Video Dokumentasi (MP4 / WebM / YouTube):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputVideoUrl}
                      onChange={(e) => setInputVideoUrl(e.target.value)}
                      placeholder="Contoh: /filebase_vault/video/video_baksos_manisjaya.mp4 atau https://youtu.be/..."
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                    <FileVideo className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-2.5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      Terapkan URL
                    </button>
                    {resolvedVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-indigo-100/80 text-[10px] text-indigo-800">
                  <span className="font-semibold">Preset Cepat:</span>
                  {OFFICIAL_PRESET_VIDEOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputVideoUrl(p.url);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white/90 hover:bg-indigo-100 border border-indigo-200 font-medium transition-colors cursor-pointer"
                    >
                      {p.tag}
                    </button>
                  ))}
                </div>
              </form>
            )}

            {/* Dropdown Preset Video Selector */}
            {showPresetPicker && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>Pilih Preset Video Liputan Resmi Karang Taruna:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {OFFICIAL_PRESET_VIDEOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAttachPresetVideo(preset)}
                      className="p-2.5 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-blue-100 hover:border-blue-600 text-left transition-all group shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-800 group-hover:bg-white/20 group-hover:text-white">
                          {preset.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-blue-200 font-mono">
                          ⏱️ {preset.duration}s
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-800 group-hover:text-white line-clamp-1">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-slate-500 group-hover:text-blue-100 line-clamp-1 mt-0.5">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Banner jika belum ada video (Opsi Menambahkan Video - Hanya Pengurus) */}
            {canManageActivity && !resolvedVideoUrl && (
              <div className="p-3.5 bg-gradient-to-r from-slate-50 via-rose-50/40 to-indigo-50/40 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Video Liputan Berita (Opsional)
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Sematkan video liputan singkat melalui Link URL atau berkas video lokal (maks. 60 detik).
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Link URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(true)}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Preset</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Visual Display: Video & Foto */}
            <div className="space-y-4">
              {/* Video Player Display */}
              {resolvedVideoUrl && (mediaViewMode === 'both' || mediaViewMode === 'video') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-rose-600" />
                        <span>Video Dokumentasi Liputan (≤60 Detik)</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        ⏱️ {activity.videoDuration ? `${activity.videoDuration} Detik` : 'Video Singkat'}
                      </span>
                    </div>

                    {/* Mute status / Toggle Sound Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);
                        if (videoPlayerRef.current) {
                          videoPlayerRef.current.muted = nextMuted;
                          if (!nextMuted && videoPlayerRef.current.paused) {
                            videoPlayerRef.current.play().catch(() => {});
                          }
                        }
                        onToast(nextMuted ? 'Suara video disenyapkan (Muted)' : 'Suara video dibuka (Unmuted)');
                      }}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                          <span>Senyap (Auto-Play)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Suara Aktif</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-900 bg-black aspect-[16/9] flex items-center justify-center shadow-lg relative group">
                    {resolvedVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${resolvedVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)![1]}?autoplay=1&mute=1&playsinline=1`}
                        title="Video Liputan"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          ref={videoPlayerRef}
                          src={resolvedVideoUrl}
                          controls
                          autoPlay
                          muted={isMuted}
                          playsInline
                          loop
                          poster={currentMainPhoto || resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg')}
                          preload="auto"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.tried) {
                              target.dataset.tried = '1';
                              target.src = resolveAssetUrl('/filebase_vault/video/video_baksos_manisjaya.mp4');
                              target.load();
                            }
                          }}
                          className="w-full h-full object-contain"
                        />

                        {/* Floating Unmute Button Overlay */}
                        <div className="absolute top-3 right-3 z-20 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => {
                              const nextMuted = !isMuted;
                              setIsMuted(nextMuted);
                              if (videoPlayerRef.current) {
                                videoPlayerRef.current.muted = nextMuted;
                                if (!nextMuted && videoPlayerRef.current.paused) {
                                  videoPlayerRef.current.play().catch(() => {});
                                }
                              }
                              onToast(nextMuted ? 'Suara video disenyapkan' : 'Suara video diaktifkan');
                            }}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md shadow-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isMuted
                                ? 'bg-black/80 text-amber-300 border-amber-400/50 hover:bg-black hover:scale-105'
                                : 'bg-emerald-600/90 text-white border-emerald-400 hover:bg-emerald-600'
                            }`}
                            title={isMuted ? 'Video berputar tanpa suara (Muted). Klik untuk membuka audio.' : 'Klik untuk senyapkan suara.'}
                          >
                            {isMuted ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                <span>🔇 Buka Suara</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-white" />
                                <span>🔊 Suara Aktif</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photo Gallery Display */}
              {(currentMainPhoto || resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg')) && (mediaViewMode === 'both' || mediaViewMode === 'photo' || !resolvedVideoUrl) && (
                <div className="space-y-2">
                  {resolvedVideoUrl && mediaViewMode === 'both' && (
                    <div className="flex items-center justify-between px-1 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Dokumentasi Foto Lapangan ({Math.max(1, allPhotos.length)} Foto)</span>
                      </span>
                    </div>
                  )}
                  <div
                    onClick={() => setLightboxOpen(true)}
                    className="rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-100 shadow-inner relative group cursor-pointer"
                    title="Klik untuk memperbesar foto dokumentasi"
                  >
                    <img
                      src={currentMainPhoto || resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg')}
                      alt={activity.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.tried) {
                          target.dataset.tried = '1';
                          target.src = resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg');
                        } else if (target.dataset.tried === '1') {
                          target.dataset.tried = '2';
                          target.src = resolveAssetUrl('/hero_karang_taruna_1790587873230.jpg');
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Perbesar Foto
                      </span>
                    </div>
                  </div>

                  {/* Gallery thumbnails selector */}
                  {allPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {allPhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(photo)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            currentMainPhoto === photo
                              ? 'border-blue-600 shadow-md scale-95'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={photo}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!resolvedVideoUrl && !currentMainPhoto && (
                <div className="rounded-2xl border border-dashed border-slate-300 aspect-[16/7] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                  <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    Dokumentasi Berita & Agenda Resmi
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Rapat koordinasi dan liputan internal Karang Taruna Kelurahan Manis Jaya.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              {/* Lokasi */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lokasi Pelaksanaan
                </span>
                <div className="flex items-start gap-1.5 text-slate-800 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{activity.location}</span>
                </div>
                {activity.mapsUrl && (
                  <a
                    href={activity.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold pt-0.5"
                  >
                    <span>Lihat Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Penanggung Jawab */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Penanggung Jawab / PIC
                </span>
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{activity.author}</span>
                </div>
                {activity.targetSasaran && (
                  <p className="text-[11px] text-slate-500">
                    Sasaran: <strong>{activity.targetSasaran}</strong>
                  </p>
                )}
              </div>

              {/* Anggaran & Peserta */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Partisipasi & Anggaran
                </span>
                {activity.budget ? (
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Rp {activity.budget.toLocaleString('id-ID')}</span>
                  </div>
                ) : null}
                {activity.estimatedAttendees ? (
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimasi: {activity.estimatedAttendees} Orang</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tags */}
            {activity.tags && activity.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Kata Kunci:
                </span>
                {activity.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Video Liputan & Dokumentasi (Durasi Maksimal 60 Detik) */}
            {resolvedVideoUrl ? (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Video Liputan & Dokumentasi
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      ⏱️ {activity.videoDuration ? `${activity.videoDuration} Detik` : 'Maks. 60 Detik'}
                    </span>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors"
                    >
                      Ganti
                    </button>
                  </div>
                </div>

                {resolvedVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner">
                    <iframe
                      src={`https://www.youtube.com/embed/${resolvedVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)![1]}`}
                      title="Video Liputan"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-xl overflow-hidden bg-black max-h-96 flex items-center justify-center">
                    <video
                      src={resolvedVideoUrl}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Dokumentasi Video Liputan (Maksimal 60 Detik)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Belum Terpasang
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Lengkapi warta berita ini dengan rekaman video kegiatan singkat atau pilih cuplikan resmi Karang Taruna:
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video Liputan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilih dari Preset Video Resmi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Detailed Narrative Description */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Narasi & Liputan Lengkap Berita
              </span>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {activity.content || activity.description}
              </div>
            </div>

            {/* Key Quote / Pernyataan Pers */}
            {activity.keyQuote?.quote && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-2xl border border-blue-200/80 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-blue-500 font-serif leading-none">“</span>
                  <div className="space-y-2 flex-1">
                    <p className="italic text-slate-800 leading-relaxed font-medium">
                      {activity.keyQuote.quote}
                    </p>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {activity.keyQuote.person}{' '}
                      <span className="font-semibold text-blue-600">
                        — {activity.keyQuote.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Susunan Acara (Rundown) */}
            {activity.rundown && activity.rundown.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Susunan Acara / Rundown Pelaksanaan
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Agenda Kegiatan</th>
                        <th className="py-2.5 px-3">Penanggung Jawab (PIC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activity.rundown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600 text-[11px]">
                            {item.time}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">
                            {item.activity}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {item.pic}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIP Guests & Sponsor (if available) */}
            {((activity.vipGuests && activity.vipGuests.length > 0) || (activity.sponsors && activity.sponsors.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activity.vipGuests && activity.vipGuests.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tamu Kehormatan & Pejabat Hadir:
                    </span>
                    <ul className="space-y-1">
                      {activity.vipGuests.map((g, i) => (
                        <li key={i} className="text-slate-800 font-semibold flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{g.name} <span className="font-normal text-slate-500">({g.role || g.title || ''})</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.sponsors && activity.sponsors.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Sponsor & Mitra Kolaborasi:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.sponsors.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px]">
                          {s.name} ({s.tier})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sistem Rating Bintang (1 - 5) & Evaluasi Kegiatan Anggota */}
            <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 rounded-3xl border border-amber-200/80 p-4 sm:p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Evaluasi & Rating Bintang Kegiatan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        1 - 5 Bintang
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Penilaian dan masukan dari anggota/warga terhadap kegiatan yang telah dilaksanakan.
                    </p>
                  </div>
                </div>

                {avgRating > 0 && (
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-2xl border border-amber-200 shadow-2xs">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(avgRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-800">{avgRating} / 5.0</span>
                    <span className="text-[10px] text-slate-400">({totalRatingsCount} Penilaian)</span>
                  </div>
                )}
              </div>

              {/* Statistics Overview & Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Score Summary Box (col-span-5) */}
                <div className="md:col-span-5 bg-white rounded-2xl p-4 border border-amber-100/90 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="text-center py-2 bg-gradient-to-b from-amber-50/50 to-transparent rounded-xl">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {avgRating > 0 ? avgRating : '0.0'}
                    </div>
                    <div className="flex items-center justify-center gap-1 my-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-5 h-5 ${
                            s <= Math.round(avgRating)
                              ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {totalRatingsCount > 0
                        ? `Berdasarkan ${totalRatingsCount} ulasan penilaian`
                        : 'Belum ada penilaian. Jadilah yang pertama menilai!'}
                    </p>
                  </div>

                  {/* Distribution Progress Bars */}
                  <div className="space-y-1.5 text-xs">
                    {ratingBreakdown.map((row) => (
                      <div key={row.star} className="flex items-center gap-2">
                        <span className="w-12 text-[11px] font-bold text-slate-600 flex items-center gap-0.5">
                          <span>{row.star}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${row.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] font-medium text-slate-400">
                          {row.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Star Rating Input Form (col-span-7) */}
                <div className="md:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-amber-100/90 shadow-2xs space-y-4">
                  <form onSubmit={handleSubmitRating} className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <PenLine className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pilih Penilaian Anda (1 - 5 Bintang):</span>
                        </label>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STAR_DESCRIPTIONS[hoverStar || starRating].color}`}>
                          {STAR_DESCRIPTIONS[hoverStar || starRating].badge}
                        </span>
                      </div>

                      {/* Interactive Star Buttons */}
                      <div className="flex items-center gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isActive = starVal <= (hoverStar || starRating);
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setStarRating(starVal)}
                              onMouseEnter={() => setHoverStar(starVal)}
                              onMouseLeave={() => setHoverStar(0)}
                              className="p-1 rounded-xl transition-transform hover:scale-115 focus:outline-none cursor-pointer"
                              title={`Beri ${starVal} Bintang`}
                            >
                              <Star
                                className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                                  isActive
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                    : 'text-slate-200 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Star Description Hint */}
                      <p className="text-[11px] text-slate-600 font-medium bg-amber-50/80 p-2 rounded-xl border border-amber-100/80 mt-1">
                        <strong className="text-slate-800">{hoverStar || starRating} Bintang:</strong>{' '}
                        {STAR_DESCRIPTIONS[hoverStar || starRating].desc}
                      </p>
                    </div>

                    {/* Form Identity Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nama Anggota / Penilai:
                        </label>
                        <input
                          type="text"
                          required
                          value={memberNameInput}
                          onChange={(e) => setMemberNameInput(e.target.value)}
                          placeholder="Contoh: Budi Prasetyo"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Asal RW / Jabatan:
                        </label>
                        <input
                          type="text"
                          value={memberRwInput}
                          onChange={(e) => setMemberRwInput(e.target.value)}
                          placeholder="Contoh: RW 05 / Sie Humas"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Review Feedback Textarea */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Catatan Evaluasi / Ulasan (Opsional):
                      </label>
                      <textarea
                        rows={2}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Tuliskan kesan, apresiasi, atau saran untuk panitia kegiatan..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 resize-none"
                      />
                    </div>

                    {/* Detailed Aspects Toggle */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setShowAspects(!showAspects)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{showAspects ? 'Sembunyikan Evaluasi Aspek Spesifik' : '+ Beri Nilai Aspek Detail (Organisasi, Manfaat, Kekompakan)'}</span>
                      </button>

                      {showAspects && (
                        <div className="mt-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-700 block mb-1">
                              Kerapian Acara:
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setAspectOrg(val)}
                                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    aspectOrg === val
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {val}★
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-700 block mb-1">
                              Manfaat Warga:
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setAspectImpact(val)}
                                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    aspectImpact === val
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {val}★
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-700 block mb-1">
                              Kekompakan Tim:
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setAspectEnthusiasm(val)}
                                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    aspectEnthusiasm === val
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {val}★
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRating}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Kirim Penilaian ({starRating} Bintang)</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Reviews List */}
              {ratings.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ulasan Penilaian Anggota ({ratings.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Diurutkan berdasarkan ulasan terbaru
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ratings.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 hover:border-amber-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                              {rev.memberName ? rev.memberName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {rev.memberName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {rev.role || 'Anggota'} {rev.rw ? `· ${rev.rw}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.feedback && (
                          <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                            "{rev.feedback}"
                          </p>
                        )}

                        {rev.aspects && (
                          <div className="flex items-center gap-1.5 flex-wrap text-[9px] text-slate-600">
                            {rev.aspects.organization && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                                Acara: {rev.aspects.organization}★
                              </span>
                            )}
                            {rev.aspects.impact && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                Manfaat: {rev.aspects.impact}★
                              </span>
                            )}
                            {rev.aspects.enthusiasm && (
                              <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                                Kompak: {rev.aspects.enthusiasm}★
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                          <span>{rev.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleHelpful(rev.id)}
                            className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                              helpfulLikes[rev.id]
                                ? 'text-blue-600'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Bermanfaat {helpfulLikes[rev.id] ? '(1)' : ''}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ruang Diskusi & Komentar Kegiatan */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-3xl p-4 sm:p-6 border border-blue-100 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Ruang Diskusi & Komentar Kegiatan
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        {comments.length} Komentar
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Wadah interaktif anggota dan warga untuk mengajukan pertanyaan, saran/masukan, atau berdiskusi seputar kegiatan ini.
                    </p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 text-[11px] font-bold">
                  {(
                    [
                      { key: 'semua', label: 'Semua', count: comments.length },
                      {
                        key: 'pertanyaan',
                        label: 'Pertanyaan',
                        count: comments.filter((c) => c.type === 'pertanyaan').length,
                      },
                      {
                        key: 'masukan',
                        label: 'Masukan',
                        count: comments.filter((c) => c.type === 'masukan').length,
                      },
                      {
                        key: 'diskusi',
                        label: 'Diskusi',
                        count: comments.filter((c) => c.type === 'diskusi' || !c.type).length,
                      },
                      {
                        key: 'apresiasi',
                        label: 'Apresiasi',
                        count: comments.filter((c) => c.type === 'apresiasi').length,
                      },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCommentFilter(tab.key)}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        commentFilter === tab.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Komentar Baru */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-2xs space-y-3.5">
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <PenLine className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kirim Komentar / Pertanyaan / Masukan:</span>
                    </label>

                    {/* Kategori Pilihan */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Jenis:</span>
                      {(
                        [
                          { key: 'diskusi', label: '💬 Diskusi', color: 'blue' },
                          { key: 'pertanyaan', label: '❓ Pertanyaan', color: 'amber' },
                          { key: 'masukan', label: '💡 Masukan / Saran', color: 'emerald' },
                          { key: 'apresiasi', label: '❤️ Apresiasi', color: 'rose' },
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setCommentCategory(cat.key)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            commentCategory === cat.key
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Identitas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nama Lengkap / Panggilan:
                      </label>
                      <input
                        type="text"
                        required
                        value={commentAuthorName}
                        onChange={(e) => setCommentAuthorName(e.target.value)}
                        placeholder="Contoh: Rian Saputra"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Asal Wilayah (RW 01 s/d RW 05):
                      </label>
                      <select
                        value={commentAuthorRw}
                        onChange={(e) => setCommentAuthorRw(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                      >
                        <option value="RW 01">RW 01 - Manis Jaya</option>
                        <option value="RW 02">RW 02 - Manis Jaya</option>
                        <option value="RW 03">RW 03 - Manis Jaya</option>
                        <option value="RW 04">RW 04 - Manis Jaya</option>
                        <option value="RW 05">RW 05 - Manis Jaya</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Peran / Status:
                      </label>
                      <input
                        type="text"
                        value={commentAuthorRole}
                        onChange={(e) => setCommentAuthorRole(e.target.value)}
                        placeholder="Contoh: Pengurus / Warga"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Template Rekomendasi Cepat */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                      Pilihan Topik Cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          handleApplySuggestion(
                            'Apakah ada perlengkapan khusus yang harus dibawa peserta kegiatan ini?',
                            'pertanyaan'
                          )
                        }
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        ❓ Perlengkapan apa yang perlu dibawa?
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleApplySuggestion(
                            'Usul agar panitia menambahkan sesi foto bersama seluruh pemuda di akhir acara.',
                            'masukan'
                          )
                        }
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        💡 Usul sesi foto bersama pemuda
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleApplySuggestion(
                            'Perwakilan pemuda RW kami siap hadir dan membantu kelancaran acara.',
                            'diskusi'
                          )
                        }
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        💬 Pemuda siap hadir & bantu panitia
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleApplySuggestion(
                            'Apresiasi setinggi-tingginya untuk kekompakan panitia! Acara luar biasa bermanfaat.',
                            'apresiasi'
                          )
                        }
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        ❤️ Apresiasi kekompakan panitia
                      </button>
                    </div>
                  </div>

                  {/* Isi Komentar */}
                  <div>
                    <textarea
                      rows={3}
                      required
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={
                        commentCategory === 'pertanyaan'
                          ? 'Tuliskan pertanyaan Anda mengenai kegiatan ini...'
                          : commentCategory === 'masukan'
                          ? 'Tuliskan usulan, saran, atau masukan membangun untuk panitia...'
                          : commentCategory === 'apresiasi'
                          ? 'Tuliskan kata-kata semangat dan apresiasi Anda untuk panitia...'
                          : 'Bagikan pendapat, ide, atau obrolan santai bersama rekan pemuda...'
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Komentar akan langsung tampil dan dapat direspons oleh sesama anggota.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Komentar</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Komentar */}
              <div className="space-y-3.5">
                {filteredComments.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {commentFilter === 'semua'
                        ? 'Belum ada komentar untuk kegiatan ini.'
                        : `Belum ada komentar dengan kategori "${commentFilter}".`}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Jadilah yang pertama membuka obrolan, bertanya hal teknis, atau memberikan masukan kepada panitia kegiatan!
                    </p>
                  </div>
                ) : (
                  filteredComments.map((item) => {
                    const badgeInfo = getCommentCategoryBadge(item.type);
                    const CategoryIcon = badgeInfo.icon;
                    const hasReplies = item.replies && item.replies.length > 0;
                    const isReplying = replyingToCommentId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-200 transition-colors"
                      >
                        {/* Header Komentar */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {item.authorName ? item.authorName.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 leading-tight">
                                  {item.authorName}
                                </span>
                                {item.authorRw && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                                    {item.authorRw}
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeInfo.color}`}>
                                  <CategoryIcon className="w-3 h-3" />
                                  <span>{badgeInfo.label}</span>
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {item.authorRole || 'Anggota'} · {item.createdAt}
                              </div>
                            </div>
                          </div>

                          {/* Tombol Hapus (jika pembuat atau pengurus/admin) */}
                          {canDeleteComment(item) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(item.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Hapus komentar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Isi Komentar */}
                        <div className="text-xs text-slate-800 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed font-normal">
                          {item.comment}
                        </div>

                        {/* Bar Interaksi: Suka & Balas */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleCommentLike(item.id)}
                              className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                                commentLikes[item.id]
                                  ? 'text-rose-600'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  commentLikes[item.id] ? 'fill-rose-500 text-rose-500' : ''
                                }`}
                              />
                              <span>
                                Suka {(item.likesCount || 0) + (commentLikes[item.id] || 0) > 0
                                  ? `(${(item.likesCount || 0) + (commentLikes[item.id] || 0)})`
                                  : ''}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isReplying) {
                                  setReplyingToCommentId(null);
                                } else {
                                  setReplyingToCommentId(item.id);
                                  setReplyInput('');
                                }
                              }}
                              className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              <span>{isReplying ? 'Batal Balas' : 'Balas Komentar'}</span>
                            </button>
                          </div>

                          {hasReplies && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.replies?.length} Balasan
                            </span>
                          )}
                        </div>

                        {/* Inline Form Balas */}
                        {isReplying && (
                          <div className="mt-2 p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3 text-blue-600" />
                                <span>Balas komentar {item.authorName}:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setReplyingToCommentId(null)}
                                className="text-[10px] text-slate-500 hover:text-slate-800"
                              >
                                Tutup
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Nama Anda"
                                value={replyAuthorName}
                                onChange={(e) => setReplyAuthorName(e.target.value)}
                                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800"
                              />
                              <select
                                value={replyAuthorRw}
                                onChange={(e) => setReplyAuthorRw(e.target.value)}
                                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
                              >
                                <option value="RW 01">RW 01 - Manis Jaya</option>
                                <option value="RW 02">RW 02 - Manis Jaya</option>
                                <option value="RW 03">RW 03 - Manis Jaya</option>
                                <option value="RW 04">RW 04 - Manis Jaya</option>
                                <option value="RW 05">RW 05 - Manis Jaya</option>
                              </select>
                            </div>

                            <textarea
                              rows={2}
                              value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              placeholder="Tulis balasan Anda..."
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 resize-none"
                            />

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToCommentId(null)}
                                className="px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSubmitReply(item.id)}
                                className="px-3 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim Balasan</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Threaded Replies List */}
                        {hasReplies && (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-2 pl-3 sm:pl-4 border-l-2 border-blue-200">
                            {item.replies?.map((rep) => (
                              <div
                                key={rep.id}
                                className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800">
                                      {rep.authorName}
                                    </span>
                                    {rep.authorRw && (
                                      <span className="px-1 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-mono font-bold">
                                        {rep.authorRw}
                                      </span>
                                    )}
                                    <span className="text-slate-400 text-[10px]">
                                      · {rep.authorRole || 'Pengurus'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {rep.createdAt}
                                  </span>
                                </div>
                                <p className="text-slate-700 text-xs leading-relaxed">
                                  {rep.replyText}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Contact Person */}
            {activity.contactPerson?.name && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Narahubung & Konfirmasi Informasi:
                  </span>
                  <span className="font-bold text-emerald-950 text-sm block">
                    {activity.contactPerson.name}
                  </span>
                  <span className="text-emerald-700 font-mono text-xs">
                    {activity.contactPerson.phone}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${activity.contactPerson.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activity.contactPerson.name)},%20saya%20ingin%20bertanya%20mengenai%20kegiatan%20"${encodeURIComponent(activity.title)}"`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>
            )}
          </div>

          {/* Modal Bottom Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isExportingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyiapkan PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF Resmi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak Lembar Warta</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kirim WhatsApp</span>
              </button>

              {canManageActivity && onToggleArchive && (
                <button
                  type="button"
                  onClick={() => onToggleArchive(activity)}
                  className={`px-3.5 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activity.isArchived
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}
                >
                  {activity.isArchived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pulihkan dari Arsip</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Pindahkan ke Arsip</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Fullscreen Preview for Documentation Photos */}
      {lightboxOpen && currentMainPhoto && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 text-white">
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
              {activity.title}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={currentMainPhoto}
            alt={activity.title}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-slate-300 text-xs mt-3">
            Dokumentasi Resmi Karang Taruna Kelurahan Manis Jaya • {activity.date}
          </p>
        </div>
      )}

      {/* Hidden Official Printable Document with Letterhead (KOP SURAT RESMI) */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
        <div
          ref={printableRef}
          className="w-[794px] bg-white p-10 text-slate-900 font-sans leading-relaxed text-sm"
          style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff' }}
        >
          {/* Kop Surat Resmi */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
            <div className="w-20 h-20 flex items-center justify-center border-2 border-slate-900 rounded-2xl font-black text-xl text-slate-900">
              KT
            </div>
            <div className="text-center flex-1 px-4">
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-600">
                PEMBERDAYAAN PEMUDA KELURAHAN
              </h2>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                PENGURUS KARANG TARUNA KELURAHAN MANIS JAYA
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                KECAMATAN JATIUWUNG — KOTA TANGERANG — PROVINSI BANTEN
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Sekretariat: Jl. Manis Jaya Raya No. 01 | Telp/WA: 0812-9876-5432 | Email: info@karangtarunamanisjaya.id
              </p>
            </div>
            <div className="w-20 h-20 flex items-center justify-center border border-dashed border-slate-300 rounded-2xl text-[10px] text-slate-400 text-center font-bold">
              KOTA<br />TANGERANG
            </div>
          </div>

          <div className="border-b-4 border-double border-slate-900 mb-6" />

          {/* Judul & Nomor Berita */}
          <div className="text-center space-y-1 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              DOKUMENTASI & RILIS WARTA RESMI
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2 uppercase">
              {activity.title}
            </h2>
            {activity.subtitle && (
              <p className="text-xs italic text-slate-600">{activity.subtitle}</p>
            )}
            <p className="text-[11px] text-slate-500 font-mono">
              Nomor Arsip: {activity.id.toUpperCase()}/KT-MJ/WARTA/{activity.date.replace(/\s+/g, '-')}
            </p>
          </div>

          {/* Metadata Pelaksanaan */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
            <div>
              <strong>Hari & Tanggal:</strong> {activity.date} {activity.time ? `(${activity.time} WIB)` : ''}
            </div>
            <div>
              <strong>Lokasi:</strong> {activity.location}
            </div>
            <div>
              <strong>Penanggung Jawab:</strong> {activity.author}
            </div>
            <div>
              <strong>Kategori:</strong> {activity.category || activity.badge}
            </div>
            {activity.targetSasaran && (
              <div>
                <strong>Sasaran:</strong> {activity.targetSasaran}
              </div>
            )}
            {activity.budget ? (
              <div>
                <strong>Anggaran:</strong> Rp {activity.budget.toLocaleString('id-ID')}
              </div>
            ) : null}
          </div>

          {/* Foto Dokumentasi */}
          {currentMainPhoto && (
            <div className="mb-6">
              <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Dokumentasi Lapangan:
              </div>
              <img
                src={currentMainPhoto}
                alt={activity.title}
                className="w-full h-64 object-cover rounded-xl border border-slate-300"
              />
            </div>
          )}

          {/* Narasi Liputan */}
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ulasan & Ringkasan Kegiatan:
            </div>
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line text-justify">
              {activity.content || activity.description}
            </div>
          </div>

          {/* Kutipan Pernyataan jika ada */}
          {activity.keyQuote?.quote && (
            <div className="p-3 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-xl text-xs mb-6">
              <p className="italic text-slate-800">“{activity.keyQuote.quote}”</p>
              <p className="font-bold text-slate-900 mt-1">
                — {activity.keyQuote.person} ({activity.keyQuote.role})
              </p>
            </div>
          )}

          {/* Rundown Tabel jika ada */}
          {activity.rundown && activity.rundown.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Susunan Acara (Rundown):
              </div>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left">Waktu</th>
                    <th className="border border-slate-300 p-2 text-left">Kegiatan</th>
                    <th className="border border-slate-300 p-2 text-left">PIC</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.rundown.map((r, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-mono">{r.time}</td>
                      <td className="border border-slate-300 p-2">{r.activity}</td>
                      <td className="border border-slate-300 p-2">{r.pic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kolom Tanda Tangan */}
          <div className="pt-8 mt-8 border-t border-slate-200 flex items-center justify-between text-xs text-center">
            <div className="space-y-12">
              <p>Mengetahui,<br /><strong>Ketua Karang Taruna</strong></p>
              <div>
                <p className="font-bold underline text-slate-900">ILKHAM FAUZI</p>
                <p className="text-[11px] text-slate-500">Kelurahan Manis Jaya</p>
              </div>
            </div>

            <div className="space-y-12">
              <p>Tangerang, {activity.date}<br /><strong>Sekretaris Pelaksana</strong></p>
              <div>
                <p className="font-bold underline text-slate-900">{activity.author}</p>
                <p className="text-[11px] text-slate-500">NIP/Reg: KT-MJ-{CURRENT_YEAR}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CURRENT_YEAR = new Date().getFullYear();
