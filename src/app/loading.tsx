import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] flex flex-col items-center justify-center p-4">
      <div className="relative w-32 h-32 md:w-48 md:h-48 animate-pulse mb-8">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Porkyrios-1763088561391.png?width=512&height=512&resize=contain"
          alt="Porkyrios Logo"
          fill
          className="object-contain opacity-50 grayscale"
          priority
        />
      </div>
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Cocinando con pasión...</h2>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
