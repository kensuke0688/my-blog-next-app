export type ContactRequestBody = {
  name: string;
  email: string;
  message: string;
};

export type ContactResponseBody = {
  message: string;
};

export async function POST(request: Request) {
  const body: ContactRequestBody = await request.json();

  console.log("[contact] received inquiry:", body);

  return Response.json({ message: "success" } satisfies ContactResponseBody, {
    status: 200,
  });
}
