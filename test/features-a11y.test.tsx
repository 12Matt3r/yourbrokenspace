import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Features } from '../components/feature/explore/Features';
import type { Feature } from '@/components/feature/explore/Features';

// mock Next/Image to plain <img>
vi.mock('next/image', () => ({
  default: (props: any) => {
    // The 'fill' prop is boolean and not valid on a regular <img>
    // eslint-disable-next-line no-unused-vars
    const { fill, ...rest } = props;
    return <img {...rest} />;
  }
}));

describe('Features images have correct alt text', () => {
  it('uses descriptive alt for content images and empty alt for decorative', () => {
    const features: Feature[] = [
      {
        title: 'One',
        description: 'desc',
        image: '/img/one.jpg',
        altText: 'Player stands in a doorway with fog curling along the floor.',
      },
      {
        title: 'Two',
        description: 'desc',
        image: '/img/two.jpg',
        altText: '',
        decorative: true,
      },
    ];

    render(<Features features={features} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    const firstItemImg = within(listItems[0]).getByRole('img');
    expect(firstItemImg).toHaveAttribute('alt', features[0].altText);

    const secondItemImg = listItems[1].querySelector('img');
    expect(secondItemImg).not.toBeNull();
    expect(secondItemImg).toHaveAttribute('alt', '');
    expect(secondItemImg).toHaveAttribute('aria-hidden', 'true');
  });
});
