"use client";

import { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { CreatePostPayload, UpdatePostPayload } from "@/types/api";
import { Post, PostStatus } from "@/types/newsfeed";
import { filesService } from "@/services/files";
import { isVideoUrl, resolveMediaUrl } from "../../utils/postMappers";

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreatePostPayload | UpdatePostPayload) => void;
  post?: Post | null;
  isSaving?: boolean;
}

interface PostFormData {
  title: string;
  content: string;
  thumbnail_url: string;
  media_urls: string[];
  status: PostStatus;
}

export function PostFormModal({ isOpen, onClose, onSave, post, isSaving }: PostFormModalProps) {
  const isEditing = Boolean(post);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    thumbnail_url: "",
    media_urls: [],
    status: PostStatus.ACTIVE,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbUploading, setThumbUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      title: post?.title || "",
      content: post?.content || "",
      thumbnail_url: post?.thumbnail_url || "",
      media_urls: post?.media_urls ?? [],
      status: post?.status || PostStatus.ACTIVE,
    });
    setErrors({});
    setUploadError("");
  }, [post, isOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ── Upload qua filesService (POST /api/v1.0/files → { responseData: { original } }) ──
  const uploadToServer = async (file: File): Promise<string> => {
    const res = await filesService.uploadFile(file);
    const filePath = res?.responseData?.original;
    if (!filePath) throw new Error(res?.message || "Tải tệp lên thất bại");
    return filePath;
  };

  const handleThumbnailUpload = async (file: File) => {
    setThumbUploading(true);
    setUploadError("");
    try {
      const filePath = await uploadToServer(file);
      setFormData((prev) => ({ ...prev, thumbnail_url: filePath }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Lỗi tải ảnh lên");
    } finally {
      setThumbUploading(false);
    }
  };

  const handleMediaUpload = async (files: FileList) => {
    setMediaUploading(true);
    setUploadError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadToServer(file));
      }
      setFormData((prev) => ({ ...prev, media_urls: [...prev.media_urls, ...uploaded] }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Lỗi tải tệp lên");
    } finally {
      setMediaUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.content.trim()) {
      nextErrors.content = "Nội dung bài viết là bắt buộc";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      title: formData.title.trim() || undefined,
      content: formData.content.trim(),
      thumbnail_url: formData.thumbnail_url.trim() || null,
      media_urls: formData.media_urls,
      ...(isEditing ? { status: formData.status } : {}),
    });
  };

  const busy = isSaving || thumbUploading || mediaUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {isSaving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Tiêu đề"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Nhập tiêu đề bài viết"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Nhập nội dung bài viết"
            rows={6}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.content ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Thumbnail */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh thumbnail</label>
            {formData.thumbnail_url ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveMediaUrl(formData.thumbnail_url)} alt="Xem trước thumbnail" className="h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: "" }))}
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-500 shadow hover:bg-red-50 transition-colors"
                  title="Xoá ảnh"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary-300 hover:bg-gray-100"
              >
                {thumbUploading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                ) : (
                  <>
                    <FiUploadCloud className="h-6 w-6 text-gray-400" />
                    <p className="text-xs text-gray-500">
                      Kéo thả hoặc <span className="text-primary-600 underline">tải ảnh lên</span>
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbnailUpload(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Media list */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh / video đính kèm</label>
            <div
              onClick={() => mediaInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) handleMediaUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary-300 hover:bg-gray-100"
            >
              {mediaUploading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
              ) : (
                <>
                  <FiUploadCloud className="h-6 w-6 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Kéo thả hoặc <span className="text-primary-600 underline">tải tệp lên</span>
                  </p>
                  <p className="text-[11px] text-gray-400">Có thể chọn nhiều ảnh/video</p>
                </>
              )}
            </div>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleMediaUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {uploadError && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{uploadError}</p>
        )}

        {formData.media_urls.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {formData.media_urls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {isVideoUrl(url) ? (
                  <video src={resolveMediaUrl(url)} className="h-24 w-full bg-black object-contain" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(url)} alt="Xem trước media" className="h-24 w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50 transition-colors"
                  title="Xoá"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isEditing && (
          <Select
            label="Trạng thái"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: PostStatus.ACTIVE, label: "Đang hiển thị" },
              { value: PostStatus.INACTIVE, label: "Đã ẩn" },
            ]}
          />
        )}
      </div>
    </Modal>
  );
}
