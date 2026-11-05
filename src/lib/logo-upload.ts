export async function prepareLogo(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Gunakan gambar PNG, JPG, atau WebP.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const value = new Image();
      value.onload = () => resolve(value);
      value.onerror = () => reject(new Error("Gambar tidak dapat dibaca. Pilih file gambar lain."));
      value.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight) throw new Error("Gambar tidak valid.");
    const factor = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * factor));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * factor));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const output = canvas.toDataURL("image/png");
    if (output.length > 400000) throw new Error("Gambar terlalu kompleks. Gunakan gambar dengan ukuran lebih kecil.");
    return output;
  } finally { URL.revokeObjectURL(url); }
}
