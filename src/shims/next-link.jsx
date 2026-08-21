import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href = '#', to, children, className, style, onClick, target, rel, ...props }) {
  const targetUrl = to || href || '#';
  const urlStr = typeof targetUrl === 'object' ? targetUrl.pathname || '#' : String(targetUrl);

  if (
    urlStr.startsWith('http://') ||
    urlStr.startsWith('https://') ||
    urlStr.startsWith('mailto:') ||
    urlStr.startsWith('tel:') ||
    urlStr.startsWith('whatsapp:') ||
    urlStr.startsWith('#') ||
    target === '_blank'
  ) {
    return (
      <a
        href={urlStr}
        className={className}
        style={style}
        onClick={onClick}
        target={target}
        rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink
      to={urlStr}
      className={className}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
