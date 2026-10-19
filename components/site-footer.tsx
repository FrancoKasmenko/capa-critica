import Link from "next/link";
import { WhatsappIcon } from "@/components/whatsapp-icon";
import { negocio, waLink } from "@/lib/tienda";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-noche/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-heading text-lg">CAPA <span className="text-critico">CRÍTICA</span></p>
          <p className="mt-2 text-muted-foreground">Impresión 3D friki hecha en Montevideo. Retiro en {negocio.zona}.</p>
        </div>
        <div className="grid content-start gap-2">
          <a href={waLink("¡Hola Capa Crítica! Tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold hover:text-neon">
            <WhatsappIcon className="size-4" /> WhatsApp {negocio.whatsappVisible}
          </a>
          <a href={`https://www.instagram.com/${negocio.instagram}/`} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-neon">
            Instagram @{negocio.instagram}
          </a>
        </div>
        <div className="grid content-start gap-2 text-muted-foreground">
          <p>Los diseños son de sus autores, con licencias Creative Commons que permiten la venta de impresiones. Cada ficha cita autor, link y licencia.</p>
          <Link href="/tablero/" className="w-fit text-xs underline-offset-4 hover:underline">Tablero del experimento</Link>
        </div>
      </div>
    </footer>
  );
}
