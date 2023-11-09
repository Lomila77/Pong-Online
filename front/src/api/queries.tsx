export const createUser = async (params: any) => {
  try {
    const response = await fetch(
      'http://localhost:3333/auth/update',
      {
        method: 'POST',
        credentials: 'include',
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
  friends: string[];
}

export async function getUser(): Promise<User> {
  try {
    const response = await fetch(
      'http://localhost:3333/users/profil', {
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

export async function getUsers() {
  try {
    const response = await fetch(
        'http://localhost:3333/users/all', {
          method: 'GET',
        }
    );
    if (!response.ok) {
      throw new Error('Échec de la requête');
    }
    const data: User[] = await response.json();
    return data;
  } catch (error) {
    throw new Error(
        "Une erreur s'est produite lors de la récupération des données : " +
        error.message
    );
  }
}


export interface ApiRet {
  status: number;
  data?: any;
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

    const apiRet: ApiRet = {
      status: response.status,
      data: response.status === 200 ? await response.json() : undefined,
    }
    return apiRet;
    // return response.status === 200 ? await response.json() : {}
  }
  catch (error) {
    console.log(error);
  }
}
/* backRequest est a utiliser de la facon suivante :
  try {
    const response: ApiResponse = await backRequest('endpoint', 'GET');
    if (response.status === 200 && response.data) {
      console.log(response.data);
    }
  } catch (error) ...

*/
