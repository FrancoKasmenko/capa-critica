import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-6xl text-critico">1</p>
      <h1 className="text-2xl">Pifia crítica: esta página no existe</h1>
      <Link href="/" className="font-bold text-neon underline-offset-4 hover:underline">Volver al catálogo</Link>
    </div>
  );
}
