import React from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

export type Feature = {
  title: string;
  description: string;
  image: StaticImageData | string;
  altText: string;
  decorative?: boolean;
};

export const Features: React.FC<{ features: Feature[] }> = ({ features }) => (
  <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    {features.map((f) => {
      const isDecorative = f.decorative === true || f.altText === '';
      return (
        <li key={f.title} className="rounded-xl border p-4">
          <div className="mb-3 overflow-hidden rounded-lg">
            <Image
              src={f.image}
              alt={isDecorative ? '' : f.altText}
              aria-hidden={isDecorative ? true : undefined}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">{f.title}</h3>
          <p className="text-sm text-neutral-500">{f.description}</p>
        </li>
      );
    })}
  </ul>
);
