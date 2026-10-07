// 저장된 토큰 조회
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

// 저장된 리프레시 토큰 조회
export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

// 액세스 토큰과 리프레시 토큰을 함께 저장
export function saveTokens(tokens: { accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number }): void {
  const now = Date.now();
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  localStorage.setItem('accessTokenExpiresAt', String(now + tokens.expiresIn * 1000));
  localStorage.setItem('refreshTokenExpiresAt', String(now + tokens.refreshExpiresIn * 1000));
}

// 저장된 액세스 토큰과 리프레시 토큰을 모두 삭제
export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessTokenExpiresAt');
  localStorage.removeItem('refreshTokenExpiresAt');
}
