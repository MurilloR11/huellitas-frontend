interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={['rounded-full object-cover', sizeClasses[size], className].join(' ')}
      />
    );
  }

  return (
    <div
      aria-label={alt}
      className={[
        'rounded-full bg-orange-100 text-orange-600 font-semibold',
        'flex items-center justify-center',
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {getInitials(alt)}
    </div>
  );
}
