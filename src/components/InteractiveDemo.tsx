'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Bot, Check, Globe, MessageCircle, QrCode, UtensilsCrossed } from 'lucide-react';

type LangKey = 'pt' | 'en' | 'es' | 'fr';

interface MenuItem {
  id: string;
  name: string;
  price: string;
  desc: string;
  ingredients: string[];
  image: string;
  tags: ('GF' | 'V')[];
}

interface MenuSection {
  id: string;
  name: string;
  image: string;
  items: MenuItem[];
}

const UI_COPY: Record<
  LangKey,
  {
    locale: string;
    menu: string;
    intro: string;
    language: string;
    detailHint: string;
    dishDetails: string;
    ingredients: string;
    allergens: string;
    allergyNote: string;
    allergyDetail: string;
    back: string;
    close: string;
    dishes: string;
    tags: Record<'V' | 'GF', string>;
    sections: string[];
  }
> = {
  pt: {
    locale: 'pt-PT',
    menu: 'À mesa',
    intro: 'Escolha ao seu ritmo. Nós tratamos do resto.',
    language: 'Idioma',
    detailHint: 'Selecione um prato para saber mais',
    dishDetails: 'O prato em detalhe',
    ingredients: 'Ingredientes principais',
    allergens: 'Alergénios e intolerâncias',
    allergyNote: 'Tem alguma alergia ou intolerância? Fale com a nossa equipa antes de escolher.',
    allergyDetail: 'Para conhecer os alergénios e possíveis contaminações cruzadas deste prato, consulte a nossa equipa.',
    back: 'Voltar ao menu',
    close: 'Fechar detalhe',
    dishes: 'pratos',
    tags: { V: 'Vegetariano', GF: 'Sem glúten' },
    sections: [
      'Para começar e partilhar.',
      'Sabores do mar, à nossa maneira.',
      'Cortes e preparações com carácter.',
      'Um final doce, sem pressa.',
    ],
  },
  en: {
    locale: 'en-GB',
    menu: 'At the table',
    intro: 'Take your time. We’ll take care of the rest.',
    language: 'Language',
    detailHint: 'Select a dish to discover more',
    dishDetails: 'About this dish',
    ingredients: 'Main ingredients',
    allergens: 'Allergens and intolerances',
    allergyNote: 'Any allergies or intolerances? Please speak to our team before choosing.',
    allergyDetail: 'Please ask our team about allergens and possible cross-contact for this dish.',
    back: 'Back to menu',
    close: 'Close details',
    dishes: 'dishes',
    tags: { V: 'Vegetarian', GF: 'Gluten-free' },
    sections: [
      'To begin and to share.',
      'Flavours of the sea, our way.',
      'Carefully prepared cuts.',
      'A sweet finish. Take your time.',
    ],
  },
  es: {
    locale: 'es-ES',
    menu: 'A la mesa',
    intro: 'Elija sin prisa. Nosotros nos encargamos del resto.',
    language: 'Idioma',
    detailHint: 'Seleccione un plato para saber más',
    dishDetails: 'El plato en detalle',
    ingredients: 'Ingredientes principales',
    allergens: 'Alérgenos e intolerancias',
    allergyNote: '¿Tiene alguna alergia o intolerancia? Hable con nuestro equipo antes de elegir.',
    allergyDetail: 'Consulte a nuestro equipo sobre los alérgenos y la posible contaminación cruzada de este plato.',
    back: 'Volver al menú',
    close: 'Cerrar detalles',
    dishes: 'platos',
    tags: { V: 'Vegetariano', GF: 'Sin gluten' },
    sections: [
      'Para empezar y compartir.',
      'Sabores del mar, a nuestra manera.',
      'Cortes preparados con cuidado.',
      'Un final dulce, sin prisa.',
    ],
  },
  fr: {
    locale: 'fr-FR',
    menu: 'À table',
    intro: 'Prenez votre temps. Nous nous occupons du reste.',
    language: 'Langue',
    detailHint: 'Sélectionnez un plat pour en savoir plus',
    dishDetails: 'Le plat en détail',
    ingredients: 'Ingrédients principaux',
    allergens: 'Allergènes et intolérances',
    allergyNote: 'Une allergie ou une intolérance ? Parlez-en à notre équipe avant de choisir.',
    allergyDetail: 'Consultez notre équipe pour connaître les allergènes et les risques de contamination croisée de ce plat.',
    back: 'Retour au menu',
    close: 'Fermer les détails',
    dishes: 'plats',
    tags: { V: 'Végétarien', GF: 'Sans gluten' },
    sections: [
      'Pour commencer et partager.',
      'Les saveurs de la mer, à notre façon.',
      'Des viandes préparées avec soin.',
      'Une fin en douceur, sans se presser.',
    ],
  },
};

