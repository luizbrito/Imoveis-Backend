export type PropertySimilarityInput = {
  country?: string | null;
  state?: string | null;
  city?: string | null;
  areaHa: number;
  pricePerHa: number;
};

export function publicPropertySimilarRank(
  reference: PropertySimilarityInput,
  candidate: PropertySimilarityInput,
) {
  let rank = 0;
  if (candidate.country === reference.country) rank += 30;
  if (candidate.state === reference.state) rank += 25;
  if (candidate.city === reference.city) rank += 15;
  if (
    reference.areaHa > 0 &&
    Math.abs(candidate.areaHa - reference.areaHa) / reference.areaHa <= 0.3
  )
    rank += 15;
  if (
    reference.pricePerHa > 0 &&
    Math.abs(candidate.pricePerHa - reference.pricePerHa) /
      reference.pricePerHa <=
      0.25
  )
    rank += 10;
  return rank;
}
