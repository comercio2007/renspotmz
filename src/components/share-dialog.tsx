
"use client"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, MessageCircle, Facebook } from "lucide-react"
import { useState } from "react"
import Link from "next/link"


const siteUrl = "https://rentspotmz.site";
const shareText = "Encontre o seu aluguel perfeito no RentSpot! A plataforma líder para descobrir os melhores imóveis para alugar na sua cidade.";
const shareTitle = "RentSpot - Encontre o Seu Aluguel Perfeito";

export function ShareDialog() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true)
      toast({
        title: "Link Copiado!",
        description: "O link do RentSpot foi copiado para a sua área de transferência.",
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const encodedUrl = encodeURIComponent(siteUrl);
  const encodedText = encodeURIComponent(shareText);

  const whatsappLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
  const messengerLink = `fb-messenger://share/?link=${encodedUrl}&app_id=YOUR_FACEBOOK_APP_ID`; // Note: Requires a Facebook App ID for full functionality

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Partilhe o RentSpot</DialogTitle>
        <DialogDescription>
          Ajude os seus amigos a encontrar a casa perfeita. Partilhe o RentSpot com eles!
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
            <Input id="link" value={siteUrl} readOnly />
            <Button type="button" size="icon" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copiar Link</span>
            </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
           <Button variant="outline" asChild>
                <Link href={whatsappLink} target="_blank">
                    <MessageCircle className="mr-2" /> WhatsApp
                </Link>
           </Button>
           <Button variant="outline" asChild>
                <Link href={facebookLink} target="_blank">
                    <Facebook className="mr-2" /> Facebook
                </Link>
           </Button>
            <Button variant="outline" asChild>
                <Link href={messengerLink} target="_blank">
                    <MessageCircle className="mr-2" /> Messenger
                </Link>
            </Button>
        </div>
      </div>
    </DialogContent>
  )
}
