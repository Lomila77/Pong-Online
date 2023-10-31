export const createUser = async (params: any) => {
  try {
    const response = await fetch('http://localhost:3333/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    return response.status === 200 ? await response.json() : {}
  } catch (error) {
    console.log(error)
  }
}

export interface AuthResponse {
  token: string;
}

export async function authentificationAPI42(): Promise<AuthResponse> {
  const response = await fetch('http://localhost:3333/auth/login', {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error('Échec de la requête');
  }
  const data: AuthResponse = await response.json();
  return data;
}