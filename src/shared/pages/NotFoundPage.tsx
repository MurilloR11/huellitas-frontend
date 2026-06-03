// Replace with a real dog photo for production
const DOG_PHOTO = 'https://placedog.net/400/400?r';

const ORANGE_TINT = '#FFE5D2';
const INK         = '#241F1B';
const INK_SOFT    = '#6B625B';

export default function NotFoundPage() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{
        fontFamily: "'Poppins', system-ui, -apple-system, sans-serif",
        background: `
          radial-gradient(110% 80% at 85% -5%, #FFF7F0 0%, rgba(255,247,240,0) 55%),
          radial-gradient(110% 80% at 12% 108%, #FFF4EB 0%, rgba(255,247,240,0) 52%),
          #FFFCF9
        `,
        WebkitFontSmoothing: 'antialiased',
        padding: '40px 24px',
        color: INK,
      }}
    >
      <main
        className="w-full flex flex-col items-center text-center"
        style={{ maxWidth: 560 }}
      >
        {/* 404 — "0" is the dog portrait */}
        <Numeral />

        {/* Headline */}
        <h1
          className="font-bold mt-4.5 mb-0"
          style={{
            fontSize: 'clamp(27px, 6vw, 34px)',
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}
        >
          Parece que esta página se fue de paseo
        </h1>

        {/* Subtitle */}
        <p
          className="mt-3.5 mb-0 mx-auto"
          style={{
            fontSize: 'clamp(15.5px, 3.5vw, 17px)',
            lineHeight: 1.6,
            color: INK_SOFT,
            maxWidth: '38ch',
          }}
        >
          La dirección que buscabas no existe o cambió de lugar.
          No te preocupes: te ayudamos a volver al camino.
        </p>
      </main>
    </div>
  );
}

function Numeral() {
  const portraitSize = 'clamp(116px, 22vw, 178px)';

  return (
    <div
      className="flex items-center justify-center select-none"
      style={{
        gap: 8,
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        fontSize: 'clamp(120px, 25vw, 190px)',
      }}
      aria-label="Error 404"
    >
      <GradientFour />

      {/* 0 = dog portrait */}
      <span
        className="relative flex-none grid place-items-center"
        style={{ width: portraitSize, height: portraitSize }}
      >
        {/* Dashed ring */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{ inset: -9, border: `3px dashed ${ORANGE_TINT}` }}
        />

        {/* Dog photo */}
        <img
          src={DOG_PHOTO}
          alt=""
          aria-hidden="true"
          className="rounded-full object-cover object-center"
          style={{
            width: portraitSize,
            height: portraitSize,
            boxShadow: 'inset 0 0 0 6px #fff, 0 16px 36px -16px rgba(214,95,19,.45)',
          }}
        />

      </span>

      <GradientFour />
    </div>
  );
}

function GradientFour() {
  return (
    <span
      style={{
        background: 'linear-gradient(160deg, #F8843A 0%, #F2701C 55%, #D85F13 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      4
    </span>
  );
}

