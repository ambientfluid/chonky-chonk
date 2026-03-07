import Image from "next/image";
import { Card } from "@/components/ui/Card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bubblegum-100 via-grape-50 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-[slide-up_0.3s_ease-out]">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/chonky-chonk.png"
            alt="Chonky Chonk Game Bonk"
            width={223}
            height={76}
            priority
          />
        </div>

        <Card className="p-8">{children}</Card>
      </div>
    </div>
  );
}