const MENU_DATA: Record<LangKey, { sections: MenuSection[] }> = {
  pt: {
    sections: [
      {
        id: 'sec-1',
        name: 'Entradas',
        image: '/menu/i1.jpg',
        items: [
          { id: 'i1', name: 'Carpaccio de Salmão', price: '14.00', desc: 'Lâminas de salmão fresco que chegam todas as manhãs, finalizadas com alcaparras crocantes e limão siciliano', ingredients: ['Salmão', 'Alcaparras', 'Limão', 'Azeite'], image: '/menu/i1.jpg', tags: ['GF'] },
          { id: 'i2', name: 'Burrata Cremosa', price: '12.50', desc: 'A autêntica Burrata de Puglia, servida com tomates cereja confitados lentamente em azeite extra virgem', ingredients: ['Burrata', 'Tomate', 'Manjericão'], image: '/menu/i2.jpg', tags: ['V'] },
          { id: 'i5', name: 'Tartare de Atum', price: '16.00', desc: 'Atum fresco picado na hora com abacate maduro, sésamo tostado e um toque subtil de gengibre', ingredients: ['Atum', 'Abacate', 'Sésamo', 'Gengibre'], image: '/menu/i5.jpg', tags: ['GF'] },
          { id: 'i6', name: 'Croquetas de Jamón', price: '11.00', desc: 'As nossas croquetas artesanais de Jamón Ibérico, com um interior cremoso de bechamel', ingredients: ['Jamón Ibérico', 'Bechamel', 'Queijo'], image: '/menu/i6.jpg', tags: [] },
          { id: 'i15', name: 'Bruschetta de Figos', price: '13.00', desc: 'Pão de fermentação natural tostado com queijo de cabra, figos frescos e mel de acácia', ingredients: ['Figo', 'Queijo de Cabra', 'Mel'], image: '/menu/i15.jpg', tags: ['V'] },
          { id: 'i16', name: 'Carpaccio de Beterraba', price: '12.00', desc: 'Beterraba assada em crosta de sal, com requeijão cremoso e nozes caramelizadas', ingredients: ['Beterraba', 'Nozes', 'Requeijão'], image: '/menu/i16.jpg', tags: ['V', 'GF'] },
        ],
      },
      {
        id: 'sec-2',
        name: 'Peixes',
        image: '/menu/i3.jpg',
        items: [
          { id: 'i3', name: 'Bacalhau Preto', price: '28.00', desc: 'Lombo de bacalhau rigorosamente curado, com uma crosta crocante de sésamo preto e batatas cozidas', ingredients: ['Bacalhau', 'Sésamo', 'Batata'], image: '/menu/i3.jpg', tags: ['GF'] },
          { id: 'i4', name: 'Robalo Grelhado', price: '24.00', desc: 'Robalo fresco grelhado no ponto certo, acompanhado por legumes da época salteados no alho', ingredients: ['Robalo', 'Legumes', 'Azeite'], image: '/menu/i4.jpg', tags: ['GF'] },
          { id: 'i7', name: 'Polvo à Lagareiro', price: '26.00', desc: 'Polvo tenro, cozido lentamente e finalizado com azeite generoso e batatas a murro', ingredients: ['Polvo', 'Azeite', 'Alho', 'Batata'], image: '/menu/i7.jpg', tags: ['GF'] },
          { id: 'i8', name: 'Salmão Glaciado', price: '22.00', desc: 'Lombo de salmão com uma glaciada artesanal de missô e gengibre, equilíbrio perfeito entre doce e salgado', ingredients: ['Salmão', 'Missô', 'Gengibre'], image: '/menu/i8.jpg', tags: ['GF'] },
          { id: 'i17', name: 'Linguine com Amêijoas', price: '21.00', desc: 'Massa fresca al dente com amêijoas da costa, alho, salsa e um toque de vinho branco', ingredients: ['Massa', 'Amêijoas', 'Vinho Branco'], image: '/menu/i17.jpg', tags: [] },
          { id: 'i18', name: 'Vieiras Seladas', price: '26.00', desc: 'Vieiras frescas seladas na manteiga de noisette, servidas sobre puré de couve-flor', ingredients: ['Vieiras', 'Manteiga', 'Couve-flor'], image: '/menu/i18.jpg', tags: ['GF'] },
        ],
      },
      {
        id: 'sec-3',
        name: 'Carnes',
        image: '/menu/i9.jpg',
        items: [
          { id: 'i9', name: 'Filete Mignon', price: '32.00', desc: 'Medalhão de vitela selecionada, servido sobre um risotto cremoso de cogumelos silvestres', ingredients: ['Vitela', 'Cogumelos', 'Arroz Arborio'], image: '/menu/i9.jpg', tags: ['GF'] },
          { id: 'i10', name: 'Costelas de Cordeiro', price: '30.00', desc: 'Cordeiro assado lentamente, com um puré rústico de ervilhas frescas e toque de menta', ingredients: ['Cordeiro', 'Ervilhas', 'Menta'], image: '/menu/i10.jpg', tags: ['GF'] },
          { id: 'i11', name: 'Wagyu Steak', price: '45.00', desc: 'Corte premium de Wagyu, selado em alta temperatura com sal Maldon e manteiga de ervas do nosso jardim', ingredients: ['Wagyu', 'Manteiga', 'Salsa'], image: '/menu/i11.jpg', tags: ['GF'] },
          { id: 'i19', name: 'Magret de Pato', price: '29.00', desc: 'Peito de pato glaciado com redução de frutos vermelhos e puré de cenoura', ingredients: ['Pato', 'Frutos Vermelhos', 'Cenoura'], image: '/menu/i19.jpg', tags: ['GF'] },
          { id: 'i20', name: 'Risotto de Carne', price: '24.00', desc: 'Arroz arborio cremoso com tiras de lombo, parmesão reggiano e toque de trufa', ingredients: ['Carne', 'Arroz', 'Trufa'], image: '/menu/i20.jpg', tags: [] },
        ],
      },
      {
        id: 'sec-4',
        name: 'Sobremesas',
        image: '/menu/i12.jpg',
        items: [
          { id: 'i12', name: 'Fondant de Chocolate', price: '10.00', desc: 'Chocolate belga fundido, com coração líquido, servido com uma bola de gelado de baunilha artesanal', ingredients: ['Chocolate', 'Baunilha', 'Ovos'], image: '/menu/i12.jpg', tags: [] },
          { id: 'i13', name: 'Cheesecake de Frutos', price: '9.00', desc: 'Cheesecake cremoso com uma calda vibrante de frutos do bosque colhidos na estação', ingredients: ['Queijo Creme', 'Frutos Vermelhos'], image: '/menu/i13.jpg', tags: ['GF'] },
          { id: 'i14', name: 'Tarte Tatin', price: '11.00', desc: 'A clássica tarte de maçã caramelizada, servida quente com uma colher de creme fraîche', ingredients: ['Maçã', 'Caramelo', 'Massa Folhada'], image: '/menu/i14.jpg', tags: [] },
          { id: 'i21', name: 'Mousse de Maracujá', price: '8.00', desc: 'Mousse leve e aerada de maracujá fresco com crocante de pistácio', ingredients: ['Maracujá', 'Pistache'], image: '/menu/i21.jpg', tags: ['GF'] },
          { id: 'i22', name: 'Pavlova de Frutos', price: '12.00', desc: 'Merengue crocante por fora e macio por dentro, com creme leve e frutas da época', ingredients: ['Claras de Ovo', 'Açúcar', 'Frutas'], image: '/menu/i22.jpg', tags: ['GF'] },
        ],
      },
    ],
  },
  en: {
    sections: [
      {
        id: 'sec-1',
        name: 'Appetizers',
        image: '/menu/i1.jpg',
        items: [
          { id: 'i1', name: 'Salmon Carpaccio', price: '14.00', desc: 'Fresh salmon slices delivered every morning, finished with crispy capers and Sicilian lemon', ingredients: ['Salmon', 'Capers', 'Lemon', 'Olive Oil'], image: '/menu/i1.jpg', tags: ['GF'] },
          { id: 'i2', name: 'Creamy Burrata', price: '12.50', desc: 'Authentic Puglia Burrata, served with cherry tomatoes slowly confited in extra virgin olive oil', ingredients: ['Burrata', 'Tomato', 'Basil'], image: '/menu/i2.jpg', tags: ['V'] },
          { id: 'i5', name: 'Tuna Tartare', price: '16.00', desc: 'Freshly chopped tuna with ripe avocado, toasted sesame and a subtle touch of ginger', ingredients: ['Tuna', 'Avocado', 'Sesame', 'Ginger'], image: '/menu/i5.jpg', tags: ['GF'] },
          { id: 'i6', name: 'Jamón Croquettes', price: '11.00', desc: 'Our artisanal Jamón Ibérico croquettes, with a creamy bechamel interior', ingredients: ['Jamón Ibérico', 'Bechamel', 'Cheese'], image: '/menu/i6.jpg', tags: [] },
          { id: 'i15', name: 'Fig Bruschetta', price: '13.00', desc: 'Toasted sourdough bread with goat cheese, fresh figs and acacia honey', ingredients: ['Fig', 'Goat Cheese', 'Honey'], image: '/menu/i15.jpg', tags: ['V'] },
          { id: 'i16', name: 'Beetroot Carpaccio', price: '12.00', desc: 'Salt-crusted roasted beetroot, with creamy cottage cheese and caramelized walnuts', ingredients: ['Beetroot', 'Walnuts', 'Cottage Cheese'], image: '/menu/i16.jpg', tags: ['V', 'GF'] },
        ],
      },
      {
        id: 'sec-2',
        name: 'Fish',
        image: '/menu/i3.jpg',
        items: [
          { id: 'i3', name: 'Black Cod', price: '28.00', desc: 'Rigorously cured cod loin, with a crispy black sesame crust and boiled potatoes', ingredients: ['Cod', 'Sesame', 'Potato'], image: '/menu/i3.jpg', tags: ['GF'] },
          { id: 'i4', name: 'Grilled Sea Bass', price: '24.00', desc: 'Fresh sea bass grilled to perfection, accompanied by seasonal vegetables sautéed in garlic', ingredients: ['Sea Bass', 'Vegetables', 'Olive Oil'], image: '/menu/i4.jpg', tags: ['GF'] },
          { id: 'i7', name: 'Octopus Lagareiro', price: '26.00', desc: 'Tender octopus, slowly cooked and finished with generous olive oil and smashed potatoes', ingredients: ['Octopus', 'Olive Oil', 'Garlic', 'Potato'], image: '/menu/i7.jpg', tags: ['GF'] },
          { id: 'i8', name: 'Glazed Salmon', price: '22.00', desc: 'Salmon loin with an artisanal miso and ginger glaze, perfect balance between sweet and salty', ingredients: ['Salmon', 'Miso', 'Ginger'], image: '/menu/i8.jpg', tags: ['GF'] },
          { id: 'i17', name: 'Linguine with Clams', price: '21.00', desc: 'Fresh al dente pasta with coastal clams, garlic, parsley and a touch of white wine', ingredients: ['Pasta', 'Clams', 'White Wine'], image: '/menu/i17.jpg', tags: [] },
          { id: 'i18', name: 'Seared Scallops', price: '26.00', desc: 'Fresh scallops seared in noisette butter, served over cauliflower puree', ingredients: ['Scallops', 'Butter', 'Cauliflower'], image: '/menu/i18.jpg', tags: ['GF'] },
        ],
      },
      {
        id: 'sec-3',
        name: 'Meat',
        image: '/menu/i9.jpg',
        items: [
          { id: 'i9', name: 'Filet Mignon', price: '32.00', desc: 'Selected veal medallion, served over a creamy wild mushroom risotto', ingredients: ['Veal', 'Mushrooms', 'Arborio Rice'], image: '/menu/i9.jpg', tags: ['GF'] },
          { id: 'i10', name: 'Lamb Chops', price: '30.00', desc: 'Slow-roasted lamb, with a rustic fresh pea puree and a touch of mint', ingredients: ['Lamb', 'Peas', 'Mint'], image: '/menu/i10.jpg', tags: ['GF'] },
          { id: 'i11', name: 'Wagyu Steak', price: '45.00', desc: 'Premium Wagyu cut, seared at high temperature with Maldon salt and herb butter from our garden', ingredients: ['Wagyu', 'Butter', 'Parsley'], image: '/menu/i11.jpg', tags: ['GF'] },
          { id: 'i19', name: 'Duck Magret', price: '29.00', desc: 'Glazed duck breast with red fruit reduction and carrot puree', ingredients: ['Duck', 'Red Fruits', 'Carrot'], image: '/menu/i19.jpg', tags: ['GF'] },
          { id: 'i20', name: 'Meat Risotto', price: '24.00', desc: 'Creamy arborio rice with filet tips, reggiano parmesan and a touch of truffle', ingredients: ['Meat', 'Rice', 'Truffle'], image: '/menu/i20.jpg', tags: [] },
        ],
      },
      {
        id: 'sec-4',
        name: 'Desserts',
        image: '/menu/i12.jpg',
        items: [
          { id: 'i12', name: 'Chocolate Fondant', price: '10.00', desc: 'Melted Belgian chocolate, with a liquid heart, served with a scoop of artisanal vanilla ice cream', ingredients: ['Chocolate', 'Vanilla', 'Eggs'], image: '/menu/i12.jpg', tags: [] },
          { id: 'i13', name: 'Fruit Cheesecake', price: '9.00', desc: 'Creamy cheesecake with a vibrant berry glaze picked in season', ingredients: ['Cream Cheese', 'Red Fruits'], image: '/menu/i13.jpg', tags: ['GF'] },
          { id: 'i14', name: 'Tarte Tatin', price: '11.00', desc: 'The classic caramelized apple tart, served warm with a dollop of crème fraîche', ingredients: ['Apple', 'Caramel', 'Puff Pastry'], image: '/menu/i14.jpg', tags: [] },
          { id: 'i21', name: 'Passion Fruit Mousse', price: '8.00', desc: 'Light and airy fresh passion fruit mousse with pistachio crunch', ingredients: ['Passion Fruit', 'Pistachio'], image: '/menu/i21.jpg', tags: ['GF'] },
          { id: 'i22', name: 'Fruit Pavlova', price: '12.00', desc: 'Crispy on the outside and soft on the inside meringue, with light cream and seasonal fruits', ingredients: ['Egg Whites', 'Sugar', 'Fruits'], image: '/menu/i22.jpg', tags: ['GF'] },
        ],
      },
    ],
  },
  es: {
    sections: [
      {
        id: 'sec-1',
        name: 'Entrantes',
        image: '/menu/i1.jpg',
        items: [
          { id: 'i1', name: 'Carpaccio de Salmón', price: '14.00', desc: 'Láminas de salmón fresco que llegan todas las mañanas, finalizadas con alcaparras crujientes y limón siciliano', ingredients: ['Salmón', 'Alcaparras', 'Limón', 'Aceite'], image: '/menu/i1.jpg', tags: ['GF'] },
          { id: 'i2', name: 'Burrata Cremosa', price: '12.50', desc: 'La auténtica Burrata de Puglia, servida con tomates cereza confitados lentamente en aceite extra virgen', ingredients: ['Burrata', 'Tomate', 'Albahaca'], image: '/menu/i2.jpg', tags: ['V'] },
          { id: 'i5', name: 'Tártara de Atún', price: '16.00', desc: 'Atún fresco picado al momento con aguacate maduro, sésamo tostado y un toque sutil de jengibre', ingredients: ['Atún', 'Aguacate', 'Sésamo', 'Jengibre'], image: '/menu/i5.jpg', tags: ['GF'] },
          { id: 'i6', name: 'Croquetas de Jamón', price: '11.00', desc: 'Nuestras croquetas artesanales de Jamón Ibérico, con un interior cremoso de bechamel', ingredients: ['Jamón Ibérico', 'Bechamel', 'Queso'], image: '/menu/i6.jpg', tags: [] },
          { id: 'i15', name: 'Bruschetta de Higos', price: '13.00', desc: 'Pan de masa madre tostado con queso de cabra, higos frescos y miel de acacia', ingredients: ['Higo', 'Queso de Cabra', 'Miel'], image: '/menu/i15.jpg', tags: ['V'] },
          { id: 'i16', name: 'Carpaccio de Remolacha', price: '12.00', desc: 'Remolacha asada en costra de sal, con requesón cremoso y nueces caramelizadas', ingredients: ['Remolacha', 'Nueces', 'Requesón'], image: '/menu/i16.jpg', tags: ['V', 'GF'] },
        ],
      },
      {
        id: 'sec-2',
        name: 'Pescados',
        image: '/menu/i3.jpg',
        items: [
          { id: 'i3', name: 'Bacalao Negro', price: '28.00', desc: 'Lomo de bacalao rigurosamente curado, con una costra crujiente de sésamo negro y patatas cocidas', ingredients: ['Bacalao', 'Sésamo', 'Patata'], image: '/menu/i3.jpg', tags: ['GF'] },
          { id: 'i4', name: 'Lubina a la Plancha', price: '24.00', desc: 'Lubina fresca asada al punto exacto, acompañada de verduras de temporada salteadas con ajo', ingredients: ['Lubina', 'Verduras', 'Aceite'], image: '/menu/i4.jpg', tags: ['GF'] },
          { id: 'i7', name: 'Pulpo a la Lagareiro', price: '26.00', desc: 'Pulpo tierno, cocido lentamente y finalizado con aceite generoso y patatas panaderas', ingredients: ['Pulpo', 'Aceite', 'Ajo', 'Patata'], image: '/menu/i7.jpg', tags: ['GF'] },
          { id: 'i8', name: 'Salmón Glaseado', price: '22.00', desc: 'Lomo de salmón con un glaseado artesanal de miso y jengibre, equilibrio perfecto entre dulce y salado', ingredients: ['Salmón', 'Miso', 'Jengibre'], image: '/menu/i8.jpg', tags: ['GF'] },
          { id: 'i17', name: 'Linguine con Almejas', price: '21.00', desc: 'Pasta fresca al dente con almejas de la costa, ajo, perejil y un toque de vino blanco', ingredients: ['Pasta', 'Almejas', 'Vino Blanco'], image: '/menu/i17.jpg', tags: [] },
          { id: 'i18', name: 'Vieiras Selladas', price: '26.00', desc: 'Vieiras frescas selladas en mantequilla de noisette, servidas sobre puré de coliflor', ingredients: ['Vieiras', 'Mantequilla', 'Coliflor'], image: '/menu/i18.jpg', tags: ['GF'] },
        ],
      },
      {
        id: 'sec-3',
        name: 'Carnes',
        image: '/menu/i9.jpg',
        items: [
          { id: 'i9', name: 'Solomillo Mignon', price: '32.00', desc: 'Medallón de ternera seleccionada, servida sobre un risotto cremoso de setas silvestres', ingredients: ['Ternera', 'Setas', 'Arroz Arborio'], image: '/menu/i9.jpg', tags: ['GF'] },
          { id: 'i10', name: 'Costillas de Cordero', price: '30.00', desc: 'Cordero asado lentamente, con un puré rústico de guisantes frescos y toque de menta', ingredients: ['Cordero', 'Guisantes', 'Menta'], image: '/menu/i10.jpg', tags: ['GF'] },
          { id: 'i11', name: 'Wagyu Steak', price: '45.00', desc: 'Corte premium de Wagyu, sellado a alta temperatura con sal Maldon y mantequilla de hierbas de nuestro jardín', ingredients: ['Wagyu', 'Mantequilla', 'Perejil'], image: '/menu/i11.jpg', tags: ['GF'] },
          { id: 'i19', name: 'Magret de Pato', price: '29.00', desc: 'Pechuga de pato glaseada con reducción de frutos rojos y puré de zanahoria', ingredients: ['Pato', 'Frutos Rojos', 'Zanahoria'], image: '/menu/i19.jpg', tags: ['GF'] },
          { id: 'i20', name: 'Risotto de Carne', price: '24.00', desc: 'Arroz arborio cremoso con puntas de solomillo, parmesano reggiano y toque de trufa', ingredients: ['Carne', 'Arroz', 'Trufa'], image: '/menu/i20.jpg', tags: [] },
        ],
      },
      {
        id: 'sec-4',
        name: 'Postres',
        image: '/menu/i12.jpg',
        items: [
          { id: 'i12', name: 'Fondant de Chocolate', price: '10.00', desc: 'Chocolate belga fundido, con corazón líquido, servida con una bola de helado de vainilla artesanal', ingredients: ['Chocolate', 'Vainilla', 'Huevos'], image: '/menu/i12.jpg', tags: [] },
          { id: 'i13', name: 'Cheesecake de Frutos', price: '9.00', desc: 'Cheesecake cremoso con una salsa vibrante de frutos del bosque recogidos en temporada', ingredients: ['Queso Crema', 'Frutos Rojos'], image: '/menu/i13.jpg', tags: ['GF'] },
          { id: 'i14', name: 'Tarte Tatin', price: '11.00', desc: 'La clásica tarta de manzana caramelizada, servida caliente con una cucharada de crème fraîche', ingredients: ['Manzana', 'Caramelo', 'Masa Hojaldrada'], image: '/menu/i14.jpg', tags: [] },
          { id: 'i21', name: 'Mousse de Maracuyá', price: '8.00', desc: 'Mousse ligera y aireada de maracuyá fresco con crocante de pistacho', ingredients: ['Maracuyá', 'Pistacho'], image: '/menu/i21.jpg', tags: ['GF'] },
          { id: 'i22', name: 'Pavlova de Frutos', price: '12.00', desc: 'Merengue crujiente por fuera y suave por dentro, con crema ligera y frutas de temporada', ingredients: ['Claras de Huevo', 'Azúcar', 'Frutas'], image: '/menu/i22.jpg', tags: ['GF'] },
        ],
      },
    ],
  },
  fr: {
    sections: [
      {
        id: 'sec-1',
        name: 'Entrées',
        image: '/menu/i1.jpg',
        items: [
          { id: 'i1', name: 'Carpaccio de Saumon', price: '14.00', desc: 'Fines tranches de saumon frais livrées chaque matin, finies avec des câpres croquantes et du citron sicilien', ingredients: ['Saumon', 'Câpres', 'Citron', "Huile d'olive"], image: '/menu/i1.jpg', tags: ['GF'] },
          { id: 'i2', name: 'Burrata Crémeuse', price: '12.50', desc: "L'authentique Burrata des Pouilles, servie avec des tomates cerises confites lentement dans l'huile d'olive extra vierge", ingredients: ['Burrata', 'Tomate', 'Basilic'], image: '/menu/i2.jpg', tags: ['V'] },
          { id: 'i5', name: 'Tartare de Thon', price: '16.00', desc: 'Thon frais haché minute avec avocat mûr, sésame grillé et une subtile touche de gingembre', ingredients: ['Thon', 'Avocat', 'Sésame', 'Gingembre'], image: '/menu/i5.jpg', tags: ['GF'] },
          { id: 'i6', name: 'Croquettes de Jamón', price: '11.00', desc: 'Nos croquettes artisanales de Jamón Ibérico, au cœur crémeux de béchamel', ingredients: ['Jamón Ibérico', 'Béchamel', 'Fromage'], image: '/menu/i6.jpg', tags: [] },
          { id: 'i15', name: 'Bruschetta aux Figues', price: '13.00', desc: "Pain au levain grillé avec fromage de chèvre, figues fraîches et miel d'acacia", ingredients: ['Figue', 'Fromage de Chèvre', 'Miel'], image: '/menu/i15.jpg', tags: ['V'] },
          { id: 'i16', name: 'Carpaccio de Betterave', price: '12.00', desc: 'Betterave rôtie en croûte de sel, fromage frais crémeux et noix caramélisées', ingredients: ['Betterave', 'Noix', 'Fromage Frais'], image: '/menu/i16.jpg', tags: ['V', 'GF'] },
        ],
      },
      {
        id: 'sec-2',
        name: 'Poissons',
        image: '/menu/i3.jpg',
        items: [
          { id: 'i3', name: 'Cabillaud Noir', price: '28.00', desc: 'Dos de cabillaud rigoureusement affiné, croûte croustillante de sésame noir et pommes de terre vapeur', ingredients: ['Cabillaud', 'Sésame', 'Pomme de terre'], image: '/menu/i3.jpg', tags: ['GF'] },
          { id: 'i4', name: 'Bar Grillé', price: '24.00', desc: "Bar frais grillé à la perfection, accompagné de légumes de saison sautés à l'ail", ingredients: ['Bar', 'Légumes', "Huile d'olive"], image: '/menu/i4.jpg', tags: ['GF'] },
          { id: 'i7', name: 'Poulpe Lagareiro', price: '26.00', desc: "Poulpe tendre, mijoté lentement et fini avec une généreuse huile d'olive et pommes de terre écrasées", ingredients: ['Poulpe', "Huile d'olive", 'Ail', 'Pomme de terre'], image: '/menu/i7.jpg', tags: ['GF'] },
          { id: 'i8', name: 'Saumon Glacé', price: '22.00', desc: 'Pavé de saumon avec un glaçage artisanal au miso et gingembre, équilibre parfait entre sucré et salé', ingredients: ['Saumon', 'Miso', 'Gingembre'], image: '/menu/i8.jpg', tags: ['GF'] },
          { id: 'i17', name: 'Linguine aux Palourdes', price: '21.00', desc: 'Pâtes fraîches al dente aux palourdes de la côte, ail, persil et une touche de vin blanc', ingredients: ['Pâtes', 'Palourdes', 'Vin Blanc'], image: '/menu/i17.jpg', tags: [] },
          { id: 'i18', name: 'Saint-Jacques Poêlées', price: '26.00', desc: 'Noix de Saint-Jacques fraîches poêlées au beurre noisette, sur purée de chou-fleur', ingredients: ['Saint-Jacques', 'Beurre', 'Chou-fleur'], image: '/menu/i18.jpg', tags: ['GF'] },
        ],
      },
      {
        id: 'sec-3',
        name: 'Viandes',
        image: '/menu/i9.jpg',
        items: [
          { id: 'i9', name: 'Filet Mignon', price: '32.00', desc: 'Médaillon de veau sélectionné, servi sur un risotto crémeux aux champignons sauvages', ingredients: ['Veau', 'Champignons', 'Riz Arborio'], image: '/menu/i9.jpg', tags: ['GF'] },
          { id: 'i10', name: "Côtelettes d'Agneau", price: '30.00', desc: 'Agneau rôti lentement, purée rustique de petits pois frais et touche de menthe', ingredients: ['Agneau', 'Petits pois', 'Menthe'], image: '/menu/i10.jpg', tags: ['GF'] },
          { id: 'i11', name: 'Wagyu Steak', price: '45.00', desc: 'Coupe premium de Wagyu, saisie à haute température au sel de Maldon et beurre aux herbes du jardin', ingredients: ['Wagyu', 'Beurre', 'Persil'], image: '/menu/i11.jpg', tags: ['GF'] },
          { id: 'i19', name: 'Magret de Canard', price: '29.00', desc: 'Magret de canard glacé avec réduction de fruits rouges et purée de carottes', ingredients: ['Canard', 'Fruits Rouges', 'Carotte'], image: '/menu/i19.jpg', tags: ['GF'] },
          { id: 'i20', name: 'Risotto à la Viande', price: '24.00', desc: 'Riz arborio crémeux aux émincés de filet, parmesan reggiano et touche de truffe', ingredients: ['Viande', 'Riz', 'Truffe'], image: '/menu/i20.jpg', tags: [] },
        ],
      },
      {
        id: 'sec-4',
        name: 'Desserts',
        image: '/menu/i12.jpg',
        items: [
          { id: 'i12', name: 'Fondant au Chocolat', price: '10.00', desc: 'Chocolat belge fondu au cœur coulant, servi avec une boule de glace artisanale à la vanille', ingredients: ['Chocolat', 'Vanille', 'Œufs'], image: '/menu/i12.jpg', tags: [] },
          { id: 'i13', name: 'Cheesecake aux Fruits', price: '9.00', desc: 'Cheesecake crémeux accompagné d’un coulis vibrant de fruits des bois de saison', ingredients: ['Fromage Frais', 'Fruits Rouges'], image: '/menu/i13.jpg', tags: ['GF'] },
          { id: 'i14', name: 'Tarte Tatin', price: '11.00', desc: 'La classique tarte aux pommes caramélisées, servie tiède avec une cuillère de crème fraîche', ingredients: ['Pomme', 'Caramel', 'Pâte Feuilletée'], image: '/menu/i14.jpg', tags: [] },
          { id: 'i21', name: 'Mousse Passion', price: '8.00', desc: 'Mousse légère et aérienne au fruit de la passion frais et éclats de pistache', ingredients: ['Fruit de la Passion', 'Pistache'], image: '/menu/i21.jpg', tags: ['GF'] },
          { id: 'i22', name: 'Pavlova aux Fruits', price: '12.00', desc: 'Meringue croquante à l’extérieur et moelleuse à l’intérieur, crème légère et fruits de saison', ingredients: ["Blancs d'Œufs", 'Sucre', 'Fruits'], image: '/menu/i22.jpg', tags: ['GF'] },
        ],
      },
    ],
  },
};

