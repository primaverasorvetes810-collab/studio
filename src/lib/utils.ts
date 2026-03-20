import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Product } from "./data/products";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  const priceString = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2, // Always show cents to split
  }).format(price);

  const parts = priceString.split(',');
  const integerPart = parts[0];
  const fractionPart = parts[1];

  return React.createElement(
    React.Fragment,
    null,
    integerPart,
    React.createElement(
      'span',
      { className: 'text-[0.5em] font-medium align-baseline tracking-tight' },
      `,${fractionPart}`
    )
  );
}

export function formatPriceAsString(price: number) {
  const isInteger = price % 1 === 0;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Gets the correct image URL for a product.
 * It handles the transition from old image IDs to new direct URLs.
 * 1. Checks if product.imageUrl is a valid URL.
 * 2. If not, assumes it's an ID and looks it up in the placeholder data.
 * 3. Falls back to a generic placeholder if no match is found.
 */
export const getProductImageUrl = (product: { imageUrl?: string | null }): string => {
  const defaultImageUrl = 'https://placehold.co/600x400/EEE/31343C?text=Imagem+Indisponível';
  
  if (!product.imageUrl || product.imageUrl.trim() === '') {
    return defaultImageUrl;
  }

  // Check if it's a valid URL
  try {
    new URL(product.imageUrl);
    return product.imageUrl; // It's a valid URL
  } catch (_) {
    // If not a URL, assume it's an old ID and look it up
    const placeholder = PlaceHolderImages.find(p => p.id === product.imageUrl);
    if (placeholder) {
      return placeholder.imageUrl;
    }
  }
  
  // If lookup fails or any other error, return default
  return defaultImageUrl;
}
