import type { CaptchaVerifier } from '../../ports/captcha.verifier';

export class GoogleRecaptchaVerifier implements CaptchaVerifier {
  constructor(private readonly secretKey: string) {}

  async verify(token: string): Promise<boolean> {
    try {
      const response = await $fetch<{ success: boolean }>('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        query: {
          secret: this.secretKey,
          response: token,
        },
      });
      return response.success;
    } catch {
      return false;
    }
  }
}
