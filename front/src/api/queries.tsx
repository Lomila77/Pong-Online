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

export async function getUser() {
  try {
    const response = await fetch(
      'http://localhost:3333/users/profil', {
        method: 'GET',
        credentials: 'include',
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
          credentials: 'include',
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

export async function backRequestTest(url: string, method: string, params?: any) {
  try {
    const reqOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: params ? JSON.stringify(params) : undefined
    };
    const response = await fetch('http://localhost:5173/' + url, reqOptions);
    return response.status === 200 ? await response.json() : {}
  }
  catch (error) {
    console.log(error);
  }
}

/* ****************************************************************************
  * backRequest
    * exemple d'utilisation :
      try {
        const response: backResInterface = await backRequest('endpoint', 'GET', params);
        console.log(response.pseudo)
        }
      } catch (error){...}

    * params :
      - ce sont les elements a transmettre au back en fonction du endpoint emprunte. Type : frontReqInterface.

    * Return :
      - la reponse du back devrait etre un backResInterface comme dans l'exemple
      - mais il est egalement possible de faire : const result: { pseudo: string, autre: string } = await backRequest(..., ..., ...);
      - en fonction du endpoint emprunte, les champs peuvent etre undefined
      
    * erreur :
      - si error, check terminal
**************************************************************************** */

export interface frontReqInterface {
  pseudo?: string;
  avatar?: any;
  isF2Active?: boolean;
}

export interface backResInterface {
  pseudo?: string;
  isOk?: boolean;
  avatar?: any;
  isF2Active?: boolean;
  friends?: string[];
  allUser?: User[]
}

export async function backRequest(url: string, method: string, params?: frontReqInterface) {
  try {
    const reqOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: params ? JSON.stringify(params) : undefined
    };
    const response = await fetch('http://localhost:3333/' + url, reqOptions);

    return response.ok ? await response.json() : {}
  }
  catch (error) {
    console.log(error);
  }
}

