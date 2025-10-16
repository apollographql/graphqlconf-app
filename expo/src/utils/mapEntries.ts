export function mapEntries<In, Out, Keys extends string, Prefix extends string>(
  obj: Record<Keys, In>,
  prefix: Prefix,
  fn: (v: In, k: Keys) => Out
) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      `${prefix}${k}`,
      fn(v as In, k as Keys),
    ])
  ) as Record<`${Prefix}${Keys}`, Out>;
}
