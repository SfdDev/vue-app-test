export interface CaptchaVerifier {
  verify(token: string): Promise<boolean>;
}
