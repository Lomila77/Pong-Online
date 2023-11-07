export const createUser = async (params: any) => {
  try {
    const response = await fetch(
      'http://localhost:3333/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );
    return response.status === 200
      ? await response.json()
      : {};
  } catch (error) {
    console.log(error);
  }
};


export interface User {
  pseudo: string;
  avatar: any;
  isF2Active: boolean;
}

export async function getUser(): Promise<User> {
  try {
    const response = await fetch(
      'http://localhost:3333/user/profil', {
        method: 'GET',
      }
    );
    if (!response.ok) {
      throw new Error('Échec de la requête');
    }
    const data: User = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      "Une erreur s'est produite lors de la récupération des données : " +
        error.message
    );
  }
}

export async function backRequest(url: string, method: string, params?: any) {
  try {
    const reqOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: params ? JSON.stringify(params) : undefined
    };
    const response = await fetch('http://localhost:3333/' + url, reqOptions);
    return response.status === 200 ? await response.json() : {}
  }
  catch (error) {
    console.log(error);
  }
}
