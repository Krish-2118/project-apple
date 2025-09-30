import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceHolderImage(id: string): ImagePlaceholder {
    const normalizedId = id.toLowerCase();
    const image = PlaceHolderImages.find(img => img.id === normalizedId);
    if (image) {
        return image;
    }
    // Return a default image if no specific image is found
    return PlaceHolderImages.find(img => img.id === 'default')!;
}
