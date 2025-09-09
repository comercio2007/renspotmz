
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, PlusCircle, Search } from "lucide-react";

export default function HowToUsePage() {
  // NOTA: Para alterar os vídeos, substitua os links 'src' nos iframes abaixo.
  // Pode obter o link de incorporação correto a partir do YouTube clicando em Partilhar > Incorporar.
  const videoLinks = {
    register: "https://www.youtube.com/embed/sfwyWx22ivc",
    publish: "https://www.youtube.com/embed/c1w6pNfic-4",
    search: "https://www.youtube.com/embed/sfwyWx22ivc",
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-secondary/30">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground-dark mb-4">
              Como Usar o RentSpot
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Siga os nossos tutoriais em vídeo para aprender a tirar o máximo proveito da nossa plataforma, passo a passo.
            </p>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 space-y-16">

            {/* Tutorial 1: Como se Cadastrar */}
            <Card className="overflow-hidden shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-headline">1. Como se Cadastrar na Plataforma</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Aprenda a criar a sua conta no RentSpot de forma rápida e segura para começar a anunciar ou a procurar imóveis.
                </p>
                <div className="aspect-video">
                  {/* Substitua o URL abaixo pelo seu link de vídeo do YouTube */}
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={videoLinks.register}
                    title="YouTube video player - Como se Cadastrar"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>

            {/* Tutorial 2: Como Publicar um Imóvel */}
            <Card className="overflow-hidden shadow-lg">
              <CardHeader>
                 <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-headline">2. Como Publicar o Seu Imóvel</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Siga este guia para anunciar o seu imóvel na nossa plataforma. Preencha todos os detalhes e adicione imagens de qualidade para atrair os melhores inquilinos.
                </p>
                <div className="aspect-video">
                  {/* Substitua o URL abaixo pelo seu link de vídeo do YouTube */}
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={videoLinks.publish}
                    title="YouTube video player - Como Publicar um Imóvel"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>

            {/* Tutorial 3: Como Procurar por Casa */}
            <Card className="overflow-hidden shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                    <Search className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-headline">3. Como Procurar por Casa de Aluguel ou Venda</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Descubra como usar os nossos filtros de pesquisa avançada para encontrar o imóvel perfeito que corresponda às suas necessidades e orçamento.
                </p>
                 <div className="aspect-video">
                  {/* Substitua o URL abaixo pelo seu link de vídeo do YouTube */}
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={videoLinks.search}
                    title="YouTube video player - Como Procurar por Casa"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
