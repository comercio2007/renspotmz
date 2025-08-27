export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  bairro: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  listingType: 'Para Alugar' | 'Para Venda';
  status: 'Para Alugar' | 'Alugado' | 'À Venda' | 'Vendido';
  images: string[];
  amenities: string[];
  contactPhone: string;
  ownerId?: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  createdAt?: object | number;
  updatedAt?: object | number;
};

export const properties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno no Centro da Cidade',
    description: 'Um belo e moderno apartamento localizado no coração da cidade. Perto de todas as comodidades, transportes públicos e entretenimento.',
    location: 'Maputo',
    bairro: 'Polana',
    price: 25000,
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    listingType: 'Para Alugar',
    status: 'Para Alugar',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Ar Condicionado', 'Varanda', 'Piscina', 'Segurança 24h'],
    contactPhone: '+258834981730',
  },
  {
    id: '2',
    title: 'Casa Espaçosa com Jardim',
    description: 'Uma casa grande e confortável, perfeita para famílias. Possui um belo jardim privado e uma espaçosa área de estar.',
    location: 'Maputo',
    bairro: 'Sommerschield',
    price: 45000,
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    listingType: 'Para Alugar',
    status: 'Para Alugar',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Jardim Privado', 'Estacionamento', 'Aceita Animais', 'Totalmente Mobilada'],
    contactPhone: '+258834981730',
  },
  {
    id: '3',
    title: 'Estúdio Aconchegante Perto da Universidade',
    description: 'Um estúdio compacto e aconchegante, ideal para estudantes ou jovens profissionais. Totalmente mobilado e pronto a habitar.',
    location: 'Maputo',
    bairro: 'Malhangalene',
    price: 15000,
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    listingType: 'Para Alugar',
    status: 'Para Alugar',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Wi-Fi Incluído', 'Kitchenette', 'Perto de Transportes Públicos'],
    contactPhone: '+258834981730',
  },
  {
    id: '4',
    title: 'Vivenda de Luxo com Vista para o Mar',
    description: 'Viva uma vida de luxo nesta deslumbrante vivenda com vistas deslumbrantes para o mar. Inclui piscina privada e acabamentos de alta qualidade.',
    location: 'Matola',
    bairro: 'Costa do Sol',
    price: 5500000,
    bedrooms: 5,
    bathrooms: 5,
    area: 500,
    listingType: 'Para Venda',
    status: 'À Venda',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Vista para o Mar', 'Piscina Privada', 'Cinema em Casa', 'Jacuzzi'],
    contactPhone: '+258834981730',
  },
    {
    id: '5',
    title: 'Moradia Charmosa em Bairro Tranquilo',
    description: 'Esta encantadora moradia está localizada num bairro tranquilo e familiar. Oferece um ótimo equilíbrio entre conforto e conveniência.',
    location: 'Maputo',
    bairro: 'Triunfo',
    price: 32000,
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    listingType: 'Para Alugar',
    status: 'Para Alugar',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Condomínio Fechado', 'Parque Infantil', 'Estacionamento', 'Varanda'],
    contactPhone: '+258834981730',
  },
  {
    id: '6',
    title: 'Penthouse com Terraço na Cobertura',
    description: 'Um espetacular apartamento penthouse com um terraço privado na cobertura que oferece vistas panorâmicas da cidade. O refúgio urbano definitivo.',
    location: 'Maputo',
    bairro: 'Coop',
    price: 60000,
    bedrooms: 3,
    bathrooms: 3,
    area: 250,
    listingType: 'Para Alugar',
    status: 'Alugado',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Terraço na Cobertura', 'Vista da Cidade', 'Cozinha Moderna', 'Portaria'],
    contactPhone: '+258834981730',
  },
  {
    id: '7',
    title: 'Quarto Acessível em Apartamento Partilhado',
    description: 'Um quarto privado num apartamento partilhado limpo e bem conservado. Todas as contas incluídas. Ideal para uma pessoa solteira.',
    location: 'Maputo',
    bairro: 'Baixa',
    price: 8000,
    bedrooms: 1,
    bathrooms: 1,
    area: 20,
    listingType: 'Para Alugar',
    status: 'Para Alugar',
    images: ['https://placehold.co/800x600.png'],
    amenities: ['Todas as Contas Incluídas', 'Cozinha Partilhada', 'Wi-Fi'],
    contactPhone: '+258834981730',
  },
  {
    id: '8',
    title: 'Apartamento Novo para Venda',
    description: 'Seja o primeiro a viver neste apartamento novo num empreendimento recém-concluído. Apresenta design moderno e eletrodomésticos energeticamente eficientes.',
    location: 'Matola',
    bairro: 'Fomento',
    price: 3800000,
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    listingType: 'Para Venda',
    status: 'À Venda',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    amenities: ['Construção Nova', 'Elevador', 'Eficiência Energética', 'Estacionamento Subterrâneo'],
    contactPhone: '+258834981730',
  },
];

export const userProperties = properties.slice(0, 2);
