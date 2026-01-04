export function validateData(token: string, secret: string, getData: (token: string, secret: string) => string): unknown {
  try {
    const { data, iat, exp } = JSON.parse(getData(token, secret));
    if (exp && Date.now() > iat + exp) throw new Error("Expired token!");
    return data;
  } catch (error) {
    throw new Error("Invalid token or secret!");
  }
}
