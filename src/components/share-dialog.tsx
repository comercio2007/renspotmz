
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
import { Copy, Check, MessageCircle } from "lucide-react"
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
        <div className="grid grid-cols-2 gap-2">
           <Button variant="outline" asChild>
                <Link href={whatsappLink} target="_blank">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Link>
           </Button>
           <Button variant="outline" asChild>
                <Link href={facebookLink} target="_blank">
                   <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                   Facebook
                </Link>
           </Button>
        </div>
      </div>
    </DialogContent>
  )
}
