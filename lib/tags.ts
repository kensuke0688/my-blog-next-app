import { prisma } from "@/lib/prisma";

export async function resolveTagIds(names: string[]): Promise<number[]> {
  const uniqueNames = Array.from(
    new Map(
      names
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
        .map((name) => [name.toLowerCase(), name] as const)
    ).values()
  );

  if (uniqueNames.length === 0) return [];

  const existing = await prisma.tag.findMany({
    where: {
      OR: uniqueNames.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
  });
  const existingByLowerName = new Map(
    existing.map((tag) => [tag.name.toLowerCase(), tag])
  );

  const namesToCreate = uniqueNames.filter(
    (name) => !existingByLowerName.has(name.toLowerCase())
  );
  const created = await Promise.all(
    namesToCreate.map((name) => prisma.tag.create({ data: { name } }))
  );

  return [...existing, ...created].map((tag) => tag.id);
}
