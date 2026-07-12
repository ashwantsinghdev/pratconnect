// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function getId(obj: any): string | undefined {
  if (!obj) return undefined;
  return obj.id ?? obj._id;
}
