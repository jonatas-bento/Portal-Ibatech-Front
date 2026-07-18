// src/app/core/utils/forma-pagamento.helper.ts
import { FormaPagamento } from '../models/venda.model';

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  Dinheiro: 'Dinheiro',
  Pix: 'Pix',
  CartaoDebito: 'Cartão de débito',
  CartaoCredito: 'Cartão de crédito'
};

export function getFormaPagamentoLabel(
  forma: FormaPagamento | null | undefined
): string {
  return forma
    ? (FORMA_PAGAMENTO_LABELS[forma] ?? 'Não informada')
    : 'Não informada';
}
