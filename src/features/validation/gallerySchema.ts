import * as z from "zod";

// form foto galeri (sama dengan createGallerySchema / updateGallerySchema di BE)
export const gallerySchema = z.object({
  caption: z.string().trim().max(255, "Caption must be at most 255 characters"),
  isActive: z.boolean(),
});

export type GalleryInput = z.infer<typeof gallerySchema>;
