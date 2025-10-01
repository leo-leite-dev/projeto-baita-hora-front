import { InjectionToken } from '@angular/core';
import { BulkMessages } from '../models/bulk-messages';

export const DEFAULT_BULK_MESSAGES: BulkMessages = {
    activated: 'Itens ativados.',
    deactivated: 'Itens desativados.',
    deleteSuccess: 'Item excluído com sucesso.',
    deleteFail: 'Falha ao excluir. Tente novamente.',
    lockEnableMsg: 'Ação "Desativar" está bloqueada para a seleção atual.',
    lockDisableMsg: 'Ação "Ativar" está bloqueada para a seleção atual.',
};