declare module "next/server" {
  export class NextResponse {
    static json(body: unknown, init?: ResponseInit): Response;
  }
}