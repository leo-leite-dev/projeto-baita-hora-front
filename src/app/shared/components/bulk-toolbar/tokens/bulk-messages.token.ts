import { InjectionToken } from "@angular/core";
import { BulkMessages } from "../models/bulk-messages";
import { DEFAULT_BULK_MESSAGES } from "../defaults/bulk-messages.defaults";

export const BULK_MESSAGES = new InjectionToken<BulkMessages>(
    'BULK_MESSAGES',
    { providedIn: 'root', factory: () => DEFAULT_BULK_MESSAGES }
);