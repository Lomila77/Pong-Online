export const createUser = async (params) => {
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