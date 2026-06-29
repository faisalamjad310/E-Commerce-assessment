import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  processPayment(_amountCents: number): { ref: string; status: 'success' } {
    // Mock payment — generate a random reference; no external call
    const hex = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .toUpperCase()
      .padStart(8, '0');
    return { ref: `MOCK-${hex}`, status: 'success' };
  }
}
