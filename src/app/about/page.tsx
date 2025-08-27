
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building, Target, Users, Handshake } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-headline text-primary-foreground-dark">
              Sobre o RentSpot
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              A conectar pessoas a lares, simplificando a experiência de aluguel em Moçambique com tecnologia, confiança e transparência.
            </p>
          </div>
        </section>

        {/* Mission and Vision Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold font-headline mb-4">A Nossa Missão</h2>
                <p className="text-muted-foreground mb-4">
                  A nossa missão é revolucionar o mercado de aluguel em Moçambique, tornando-o mais acessível, seguro e eficiente para todos. Queremos eliminar as barreiras e a complexidade do processo de aluguel, oferecendo uma plataforma centralizada onde inquilinos e proprietários se podem conectar com confiança.
                </p>
                <p className="text-muted-foreground">
                  Acreditamos que encontrar o lar perfeito ou o inquilino ideal não deveria ser uma tarefa stressante. Por isso, investimos em tecnologia intuitiva e num serviço de apoio ao cliente dedicado para garantir uma experiência tranquila e satisfatória.
                </p>
              </div>
              <div className="bg-secondary/50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold font-headline mb-4">A Nossa Visão</h3>
                <p className="text-muted-foreground">
                  Ser a plataforma de aluguel líder e de maior confiança em Moçambique, reconhecida pela inovação, integridade e pelo impacto positivo que criamos nas comunidades que servimos. Aspiramos a um futuro onde cada transação de aluguel seja transparente e justa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">O Que Oferecemos</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
                Fornecemos as ferramentas e os recursos necessários para uma experiência de aluguel sem complicações.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Building className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline">Para Inquilinos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Descubra uma vasta seleção de imóveis verificados. Use os nossos filtros avançados para encontrar a casa que corresponde exatamente às suas necessidades e orçamento. Agende visitas e comunique diretamente com os proprietários de forma segura.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                   <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline">Para Proprietários</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    Anuncie os seus imóveis para uma vasta audiência de potenciais inquilinos. Gira os seus anúncios, comunique com interessados e encontre o inquilino ideal de forma rápida e eficiente, com todo o suporte da nossa plataforma.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                   <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Handshake className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline">Confiança e Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">
                    Priorizamos a sua segurança. Com perfis de usuário, um sistema de mensagens seguro e um foco na verificação de anúncios, criamos um ambiente de confiança para que possa alugar com tranquilidade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
