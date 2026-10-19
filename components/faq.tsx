import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RECARGO_PERSONALIZACION, negocio, pesos } from "@/lib/tienda";

const preguntas = [
  {
    q: "¿Cómo pago?",
    a: "Por transferencia bancaria o con un link de Mercado Pago que te mandamos por WhatsApp. Cuando confirmamos el pedido te pasamos los datos de la cuenta o el link.",
  },
  {
    q: "¿Qué es “en stock” y qué es “a pedido”?",
    a: "Lo que está en stock ya está impreso: lo retirás en el día. Lo que está a pedido lo imprimimos para vos en 48–72 h; para arrancar pedimos una seña del 50 % y el resto lo pagás al retirar.",
  },
  {
    q: "¿Dónde retiro?",
    a: `En ${negocio.zona}. Te pasamos la dirección y el horario por WhatsApp al confirmar. También podemos coordinar entrega en Montevideo (el envío o cadete corre por tu cuenta).`,
  },
  {
    q: "¿Puedo elegir los colores?",
    a: "Sí. Cada ficha sugiere colores, pero lo hacemos en el color o la combinación que quieras, sin recargo. Imprimimos multicolor.",
  },
  {
    q: "¿Qué se puede personalizar?",
    a: `En los productos marcados como personalizables agregamos un nombre, gamertag o texto corto por +${pesos(RECARGO_PERSONALIZACION)} por pieza. Las piezas personalizadas se hacen a pedido.`,
  },
  {
    q: "¿Hacen personajes de anime, juegos o películas?",
    a: "No hacemos personajes ni logos con marca registrada. Sí tenemos criaturas originales, muchas en estilo anime, y accesorios genéricos (dados, deck boxes, soportes). Si buscás algo puntual, escribinos y te proponemos una alternativa.",
  },
  {
    q: "¿De quién son los diseños?",
    a: "De sus autores. Usamos modelos publicados con licencias Creative Commons que permiten vender impresiones (CC0, CC BY, CC BY-SA y CC BY-ND). En cada ficha está el autor, el link al modelo original y la licencia.",
  },
  {
    q: "¿Las fotos son de las piezas reales?",
    a: "Mientras no tengamos foto propia mostramos la imagen del autor del modelo (está indicado en la ficha). Las vamos reemplazando por fotos de nuestras impresiones. El color y el acabado pueden variar un poco.",
  },
  {
    q: "¿Qué material usan?",
    a: "PLA, un plástico rígido y liviano. Es para uso decorativo y de escritorio: no lo dejes al sol dentro del auto ni cerca de fuentes de calor.",
  },
];

export function Faq() {
  return (
    <Accordion className="mt-6">
      {preguntas.map((p) => (
        <AccordionItem key={p.q} value={p.q} className="border-border">
          <AccordionTrigger className="py-4 text-base font-bold hover:no-underline">{p.q}</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{p.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
