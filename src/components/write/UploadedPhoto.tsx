interface UploadedPhotoProps {
  imageUrl: string;
}

export default function UploadedPhoto({ imageUrl }: UploadedPhotoProps) {
  return (
    <div className="flex justify-center items-center w-full py-4 mb-2">
      <div className="relative w-[254px] h-[254px]">
        {/* 메인 사진 */}
        <img src={imageUrl} className="w-full h-full object-cover rounded-[24px]" />

        {/* 장식 에셋 1 */}
        <img src="/assets/icons/leaf-1.svg" className="absolute top-4 -left-10 w-18 h-18" />

        {/* 장식 에셋 2 */}
        <img src="/assets/icons/leaf-2.svg" className="absolute bottom-6 -right-12 w-20 h-20" />
      </div>
    </div>
  );
}