const botScenarios = [
  {
    id: 'reserva',
    shortLabel: 'Reservar mesa',
    question: 'Quero reservar mesa para hoje às 20h30 (4 pessoas)',
    reply:
      'Olá! Com todo o gosto. Temos disponibilidade hoje às 20h30 para 4 pessoas na sala principal ou esplanada coberta. Em que nome fica a reserva?',
    tag: 'Reserva qualificada em 2 seg · Sem intervenção humana',
  },
  {
    id: 'orcamento',
    shortLabel: 'Pedir orçamento',
    question: 'Quais são os vossos serviços e como peço orçamento?',
    reply:
      'Olá! Bem-vindo. Trabalhamos com 3 opções principais. Se indicar o que procura e a sua localidade, envio já os valores base e agendo uma chamada rápida com a equipa!',
    tag: 'Triagem comercial 24/7 · Lead pronta a fechar',
  },
  {
    id: 'horario',
    shortLabel: 'Horário e menu',
    question: 'Estão abertos agora? Onde posso ver o menu / catálogo?',
    reply:
      'Estamos abertos hoje até às 22h30! Pode consultar aqui o nosso menu digital em 4 idiomas: menu.oseunegocio.pt. Estamos na Rua Principal, n.º 24. Até já!',
    tag: 'Dúvida frequente resolvida automaticamente',
  },
];

