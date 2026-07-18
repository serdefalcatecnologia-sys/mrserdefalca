import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-900 font-sans">
      
      {/* Imagen de fondo a pantalla completa */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/imagen1.png"
          alt="Fondo de recolección y reciclaje Serdefalca"
          fill
          className="object-cover opacity-40"
          priority
        />
      </div>

      {/* Tarjeta de Inicio de Sesión (Cristal / Glassmorphism) */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:bg-zinc-950/90 sm:p-10">
        
        {/* Encabezado y Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Se aumentó el tamaño a h-48 y w-80 */}
          <div className="relative mb-6 h-20 w-110">
            <Image
              src="/logo1.png"
              alt="Logo Oficial Serdefalca"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Portal Serdefalca
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
          </p>
        </div>

        {/* Formulario */}
        <form className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="operador@serdefalca.gob.ve"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            />
          </div>

          

          {/* Botón de Acción */}
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            Ingresar al Sistema
          </button>
        </form>

        {/* Pie de página de la tarjeta */}
        <div className="mt-8 border-t border-zinc-200 pt-6 text-center dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Gobernación del Estado Falcón. <br />
            Trabajando por un estado más limpio.
          </p>
        </div>
        
      </div>
    </div>
  );
}
