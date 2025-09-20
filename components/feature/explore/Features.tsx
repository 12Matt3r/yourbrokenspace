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
  <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
    {features.map((f) => {
      const isDecorative = f.decorative === true || f.altText === '';
      return (
        <li key={f.title} className="flex flex-col gap-3 pb-3">
          <div className="w-full relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={f.image}
              alt={isDecorative ? '' : f.altText}
              aria-hidden={isDecorative ? true : undefined}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-fg">{f.title}</p>
            <p className="text-sm text-muted">{f.description}</p>
          </div>
        </li>
      );
    })}
  </ul>
);