function formatPrice(price: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(Number(price));
}

export default function InteractiveDemo() {
  const [mode, setMode] = useState<'menu' | 'bot'>('menu');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [lang, setLang] = useState<LangKey>('pt');
  const [sectionId, setSectionId] = useState<string>('sec-1');
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [showAllMobileDishes, setShowAllMobileDishes] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement>(null);

  function selectCategory(id: string) {
    setSectionId(id);
    setSelectedDishId(null);
    setShowAllMobileDishes(false);
    if (menuScrollRef.current) {
      menuScrollRef.current.scrollTop = 0;
    }
  }

  function selectDish(id: string | null) {
    setSelectedDishId(id);
    if (menuScrollRef.current) {
      menuScrollRef.current.scrollTop = 0;
    }
  }

  const scenario = botScenarios[scenarioIndex];
  const copy = UI_COPY[lang];
  const sections = MENU_DATA[lang].sections;
  const activeSectionIndex = Math.max(
    0,
    sections.findIndex(sec => sec.id === sectionId)
  );
  const activeSection = sections[activeSectionIndex] || sections[0];
  const selectedDish = selectedDishId
    ? sections.flatMap(s => s.items.map(item => ({ item, sectionName: s.name }))).find(entry => entry.item.id === selectedDishId) || null
    : null;

  return (
    <div className="interactive-demo" aria-label="Demonstração interativa de Menu Online e WhatsApp Bot">
      <div className="interactive-demo-copy">
        <p className="google-presence-caption">Experimente na prática · Demonstração ao vivo</p>
        <h3>Veja como o seu cliente<br />é recebido no telemóvel.</h3>
        <p>
          Interaja diretamente com o nosso <strong>Menu Online Editorial</strong> (com fotografias reais, 4 idiomas e ficha de detalhe de cada prato) ou teste o <strong>WhatsApp Bot 24/7</strong>.
        </p>

        <div className="demo-mode-tabs" role="tablist" aria-label="Escolher demonstração">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'menu'}
            className="demo-mode-tab"
            onClick={() => setMode('menu')}
          >
            <UtensilsCrossed size={16} />
            <span><span className="demo-tab-verb">Simular </span>Menu Online</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'bot'}
            className="demo-mode-tab"
            onClick={() => setMode('bot')}
          >
            <Bot size={16} />
            <span><span className="demo-tab-verb">Simular </span>WhatsApp Bot</span>
          </button>
        </div>

        {mode === 'menu' ? (
          <div className="demo-prompts">
            <span className="google-presence-caption">Explore as categorias ou mude o idioma para turistas:</span>
            <div className="demo-menu-cats">
              {sections.map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  className="demo-cat-btn"
                  aria-pressed={activeSection.id === sec.id && !selectedDish}
                  onClick={() => selectCategory(sec.id)}
                >
                  {sec.name}
                </button>
              ))}
            </div>

            <div className="demo-lang-bar">
              <span className="demo-lang-label">
                <Globe size={14} /> Idioma do menu:
              </span>
              {(['pt', 'en', 'es', 'fr'] as LangKey[]).map(code => (
                <button
                  key={code}
                  type="button"
                  className="demo-lang-chip"
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            <p className="demo-menu-note">
              <QrCode size={15} /> Clique em qualquer prato no menu ao lado para abrir a ficha completa com fotografia, ingredientes e alergénios.
            </p>
          </div>
        ) : (
          <div className="demo-prompts">
            <span className="google-presence-caption">Clique numa mensagem de cliente para testar a resposta:</span>
            {botScenarios.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className="demo-prompt-btn"
                aria-pressed={scenarioIndex === idx}
                onClick={() => setScenarioIndex(idx)}
              >
                <MessageCircle size={15} />
                <span>«{item.question}»</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="interactive-demo-stage">
        {mode === 'menu' ? (
          <div className="dr-menu-device" lang={copy.locale}>
            <header className="dr-menu-header">
              <div className="dr-menu-header-inner">
                <button
                  type="button"
                  className="dr-menu-brand"
                  onClick={() => selectDish(null)}
                >
                  <span className="dr-menu-brand-mark" aria-hidden="true">D&amp;R</span>
                  <span>Draft &amp; Rise</span>
                </button>
                <div className="dr-menu-language-control">
                  <label htmlFor="demo-menu-lang">{copy.language}</label>
                  <select
                    id="demo-menu-lang"
                    value={lang}
                    onChange={e => setLang(e.target.value as LangKey)}
                    aria-label={copy.language}
                  >
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
              <nav className="dr-menu-category-nav" aria-label="Categorias">
                {sections.map(sec => (
                  <button
                    key={sec.id}
                    type="button"
                    className="dr-menu-category-button"
                    aria-current={activeSection.id === sec.id}
                    onClick={() => selectCategory(sec.id)}
                  >
                    {sec.name}
                  </button>
                ))}
              </nav>
            </header>

            {selectedDish ? (
              <div ref={menuScrollRef} className="dr-menu-detail-panel" role="region" aria-label={copy.dishDetails}>
                <div className="dr-menu-detail-toolbar">
                  <span>{copy.dishDetails}</span>
                  <button
                    type="button"
                    className="dr-menu-close-button"
                    aria-label={copy.close}
                    onClick={() => selectDish(null)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <Image
                  src={selectedDish.item.image}
                  alt={selectedDish.item.name}
                  className="dr-menu-detail-image"
                  width={720}
                  height={480}
                />
                <div className="dr-menu-detail-info">
                  <p className="dr-menu-detail-category">{selectedDish.sectionName}</p>
                  <div className="dr-menu-detail-heading">
                    <h4>{selectedDish.item.name}</h4>
                    <span>{formatPrice(selectedDish.item.price, copy.locale)}</span>
                  </div>
                  <p className="dr-menu-detail-desc">{selectedDish.item.desc}</p>
                  {selectedDish.item.tags.length > 0 && (
                    <div className="dr-menu-item-tags">
                      {selectedDish.item.tags.map(tag => (
                        <span key={tag} className="dr-menu-diet-tag">
                          {copy.tags[tag] || tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h5>{copy.ingredients}</h5>
                  <ul className="dr-menu-ingredients-list">
                    {selectedDish.item.ingredients.map(ing => (
                      <li key={ing}>{ing}</li>
                    ))}
                  </ul>
                  <div className="dr-menu-allergy-note">
                    <h5>{copy.allergens}</h5>
                    <p>{copy.allergyDetail}</p>
                  </div>
                  <button
                    type="button"
                    className="dr-menu-back-button"
                    onClick={() => selectDish(null)}
                  >
                    {copy.back}
                  </button>
                </div>
              </div>
            ) : (
              <div ref={menuScrollRef} className="dr-menu-main">
                <div className="dr-menu-intro">
                  <div>
                    <h4>{copy.menu}</h4>
                    <p>{copy.intro}</p>
                  </div>
                  <span className="dr-menu-intro-note">{copy.detailHint}</span>
                </div>

                <div className="dr-menu-category-heading">
                  <div className="dr-menu-category-copy">
                    <h5>{activeSection.name}</h5>
                    <p>{copy.sections[activeSectionIndex]}</p>
                    <span className="dr-menu-category-count">
                      {activeSection.items.length} {copy.dishes} · Toque num prato
                    </span>
                  </div>
                  <Image
                    src={activeSection.image}
                    alt={activeSection.name}
                    className="dr-menu-category-image"
                    width={320}
                    height={160}
                  />
                </div>

                <ul className="dr-menu-items-list">
                  {activeSection.items.map((item, idx) => (
                    <li
                      key={item.id}
                      className={idx >= 3 && !showAllMobileDishes ? 'is-mobile-extra' : undefined}
                    >
                      <button
                        type="button"
                        className="dr-menu-item-row"
                        onClick={() => selectDish(item.id)}
                      >
                        <Image
                          className="dr-menu-item-thumbnail"
                          src={item.image}
                          alt=""
                          width={72}
                          height={72}
                        />
                        <span className="dr-menu-item-main">
                          <span className="dr-menu-item-heading">
                            <span className="dr-menu-item-name">{item.name}</span>
                            <span className="dr-menu-item-price">
                              {formatPrice(item.price, copy.locale)}
                            </span>
                          </span>
                          <span className="dr-menu-item-desc">
                            {item.ingredients.join(', ')}
                          </span>
                          {item.tags.length > 0 && (
                            <span className="dr-menu-item-tags">
                              {item.tags.map(tag => (
                                <span key={tag} className="dr-menu-diet-tag">
                                  {copy.tags[tag] || tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                        <span className="dr-menu-row-arrow" aria-hidden="true">›</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {activeSection.items.length > 3 && (
                  <button
                    type="button"
                    className="dr-menu-more-btn"
                    onClick={() => setShowAllMobileDishes(prev => !prev)}
                  >
                    {showAllMobileDishes
                      ? 'Mostrar menos pratos ↑'
                      : `Ver todos os ${activeSection.items.length} ${copy.dishes} desta categoria ↓`}
                  </button>
                )}

                <footer className="dr-menu-footer">
                  <p>{copy.allergyNote}</p>
                  <span className="dr-menu-footer-brand">Draft &amp; Rise</span>
                </footer>
              </div>
            )}
          </div>
        ) : (
          <div className="phone-mockup is-bot">
            <div className="phone-header">
              <span className="status-dot status-dot-pulse" />
              <div>
                <strong>Assistente WhatsApp · O Seu Negócio</strong>
                <span>Online agora · Resposta automática</span>
              </div>
            </div>
            <div className="phone-bot-quick-pills" role="group" aria-label="Testar pergunta de cliente">
              {botScenarios.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  className="phone-bot-pill"
                  aria-pressed={scenarioIndex === idx}
                  onClick={() => setScenarioIndex(idx)}
                >
                  {item.shortLabel}
                </button>
              ))}
            </div>
            <div className="phone-chat">
              <div className="chat-bubble is-user">
                <p>{scenario.question}</p>
                <span>Cliente · agora mesmo</span>
              </div>
              <div className="chat-bubble is-bot-reply">
                <p>{scenario.reply}</p>
                <span>Bot Automático · resposta em 1s ✓✓</span>
              </div>
            </div>
            <div className="phone-footer">
              <Check size={14} />
              <span>{scenario.tag}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
