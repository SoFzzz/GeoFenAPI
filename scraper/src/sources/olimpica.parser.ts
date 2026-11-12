/** Oferta válida de un producto en Olímpica. */
export interface OlimpicaOffer {
  price: number;
  listPrice?: number;
  url: string;
}

interface VtexProduct {
  linkText?: string;
  items?: {
    ean?: string;
    sellers?: {
      commertialOffer?: {
        Price?: number;
        ListPrice?: number;
        AvailableQuantity?: number;
      };
    }[];
  }[];
}

/**
 * Extrae la oferta de la respuesta de búsqueda por EAN del catálogo VTEX.
 * Devuelve null si no hay resultado, el precio no es positivo o no hay stock.
 */
export function parseOlimpicaOffer(body: unknown, ean: string): OlimpicaOffer | null {
  if (!Array.isArray(body)) return null;

  // La búsqueda puede devolver productos ajenos: solo vale el que tenga ese EAN
  let product: VtexProduct | undefined;
  let item: NonNullable<VtexProduct['items']>[number] | undefined;
  for (const candidate of body as VtexProduct[]) {
    item = candidate.items?.find((i) => i.ean === ean);
    if (item) {
      product = candidate;
      break;
    }
  }
  if (!product?.linkText || !item) return null;

  const offer = item?.sellers?.[0]?.commertialOffer;
  if (!offer) return null;

  const price = Number(offer.Price);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!(Number(offer.AvailableQuantity) > 0)) return null;

  const listPrice = Number(offer.ListPrice);
  return {
    price,
    listPrice: Number.isFinite(listPrice) && listPrice > 0 ? listPrice : undefined,
    url: `https://www.olimpica.com/${product.linkText}/p`,
  };
}
