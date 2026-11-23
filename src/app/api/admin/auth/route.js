import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  isAuthenticated,
  validateLogin,
} from "../../../../lib/adminAuth";

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!validateLogin(username, password)) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = createSessionToken(username.trim());
    const response = NextResponse.json({
      success: true,
      authenticated: true,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias logado no computador
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro ao processar login." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    authenticated: false,
  });

  response.cookies.delete(COOKIE_NAME);
  return response;
}
