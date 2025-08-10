import CryptoJS from 'crypto-js';

/**
 * Генерирует URL для Gravatar аватара
 * @param email - Email пользователя
 * @param size - Размер аватара (по умолчанию 80px)
 * @param defaultImage - Тип изображения по умолчанию
 * @returns URL для Gravatar аватара
 */
export function getGravatarUrl(
  email: string, 
  size: number = 80, 
  defaultImage: 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank' = 'identicon'
): string {
  if (!email) {
    return `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=${size}&d=${defaultImage}`;
  }

  // Приводим email к нижнему регистру и убираем пробелы
  const normalizedEmail = email.toLowerCase().trim();
  
  // Создаем MD5 хеш
  const hash = CryptoJS.MD5(normalizedEmail).toString();
  
  // Формируем URL
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

/**
 * Компонент Gravatar аватара
 */
interface GravatarProps {
  email: string;
  size?: number;
  defaultImage?: 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';
  className?: string;
  alt?: string;
}

export function Gravatar({ 
  email, 
  size = 80, 
  defaultImage = 'identicon', 
  className = '', 
  alt = 'Avatar' 
}: GravatarProps) {
  const gravatarUrl = getGravatarUrl(email, size, defaultImage);
  
  return (
    <img
      src={gravatarUrl}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      loading="lazy"
    />
  );
}